"""业务逻辑层：档案、巡检、隐患、工单、附件、统计。

所有写操作都在同一个连接的事务内完成（conn 由调用方开启），
涉及多表（新增巡检 -> 新增隐患 -> 更新广告牌状态）时要么全部成功，要么整体回滚。
"""
import base64
import os
import random
import sqlite3
import string
from datetime import datetime

from db import HAZARD_STATUS, ORDER_STATUS, UPLOAD_DIR, now, sync_billboard_status


class BizError(Exception):
    """业务校验失败，返回 400。"""


def _page(args) -> tuple:
    page = max(1, int(args.get("page", 1) or 1))
    size = min(200, max(1, int(args.get("size", 10) or 10)))
    return page, size


def _like(kw: str) -> str:
    return f"%{kw.strip()}%"


# ---------------- 广告牌档案 ----------------

def list_billboards(conn, args):
    page, size = _page(args)
    where, params = ["1=1"], []
    if args.get("keyword"):
        where.append("(code LIKE ? OR name LIKE ? OR route LIKE ? OR stake LIKE ?)")
        params += [_like(args["keyword"])] * 4
    if args.get("status"):
        where.append("status=?")
        params.append(args["status"])
    if args.get("route"):
        where.append("route=?")
        params.append(args["route"])
    w = " AND ".join(where)
    total = conn.execute(f"SELECT COUNT(*) c FROM billboard WHERE {w}", params).fetchone()["c"]
    items = conn.execute(
        f"""SELECT *, (SELECT COUNT(*) FROM hazard h WHERE h.billboard_id=billboard.id
             AND h.status<>'已整改') AS pending_hazard
            FROM billboard WHERE {w} ORDER BY id DESC LIMIT ? OFFSET ?""",
        params + [size, (page - 1) * size],
    ).fetchall()
    return {"total": total, "page": page, "size": size, "items": [dict(r) for r in items]}


def get_billboard(conn, bid: int):
    r = conn.execute("SELECT * FROM billboard WHERE id=?", (bid,)).fetchone()
    if not r:
        raise BizError("广告牌不存在")
    data = dict(r)
    data["hazards"] = [dict(x) for x in conn.execute(
        "SELECT * FROM hazard WHERE billboard_id=? ORDER BY id DESC", (bid,)).fetchall()]
    data["inspections"] = [dict(x) for x in conn.execute(
        "SELECT * FROM inspection WHERE billboard_id=? ORDER BY inspect_time DESC", (bid,)).fetchall()]
    data["orders"] = [dict(x) for x in conn.execute(
        "SELECT * FROM work_order WHERE billboard_id=? ORDER BY id DESC", (bid,)).fetchall()]
    return data


