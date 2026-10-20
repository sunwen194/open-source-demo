"""数据库访问层（零依赖）：SQLite 建表、连接、演示数据、状态联动。

生产环境可将 SCHEMA 换成 db/mysql_schema.sql 中的 MySQL 8.0 建表语句，
本文件其余 SQL 均使用标准语法与参数绑定，可直接迁移。
"""
import os
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = os.environ.get("DB_PATH", str(BASE_DIR / "data" / "billboard.db"))
UPLOAD_DIR = Path(os.environ.get("UPLOAD_DIR", str(BASE_DIR / "uploads")))

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

BILLBOARD_STATUS = ["正常", "待整改", "故障", "停用"]
HAZARD_STATUS = ["待整改", "整改中", "已整改"]
ORDER_STATUS = ["待派发", "处理中", "已完成", "已关闭"]

SCHEMA = """
CREATE TABLE IF NOT EXISTS billboard (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    code         TEXT NOT NULL UNIQUE,
    name         TEXT NOT NULL,
    route        TEXT,
    stake        TEXT,
    direction    TEXT,
    media_type   TEXT,
    size         TEXT,
    side         TEXT,
    owner        TEXT,
    install_date TEXT,
    status       TEXT NOT NULL DEFAULT '正常',
    remark       TEXT,
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inspection (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    billboard_id  INTEGER NOT NULL,
    inspector     TEXT NOT NULL,
    inspect_time  TEXT NOT NULL,
    weather       TEXT,
    result        TEXT NOT NULL DEFAULT '正常',
    has_hazard    INTEGER NOT NULL DEFAULT 0,
    description   TEXT,
    created_at    TEXT NOT NULL,
    FOREIGN KEY (billboard_id) REFERENCES billboard(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hazard (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    billboard_id  INTEGER NOT NULL,
    inspection_id INTEGER,
    hazard_type   TEXT NOT NULL,
    level         TEXT NOT NULL DEFAULT '一般',
    description   TEXT,
    status        TEXT NOT NULL DEFAULT '待整改',
    found_time    TEXT NOT NULL,
    resolve_time  TEXT,
    created_at    TEXT NOT NULL,
    FOREIGN KEY (billboard_id) REFERENCES billboard(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS work_order (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no      TEXT NOT NULL UNIQUE,
    billboard_id  INTEGER NOT NULL,
    hazard_id     INTEGER,
    title         TEXT NOT NULL,
    work_type     TEXT,
    priority      TEXT NOT NULL DEFAULT '中',
    assignee      TEXT,
    status        TEXT NOT NULL DEFAULT '待派发',
    create_time   TEXT NOT NULL,
    finish_time   TEXT,
    remark        TEXT,
    FOREIGN KEY (billboard_id) REFERENCES billboard(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attachment (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    biz_type     TEXT NOT NULL,
    biz_id       INTEGER NOT NULL,
    origin_name  TEXT NOT NULL,
    stored_name  TEXT NOT NULL,
    file_path    TEXT NOT NULL,
    file_size    INTEGER NOT NULL DEFAULT 0,
    content_type TEXT,
    upload_time  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_billboard_status ON billboard(status);
CREATE INDEX IF NOT EXISTS idx_inspect_time     ON inspection(inspect_time);
CREATE INDEX IF NOT EXISTS idx_hazard_status    ON hazard(status);
CREATE INDEX IF NOT EXISTS idx_order_time       ON work_order(create_time);
CREATE INDEX IF NOT EXISTS idx_attach_biz       ON attachment(biz_type, biz_id);
"""


def now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def rows(cur) -> list:
    return [dict(r) for r in cur.fetchall()]


def sync_billboard_status(conn: sqlite3.Connection, billboard_id: int) -> str:
    """广告牌状态联动核心规则：
    1) 存在未整改隐患            -> 待整改
    2) 无隐患但存在未办结工单    -> 故障（维修中）
    3) 两者都没有                -> 正常
    人工标记为“停用”的资产不参与自动联动。
    """
    b = conn.execute("SELECT status FROM billboard WHERE id=?", (billboard_id,)).fetchone()
    if not b or b["status"] == "停用":
        return b["status"] if b else ""

    pending = conn.execute(
        "SELECT COUNT(*) c FROM hazard WHERE billboard_id=? AND status<>'已整改'",
        (billboard_id,),
    ).fetchone()["c"]
    active = conn.execute(
        "SELECT COUNT(*) c FROM work_order WHERE billboard_id=? AND status IN ('待派发','处理中')",
        (billboard_id,),
    ).fetchone()["c"]

    new_status = "待整改" if pending else ("故障" if active else "正常")
    if new_status != b["status"]:
        conn.execute(
            "UPDATE billboard SET status=?, updated_at=? WHERE id=?",
            (new_status, now(), billboard_id),
        )
    return new_status


