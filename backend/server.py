"""高速公路广告牌管理系统 —— HTTP 服务（Python 标准库实现，零第三方依赖）。

启动：
    python backend/server.py            # 默认 http://127.0.0.1:8000
    python backend/server.py --port 8080
"""
import argparse
import json
import mimetypes
import os
import re
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))

import export as exporter  # noqa: E402
import services as svc  # noqa: E402
from db import UPLOAD_DIR, get_conn, init_db  # noqa: E402

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND = BASE_DIR / "frontend"

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
}


class Api:
    """轻量路由表。"""

    routes = []

    @classmethod
    def add(cls, method, pattern, handler):
        cls.routes.append((method, re.compile(f"^{pattern}$"), handler))

    @classmethod
    def match(cls, method, path):
        for m, rx, handler in cls.routes:
            if m != method:
                continue
            hit = rx.match(path)
            if hit:
                return handler, [unquote(g) for g in hit.groups()]
        return None, None


def route(method, pattern):
    def deco(fn):
        Api.add(method, pattern, fn)
        return fn
    return deco


def with_conn(fn, *args, write=False):
    conn = get_conn()
    try:
        if write:
            with conn:  # 事务：异常自动回滚，保证多表联动一致
                return {"ok": True, "data": fn(conn, *args)}
        return {"ok": True, "data": fn(conn, *args)}
    finally:
        conn.close()


# ---------------------------- 查询接口 ----------------------------

@route("GET", r"/api/options")
def api_options(conn, q=None):
    return svc.options(conn)


@route("GET", r"/api/stats")
def api_stats(conn, q=None):
    return svc.stats(conn)


@route("GET", r"/api/billboards")
def api_billboards(conn, q):
    return svc.list_billboards(conn, q)


@route("GET", r"/api/billboards/(\d+)")
def api_billboard(conn, bid):
    return svc.get_billboard(conn, int(bid))


@route("GET", r"/api/inspections")
def api_inspections(conn, q):
    return svc.list_inspections(conn, q)


@route("GET", r"/api/hazards")
def api_hazards(conn, q):
    return svc.list_hazards(conn, q)


@route("GET", r"/api/work-orders")
def api_orders(conn, q):
    return svc.list_orders(conn, q)


@route("GET", r"/api/attachments")
def api_attachments(conn, q):
    return svc.list_attachments(conn, q)


# ---------------------------- 写入接口 ----------------------------

@route("POST", r"/api/billboards")
def create_billboard(conn, body):
    return svc.create_billboard(conn, body)


@route("PUT", r"/api/billboards/(\d+)")
def update_billboard(conn, bid, body):
    return svc.update_billboard(conn, int(bid), body)


@route("DELETE", r"/api/billboards/(\d+)")
def delete_billboard(conn, bid):
    svc.delete_billboard(conn, int(bid))
    return {"id": int(bid)}


@route("POST", r"/api/inspections")
def create_inspection(conn, body):
    return svc.create_inspection(conn, body)


@route("POST", r"/api/hazards")
def create_hazard(conn, body):
    return svc.create_hazard(conn, body)


@route("PUT", r"/api/hazards/(\d+)/status")
def hazard_status(conn, hid, body):
    return svc.change_hazard_status(conn, int(hid), body.get("status", ""))


@route("POST", r"/api/work-orders")
def create_order(conn, body):
    return svc.create_order(conn, body)


@route("PUT", r"/api/work-orders/(\d+)/status")
def order_status(conn, oid, body):
    return svc.change_order_status(conn, int(oid), body.get("status", ""))


@route("POST", r"/api/attachments")
def upload_attachment(conn, body):
    return svc.save_attachment(conn, body)


@route("DELETE", r"/api/attachments/(\d+)")
def delete_attachment(conn, aid):
    svc.delete_attachment(conn, int(aid))
    return {"id": int(aid)}


# 需要事务的写接口白名单（多表联动）
WRITE_ROUTES = {create_billboard, update_billboard, delete_billboard, create_inspection,
                create_hazard, hazard_status, create_order, order_status,
                upload_attachment, delete_attachment}