def create_billboard(conn, p: dict):
    code = (p.get("code") or "").strip()
    name = (p.get("name") or "").strip()
    if not code:
        raise BizError("广告牌编号不能为空")
    if not name:
        raise BizError("广告牌名称不能为空")
    if conn.execute("SELECT 1 FROM billboard WHERE code=?", (code,)).fetchone():
        raise BizError(f"编号 {code} 已存在")
    ts = now()
    cur = conn.execute(
        """INSERT INTO billboard(code,name,route,stake,direction,media_type,size,side,owner,
           install_date,status,remark,created_at,updated_at)
           VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (code, name, p.get("route", ""), p.get("stake", ""), p.get("direction", "上行"),
         p.get("media_type", "高立柱"), p.get("size", ""), p.get("side", "单面"),
         p.get("owner", ""), p.get("install_date", ""), p.get("status") or "正常",
         p.get("remark", ""), ts, ts),
    )
    return get_billboard(conn, cur.lastrowid)


def update_billboard(conn, bid: int, p: dict):
    if not conn.execute("SELECT 1 FROM billboard WHERE id=?", (bid,)).fetchone():
        raise BizError("广告牌不存在")
    fields = ["name", "route", "stake", "direction", "media_type", "size", "side",
              "owner", "install_date", "status", "remark"]
    sets, params = [], []
    for f in fields:
        if f in p:
            sets.append(f"{f}=?")
            params.append(p[f])
    if not sets:
        raise BizError("没有需要更新的字段")
    sets.append("updated_at=?")
    params += [now(), bid]
    conn.execute(f"UPDATE billboard SET {', '.join(sets)} WHERE id=?", params)
    return get_billboard(conn, bid)


def delete_billboard(conn, bid: int):
    if not conn.execute("SELECT 1 FROM billboard WHERE id=?", (bid,)).fetchone():
        raise BizError("广告牌不存在")
    conn.execute("DELETE FROM attachment WHERE biz_type='billboard' AND biz_id=?", (bid,))
    conn.execute("DELETE FROM billboard WHERE id=?", (bid,))


# ---------------- 巡检记录 ----------------

def list_inspections(conn, args):
    page, size = _page(args)
    where, params = ["1=1"], []
    if args.get("keyword"):
        where.append("(b.code LIKE ? OR b.name LIKE ? OR i.inspector LIKE ?)")
        params += [_like(args["keyword"])] * 3
    if args.get("result"):
        where.append("i.result=?")
        params.append(args["result"])
    if args.get("start"):
        where.append("i.inspect_time>=?")
        params.append(args["start"] + " 00:00:00")
    if args.get("end"):
        where.append("i.inspect_time<=?")
        params.append(args["end"] + " 23:59:59")
    w = " AND ".join(where)
    base = "FROM inspection i JOIN billboard b ON b.id=i.billboard_id WHERE " + w
    total = conn.execute("SELECT COUNT(*) c " + base, params).fetchone()["c"]
    items = conn.execute(
        f"""SELECT i.*, b.code AS billboard_code, b.name AS billboard_name, b.route
            {base} ORDER BY i.inspect_time DESC LIMIT ? OFFSET ?""",
        params + [size, (page - 1) * size],
    ).fetchall()
    return {"total": total, "page": page, "size": size, "items": [dict(r) for r in items]}


def create_inspection(conn, p: dict):
    """新增巡检；若标记存在隐患，同一事务内写入隐患台账并把广告牌置为待整改。"""
    bid = int(p.get("billboard_id") or 0)
    inspector = (p.get("inspector") or "").strip()
    if not bid or not conn.execute("SELECT 1 FROM billboard WHERE id=?", (bid,)).fetchone():
        raise BizError("请选择有效的广告牌")
    if not inspector:
        raise BizError("巡检人不能为空")

    ts = p.get("inspect_time") or now()
    has_hazard = 1 if p.get("has_hazard") else 0
    result = "异常" if has_hazard else (p.get("result") or "正常")

    cur = conn.execute(
        """INSERT INTO inspection(billboard_id,inspector,inspect_time,weather,result,
           has_hazard,description,created_at) VALUES(?,?,?,?,?,?,?,?)""",
        (bid, inspector, ts, p.get("weather", ""), result, has_hazard,
         p.get("description", ""), now()),
    )
    iid = cur.lastrowid

    if has_hazard:
        conn.execute(
            """INSERT INTO hazard(billboard_id,inspection_id,hazard_type,level,description,
               status,found_time,created_at) VALUES(?,?,?,?,?,?,?,?)""",
            (bid, iid, p.get("hazard_type") or "结构", p.get("level") or "一般",
             p.get("description", ""), "待整改", ts, now()),
        )
    sync_billboard_status(conn, bid)
    return {"id": iid, "status": conn.execute(
        "SELECT status FROM billboard WHERE id=?", (bid,)).fetchone()["status"]}


# ---------------- 隐患台账 ----------------

def list_hazards(conn, args):
    page, size = _page(args)
    where, params = ["1=1"], []
    if args.get("keyword"):
        where.append("(b.code LIKE ? OR b.name LIKE ? OR h.description LIKE ?)")
        params += [_like(args["keyword"])] * 3
    if args.get("status"):
        where.append("h.status=?")
        params.append(args["status"])
    if args.get("level"):
        where.append("h.level=?")
        params.append(args["level"])
    w = " AND ".join(where)
    base = "FROM hazard h JOIN billboard b ON b.id=h.billboard_id WHERE " + w
    total = conn.execute("SELECT COUNT(*) c " + base, params).fetchone()["c"]
    items = conn.execute(
        f"""SELECT h.*, b.code AS billboard_code, b.name AS billboard_name, b.route,
                   (SELECT COUNT(*) FROM work_order o WHERE o.hazard_id=h.id) AS order_count
            {base} ORDER BY CASE h.status WHEN '待整改' THEN 0 WHEN '整改中' THEN 1 ELSE 2 END,
            h.found_time DESC LIMIT ? OFFSET ?""",
        params + [size, (page - 1) * size],
    ).fetchall()
    return {"total": total, "page": page, "size": size, "items": [dict(r) for r in items]}


def create_hazard(conn, p: dict):
    bid = int(p.get("billboard_id") or 0)
    if not bid or not conn.execute("SELECT 1 FROM billboard WHERE id=?", (bid,)).fetchone():
        raise BizError("请选择有效的广告牌")
    desc = (p.get("description") or "").strip()
    if not desc:
        raise BizError("隐患描述不能为空")
    cur = conn.execute(
        """INSERT INTO hazard(billboard_id,inspection_id,hazard_type,level,description,
           status,found_time,created_at) VALUES(?,?,?,?,?,?,?,?)""",
        (bid, p.get("inspection_id"), p.get("hazard_type") or "结构", p.get("level") or "一般",
         desc, "待整改", p.get("found_time") or now(), now()),
    )
    sync_billboard_status(conn, bid)
    return {"id": cur.lastrowid}


def change_hazard_status(conn, hid: int, status: str):
    if status not in HAZARD_STATUS:
        raise BizError("隐患状态不合法")
    h = conn.execute("SELECT * FROM hazard WHERE id=?", (hid,)).fetchone()
    if not h:
        raise BizError("隐患记录不存在")
    resolve_time = now() if status == "已整改" else None
    conn.execute("UPDATE hazard SET status=?, resolve_time=? WHERE id=?",
                 (status, resolve_time, hid))
    new_status = sync_billboard_status(conn, h["billboard_id"])
    return {"billboard_status": new_status}


# ---------------- 运维工单 ----------------

def _next_order_no(conn) -> str:
    prefix = "WO" + datetime.now().strftime("%Y%m%d")
    c = conn.execute("SELECT COUNT(*) c FROM work_order WHERE order_no LIKE ?",
                     (prefix + "%",)).fetchone()["c"]
    return f"{prefix}{c + 1:03d}"


def list_orders(conn, args):
    page, size = _page(args)
    where, params = ["1=1"], []
    if args.get("keyword"):
        where.append("(o.order_no LIKE ? OR o.title LIKE ? OR b.code LIKE ? OR o.assignee LIKE ?)")
        params += [_like(args["keyword"])] * 4
    if args.get("status"):
        where.append("o.status=?")
        params.append(args["status"])
    if args.get("start"):
        where.append("o.create_time>=?")
        params.append(args["start"] + " 00:00:00")
    if args.get("end"):
        where.append("o.create_time<=?")
        params.append(args["end"] + " 23:59:59")
    w = " AND ".join(where)
    base = ("FROM work_order o JOIN billboard b ON b.id=o.billboard_id "
            "LEFT JOIN hazard h ON h.id=o.hazard_id WHERE " + w)
    total = conn.execute("SELECT COUNT(*) c " + base, params).fetchone()["c"]
    items = conn.execute(
        f"""SELECT o.*, b.code AS billboard_code, b.name AS billboard_name, b.route,
                   h.hazard_type, h.level AS hazard_level
            {base} ORDER BY o.create_time DESC LIMIT ? OFFSET ?""",
        params + [size, (page - 1) * size],
    ).fetchall()
    return {"total": total, "page": page, "size": size, "items": [dict(r) for r in items]}


def create_order(conn, p: dict):
    bid = int(p.get("billboard_id") or 0)
    if not bid or not conn.execute("SELECT 1 FROM billboard WHERE id=?", (bid,)).fetchone():
        raise BizError("请选择有效的广告牌")
    title = (p.get("title") or "").strip()
    if not title:
        raise BizError("工单标题不能为空")
    hazard_id = p.get("hazard_id") or None
    if hazard_id:
        h = conn.execute("SELECT * FROM hazard WHERE id=?", (hazard_id,)).fetchone()
        if not h:
            raise BizError("关联隐患不存在")
        if h["billboard_id"] != bid:
            raise BizError("隐患与广告牌不匹配")
        conn.execute("UPDATE hazard SET status='整改中' WHERE id=? AND status='待整改'", (hazard_id,))
    cur = conn.execute(
        """INSERT INTO work_order(order_no,billboard_id,hazard_id,title,work_type,priority,
           assignee,status,create_time,remark) VALUES(?,?,?,?,?,?,?,?,?,?)""",
        (_next_order_no(conn), bid, hazard_id, title, p.get("work_type") or "维修",
         p.get("priority") or "中", p.get("assignee", ""),
         p.get("status") or "待派发", now(), p.get("remark", "")),
    )
    new_status = sync_billboard_status(conn, bid)
    return {"id": cur.lastrowid, "billboard_status": new_status}


def change_order_status(conn, oid: int, status: str):
    """工单状态流转；办结（已完成/已关闭）时回写隐患并重新计算广告牌状态。"""
    if status not in ORDER_STATUS:
        raise BizError("工单状态不合法")
    o = conn.execute("SELECT * FROM work_order WHERE id=?", (oid,)).fetchone()
    if not o:
        raise BizError("工单不存在")

    finish = now() if status in ("已完成", "已关闭") else None
    conn.execute("UPDATE work_order SET status=?, finish_time=? WHERE id=?",
                 (status, finish, oid))

    if status in ("已完成", "已关闭") and o["hazard_id"]:
        conn.execute(
            "UPDATE hazard SET status='已整改', resolve_time=? WHERE id=?",
            (now(), o["hazard_id"]),
        )
    new_status = sync_billboard_status(conn, o["billboard_id"])
    return {"billboard_status": new_status}


# ---------------- 附件 ----------------

_SAFE = string.ascii_lowercase + string.digits


def save_attachment(conn, p: dict):
    """上传附件：时间戳+随机串重命名，避免同名覆盖；同时记录 biz_type/biz_id 绑定业务对象。"""
    biz_type = p.get("biz_type")
    if biz_type not in ("billboard", "inspection", "work_order"):
        raise BizError("附件关联类型不合法")
    try:
        biz_id = int(p.get("biz_id") or 0)
    except (TypeError, ValueError):
        raise BizError("附件关联 ID 不合法")
    if biz_id <= 0:
        raise BizError("附件必须绑定业务对象 ID")

    origin = os.path.basename(p.get("filename") or "unnamed")
    raw = p.get("content_base64") or ""
    if not raw:
        raise BizError("未收到文件内容")
    try:
        data = base64.b64decode(raw.split(",")[-1])
    except Exception:
        raise BizError("文件内容解析失败")
    if len(data) > 20 * 1024 * 1024:
        raise BizError("单个附件不得超过 20MB")

    ext = os.path.splitext(origin)[1].lower()
    stored = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{''.join(random.choices(_SAFE, k=8))}{ext}"
    path = UPLOAD_DIR / stored
    path.write_bytes(data)

    cur = conn.execute(
        """INSERT INTO attachment(biz_type,biz_id,origin_name,stored_name,file_path,
           file_size,content_type,upload_time) VALUES(?,?,?,?,?,?,?,?)""",
        (biz_type, biz_id, origin, stored, str(path), len(data),
         p.get("content_type") or "", now()),
    )
    return {"id": cur.lastrowid, "stored_name": stored, "file_size": len(data)}


def list_attachments(conn, args):
    where, params = ["1=1"], []
    if args.get("biz_type"):
        where.append("a.biz_type=?")
        params.append(args["biz_type"])
    if args.get("biz_id"):
        where.append("a.biz_id=?")
        params.append(int(args["biz_id"]))
    if args.get("keyword"):
        where.append("a.origin_name LIKE ?")
        params.append(_like(args["keyword"]))
    w = " AND ".join(where)
    items = conn.execute(
        f"""SELECT a.*,
              CASE a.biz_type WHEN 'billboard' THEN (SELECT name FROM billboard WHERE id=a.biz_id)
                   WHEN 'work_order' THEN (SELECT order_no FROM work_order WHERE id=a.biz_id)
                   WHEN 'inspection' THEN (SELECT b.name FROM inspection i JOIN billboard b ON b.id=i.billboard_id WHERE i.id=a.biz_id)
              END AS biz_label
            FROM attachment a WHERE {w} ORDER BY a.id DESC LIMIT 200""",
        params,
    ).fetchall()
    return {"total": len(items), "items": [dict(r) for r in items]}


def delete_attachment(conn, aid: int):
    a = conn.execute("SELECT * FROM attachment WHERE id=?", (aid,)).fetchone()
    if not a:
        raise BizError("附件不存在")
    try:
        if os.path.exists(a["file_path"]):
            os.remove(a["file_path"])
    except OSError:
        pass
    conn.execute("DELETE FROM attachment WHERE id=?", (aid,))


# ---------------- 统计 ----------------

def stats(conn):
    q = lambda sql, p=(): conn.execute(sql, p).fetchone()[0]  # noqa: E731
    by_status = {s: q("SELECT COUNT(*) FROM billboard WHERE status=?", (s,))
                 for s in ("正常", "待整改", "故障", "停用")}
    by_route = [dict(r) for r in conn.execute(
        """SELECT route, COUNT(*) total,
                  SUM(CASE WHEN status='正常' THEN 1 ELSE 0 END) normal,
                  SUM(CASE WHEN status<>'正常' THEN 1 ELSE 0 END) abnormal
           FROM billboard GROUP BY route ORDER BY total DESC""").fetchall()]
    trend = [dict(r) for r in conn.execute(
        """SELECT substr(inspect_time,1,10) day, COUNT(*) total,
                  SUM(has_hazard) hazard
           FROM inspection WHERE inspect_time >= date('now','-13 day')
           GROUP BY day ORDER BY day""").fetchall()]
    return {
        "billboard_total": q("SELECT COUNT(*) FROM billboard"),
        "pending_hazard": q("SELECT COUNT(*) FROM hazard WHERE status<>'已整改'"),
        "open_order": q("SELECT COUNT(*) FROM work_order WHERE status IN ('待派发','处理中')"),
        "inspect_month": q("SELECT COUNT(*) FROM inspection WHERE inspect_time>=date('now','start of month')"),
        "by_status": by_status,
        "by_route": by_route,
        "trend": trend,
        "recent_orders": [dict(r) for r in conn.execute(
            """SELECT o.*, b.code AS billboard_code, b.name AS billboard_name
               FROM work_order o JOIN billboard b ON b.id=o.billboard_id
               ORDER BY o.create_time DESC LIMIT 6""").fetchall()],
        "recent_hazards": [dict(r) for r in conn.execute(
            """SELECT h.*, b.code AS billboard_code, b.name AS billboard_name
               FROM hazard h JOIN billboard b ON b.id=h.billboard_id
               WHERE h.status<>'已整改' ORDER BY h.found_time DESC LIMIT 6""").fetchall()],
    }


def options(conn):
    routes = [r["route"] for r in conn.execute(
        "SELECT DISTINCT route FROM billboard WHERE route<>'' ORDER BY route").fetchall()]
    return {
        "billboards": [dict(r) for r in conn.execute(
            "SELECT id, code, name, route, status FROM billboard ORDER BY code").fetchall()],
        "routes": routes,
        "billboard_status": ["正常", "待整改", "故障", "停用"],
        "hazard_status": HAZARD_STATUS,
        "order_status": ORDER_STATUS,
        "hazard_types": ["结构", "画面", "电气", "其他"],
        "hazard_levels": ["一般", "较大", "重大"],
        "work_types": ["维修", "更换画面", "加固", "拆除"],
        "priorities": ["高", "中", "低"],
        "media_types": ["高立柱", "跨线桥", "墙面", "收费站"],
    }