def init_db() -> None:
    conn = get_conn()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
        if conn.execute("SELECT COUNT(*) c FROM billboard").fetchone()["c"] == 0:
            _seed(conn)
            conn.commit()
    finally:
        conn.close()


def _seed(conn: sqlite3.Connection) -> None:
    boards = [
        ("HB-G4-0012", "京港澳K1120高立柱", "G4 京港澳高速", "K1120+300", "上行", "高立柱", "18m×6m", "双面", "路桥传媒"),
        ("HB-G4-0027", "京港澳K1148跨线桥", "G4 京港澳高速", "K1148+050", "下行", "跨线桥", "30m×4m", "单面", "路桥传媒"),
        ("HB-G45-0103", "大广K763收费站顶牌", "G45 大广高速", "K763+000", "上行", "收费站", "12m×3m", "双面", "交投广告"),
        ("HB-G45-0118", "大广K801墙面牌", "G45 大广高速", "K801+600", "下行", "墙面", "20m×8m", "单面", "交投广告"),
        ("HB-S28-0205", "长济K96高立柱", "S28 长济高速", "K96+120", "上行", "高立柱", "18m×6m", "双面", "中原传媒"),
        ("HB-S28-0211", "长济K132高立柱", "S28 长济高速", "K132+780", "下行", "高立柱", "18m×6m", "单面", "中原传媒"),
        ("HB-G30-0307", "连霍K512跨线桥", "G30 连霍高速", "K512+240", "上行", "跨线桥", "28m×4m", "单面", "西部广告"),
        ("HB-G30-0319", "连霍K556墙面牌", "G30 连霍高速", "K556+900", "下行", "墙面", "16m×6m", "单面", "西部广告"),
    ]
    ts = now()
    for i, (code, name, route, stake, direction, mtype, size, side, owner) in enumerate(boards):
        conn.execute(
            """INSERT INTO billboard(code,name,route,stake,direction,media_type,size,side,
               owner,install_date,status,remark,created_at,updated_at)
               VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (code, name, route, stake, direction, mtype, size, side, owner,
             "2021-06-%02d" % (5 + i * 2), "正常", "", ts, ts),
        )

    inspectors = ["张伟", "李强", "王敏", "赵鹏"]
    base = datetime.now() - timedelta(days=20)
    for i in range(16):
        bid = (i % 8) + 1
        t = (base + timedelta(days=i, hours=8 + (i * 3) % 9)).strftime("%Y-%m-%d %H:%M:%S")
        has_hazard = i % 4 == 0
        conn.execute(
            """INSERT INTO inspection(billboard_id,inspector,inspect_time,weather,result,
               has_hazard,description,created_at) VALUES(?,?,?,?,?,?,?,?)""",
            (bid, inspectors[i % 4], t, ["晴", "多云", "小雨"][i % 3],
             "异常" if has_hazard else "正常", 1 if has_hazard else 0,
             "巡检发现版面撕裂、支架锈蚀，需整改" if has_hazard else "结构、画面、照明均正常", t),
        )
        if has_hazard:
            iid = conn.execute("SELECT last_insert_rowid() AS id").fetchone()["id"]
            conn.execute(
                """INSERT INTO hazard(billboard_id,inspection_id,hazard_type,level,description,
                   status,found_time,created_at) VALUES(?,?,?,?,?,?,?,?)""",
                (bid, iid, ["结构", "画面"][i % 2], ["一般", "较大"][i % 2],
                 "立柱底部锈蚀，画面边缘撕裂约 30cm，存在脱落风险", "待整改", t, t),
            )

    orders = [
        ("WO20250901001", 2, "跨线桥画面更换", "更换画面", "中", "刘工", "已完成", "2025-09-01 09:20:00", "2025-09-02 16:00:00", "已验收"),
        ("WO20250915002", 5, "高立柱基础加固", "加固", "高", "陈工", "已完成", "2025-09-15 10:00:00", "2025-09-18 11:30:00", "回弹检测合格"),
        ("WO20251008003", 3, "收费站顶牌配电箱检修", "维修", "低", "刘工", "处理中", "2025-10-08 14:10:00", None, "等待配件"),
        ("WO20251012004", 7, "跨线桥版面清洗", "维修", "低", "陈工", "待派发", "2025-10-12 08:40:00", None, ""),
    ]
    for no, bid, title, wtype, prio, assignee, status, ct, ft, remark in orders:
        conn.execute(
            """INSERT INTO work_order(order_no,billboard_id,hazard_id,title,work_type,priority,
               assignee,status,create_time,finish_time,remark) VALUES(?,?,?,?,?,?,?,?,?,?,?)""",
            (no, bid, None, title, wtype, prio, assignee, status, ct, ft, remark),
        )

    for row in conn.execute("SELECT id FROM billboard").fetchall():
        sync_billboard_status(conn, row["id"])