class Handler(BaseHTTPRequestHandler):
    server_version = "BillboardMS/1.0"

    def log_message(self, fmt, *args):  # 精简日志
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    # ---------- 响应工具 ----------
    def _json(self, payload, status=200):
        raw = json.dumps(payload, ensure_ascii=False, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(raw)

    def _bytes(self, content, content_type, filename=None, status=200):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(content)))
        if filename:
            from urllib.parse import quote
            self.send_header(
                "Content-Disposition",
                "attachment; filename=%s; filename*=UTF-8''%s" % (
                    quote(filename), quote(filename)),
            )
        self.end_headers()
        self.wfile.write(content)

    def _error(self, status, message):
        self._json({"ok": False, "message": message}, status)

    # ---------- 请求分发 ----------
    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def do_PUT(self):
        self._dispatch("PUT")

    def do_DELETE(self):
        self._dispatch("DELETE")

    def _body(self):
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return {}
        if not length:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def _dispatch(self, method):
        parsed = urlparse(self.path)
        path = parsed.path
        query = {k: v[0] for k, v in parse_qs(parsed.query).items()}

        try:
            if path == "/api/export":
                return self._export(query, method)

            if path.startswith("/api/attachments/") and path.endswith("/download"):
                aid = path.split("/")[3]
                return self._download(aid)

            if path.startswith("/api/"):
                handler, params = Api.match(method, path)
                if not handler:
                    return self._error(404, f"接口不存在：{method} {path}")
                if not params:
                    params = (self._body(),) if method == "POST" else (query,)
                elif method == "PUT":
                    params = tuple(params) + (self._body(),)
                conn = get_conn()
                try:
                    if handler in WRITE_ROUTES:
                        with conn:  # 事务
                            data = handler(conn, *params)
                    else:
                        data = handler(conn, *params)
                    return self._json({"ok": True, "data": data})
                except svc.BizError as e:
                    return self._error(400, str(e))
                finally:
                    conn.close()

            return self._static(path)
        except BrokenPipeError:
            pass
        except Exception as e:  # noqa: BLE001
            import traceback
            traceback.print_exc()
            self._error(500, f"服务器内部错误：{e}")

    # ---------- 导出 ----------
    def _export(self, query, method):
        if method != "GET":
            return self._error(405, "方法不允许")
        kind = query.get("type", "ledger")
        conn = get_conn()
        try:
            filename, content, count = exporter.export_payload(
                conn, kind, query.get("start", ""), query.get("end", ""),
                query.get("keyword", ""))
        finally:
            conn.close()
        self._bytes(content,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    filename)
        self.log_message("导出 %s，共 %d 条", filename, count)

    # ---------- 附件下载 ----------
    def _download(self, aid):
        conn = get_conn()
        try:
            row = conn.execute("SELECT * FROM attachment WHERE id=?", (int(aid),)).fetchone()
        finally:
            conn.close()
        if not row:
            return self._error(404, "附件不存在")
        path = Path(row["file_path"])
        if not path.exists():
            return self._error(404, "附件文件已丢失")
        inline = "inline" if query_inline(self) else None
        ctype = row["content_type"] or mimetypes.guess_type(row["origin_name"])[0] or "application/octet-stream"
        content = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(content)))
        from urllib.parse import quote
        disp = "inline" if inline else "attachment"
        self.send_header("Content-Disposition",
                         "%s; filename*=UTF-8''%s" % (disp, quote(row["origin_name"])))
        self.end_headers()
        self.wfile.write(content)

    # ---------- 静态资源 ----------
    def _static(self, path):
        if path in ("", "/"):
            path = "/index.html"
        target = (FRONTEND / path.lstrip("/")).resolve()
        if not str(target).startswith(str(FRONTEND.resolve())) or not target.is_file():
            return self._error(404, "页面不存在")
        ctype = MIME.get(target.suffix.lower()) or mimetypes.guess_type(str(target))[0] or "text/plain"
        self._bytes(target.read_bytes(), ctype)


def query_inline(handler) -> bool:
    return "inline=1" in (handler.path or "")


def main():
    parser = argparse.ArgumentParser(description="高速公路广告牌管理系统")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8000)))
    parser.add_argument("--host", default="127.0.0.1")
    args = parser.parse_args()

    init_db()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    banner = f"""
  高速公路广告牌管理系统  v1.0
  访问地址: http://{args.host}:{args.port}
  数据库  : {os.environ.get('DB_PATH', str(BASE_DIR / 'data' / 'billboard.db'))}
  附件目录: {UPLOAD_DIR}
  按 Ctrl+C 停止服务
"""
    print(banner)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n服务已停止")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
