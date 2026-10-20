"""运维台账导出（零依赖 xlsx 生成）。

要点（对应实验报告问题 2 的解决方案）：
1) 表头顺序**硬编码固定**，不依赖实体类/字典顺序；
2) 所有空值统一替换为 ``""``，保证单元格不为空白丢失；
3) 单次导出上限 1000 条，避免一次性全表查询导致请求超时。
"""
import io
import re
import zipfile
from datetime import datetime

MAX_EXPORT_ROWS = 1000

# 固定的导出表头（列顺序即导出顺序）
LEDGER_HEADERS = ["工单编号", "广告牌编号", "广告牌名称", "所在路段", "桩号", "工单类型",
                  "关联隐患", "隐患等级", "优先级", "负责人", "工单状态",
                  "创建时间", "完成时间", "备注"]
LEDGER_FIELDS = ["order_no", "billboard_code", "billboard_name", "route", "stake", "work_type",
                 "hazard_type", "hazard_level", "priority", "assignee", "status",
                 "create_time", "finish_time", "remark"]

HAZARD_HEADERS = ["隐患编号", "广告牌编号", "广告牌名称", "所在路段", "隐患类型", "隐患等级",
                  "隐患描述", "发现时间", "整改状态", "整改完成时间"]
HAZARD_FIELDS = ["id", "billboard_code", "billboard_name", "route", "hazard_type", "level",
                 "description", "found_time", "status", "resolve_time"]

BILLBOARD_HEADERS = ["广告牌编号", "广告牌名称", "所在路段", "桩号", "方向", "媒体类型",
                     "版面尺寸", "面数", "权属单位", "建设日期", "当前状态"]
BILLBOARD_FIELDS = ["code", "name", "route", "stake", "direction", "media_type", "size",
                    "side", "owner", "install_date", "status"]

_ILLEGAL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def clean(value):
    """空值统一替换为空字符串，避免导出后出现空白单元格丢失列。"""
    if value is None:
        return ""
    if isinstance(value, bool):
        return "是" if value else "否"
    if isinstance(value, (int, float)):
        return value
    text = _ILLEGAL.sub("", str(value))
    return text.strip()


def _esc(text: str) -> str:
    return (text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace('"', "&quot;"))


def _col_name(idx: int) -> str:
    name = ""
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        name = chr(65 + rem) + name
    return name


def _cell(ref: str, value, style: int) -> str:
    v = clean(value)
    if isinstance(v, (int, float)):
        return f'<c r="{ref}" s="{style}"><v>{v}</v></c>'
    return f'<c r="{ref}" s="{style}" t="inlineStr"><is><t xml:space="preserve">{_esc(v)}</t></is></c>'


def build_xlsx(headers, rows, sheet_name="台账", widths=None) -> bytes:
    widths = widths or [16] * len(headers)
    cols = "".join(
        f'<col min="{i+1}" max="{i+1}" width="{w}" customWidth="1"/>'
        for i, w in enumerate(widths))

    body = ['<row r="1" ht="26" customHeight="1">']
    for i, h in enumerate(headers, 1):
        body.append(_cell(f"{_col_name(i)}1", h, 1))
    body.append("</row>")
    for r, row in enumerate(rows, 2):
        body.append(f'<row r="{r}" ht="20" customHeight="1">')
        for i, value in enumerate(row, 1):
            body.append(_cell(f"{_col_name(i)}{r}", value, 2))
        body.append("</row>")

    last_col = _col_name(len(headers))
    dim = f"A1:{last_col}{len(rows) + 1}"
    sheet = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f'<dimension ref="{dim}"/>'
        '<sheetViews><sheetView workbookViewId="0">'
        '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>'
        '</sheetView></sheetViews>'
        '<sheetFormatPr defaultRowHeight="20"/>'
        f'<cols>{cols}</cols>'
        f'<sheetData>{"".join(body)}</sheetData>'
        f'<autoFilter ref="{dim}"/>'
        '</worksheet>'
    )

    styles = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        '<fonts count="2">'
        '<font><sz val="10"/><name val="微软雅黑"/></font>'
        '<font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="微软雅黑"/></font>'
        '</fonts>'
        '<fills count="3">'
        '<fill><patternFill patternType="none"/></fill>'
        '<fill><patternFill patternType="gray125"/></fill>'
        '<fill><patternFill patternType="solid"><fgColor rgb="FF1F5FBF"/>'
        '<bgColor indexed="64"/></patternFill></fill>'
        '</fills>'
        '<borders count="2">'
        '<border><left/><right/><top/><bottom/><diagonal/></border>'
        '<border><left style="thin"><color rgb="FFD6DCE5"/></left>'
        '<right style="thin"><color rgb="FFD6DCE5"/></right>'
        '<top style="thin"><color rgb="FFD6DCE5"/></top>'
        '<bottom style="thin"><color rgb="FFD6DCE5"/></bottom><diagonal/></border>'
        '</borders>'
        '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
        '<cellXfs count="3">'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
        '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" '
        'applyFill="1" applyBorder="1" applyAlignment="1">'
        '<alignment horizontal="center" vertical="center"/></xf>'
        '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" '
        'applyAlignment="1"><alignment vertical="center"/></xf>'
        '</cellXfs>'
        '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>'
        '</styleSheet>'
    )

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml",
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                   '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                   '<Default Extension="xml" ContentType="application/xml"/>'
                   '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
                   '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                   '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
                   '</Types>')
        z.writestr("_rels/.rels",
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>'
                   '</Relationships>')
        z.writestr("xl/workbook.xml",
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
                   'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
                   f'<sheets><sheet name="{_esc(sheet_name)}" sheetId="1" r:id="rId1"/></sheets>'
                   '</workbook>')
        z.writestr("xl/_rels/workbook.xml.rels",
                   '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                   '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                   '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>'
                   '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
                   '</Relationships>')
        z.writestr("xl/styles.xml", styles)
        z.writestr("xl/worksheets/sheet1.xml", sheet)
    return buf.getvalue()


def export_payload(conn, kind: str, start: str = "", end: str = "", keyword: str = ""):
    """按固定表头组织导出数据，返回 (filename, bytes)。"""
    if kind == "hazard":
        headers, fields = HAZARD_HEADERS, HAZARD_FIELDS
        sql = """SELECT h.*, b.code billboard_code, b.name billboard_name, b.route
                 FROM hazard h JOIN billboard b ON b.id=h.billboard_id WHERE 1=1"""
        params = []
        if start:
            sql += " AND h.found_time>=?"
            params.append(start + " 00:00:00")
        if end:
            sql += " AND h.found_time<=?"
            params.append(end + " 23:59:59")
        if keyword:
            sql += " AND (b.code LIKE ? OR b.name LIKE ?)"
            params += [f"%{keyword}%"] * 2
        sql += " ORDER BY h.found_time DESC LIMIT ?"
        prefix, sheet = "隐患台账", "隐患台账"
    elif kind == "billboard":
        headers, fields = BILLBOARD_HEADERS, BILLBOARD_FIELDS
        sql = "SELECT * FROM billboard WHERE 1=1"
        params = []
        if keyword:
            sql += " AND (code LIKE ? OR name LIKE ? OR route LIKE ?)"
            params += [f"%{keyword}%"] * 3
        sql += " ORDER BY code LIMIT ?"
        prefix, sheet = "广告牌档案", "广告牌档案"
    else:
        headers, fields = LEDGER_HEADERS, LEDGER_FIELDS
        sql = """SELECT o.*, b.code billboard_code, b.name billboard_name, b.route, b.stake,
                        h.hazard_type, h.level hazard_level
                 FROM work_order o JOIN billboard b ON b.id=o.billboard_id
                 LEFT JOIN hazard h ON h.id=o.hazard_id WHERE 1=1"""
        params = []
        if start:
            sql += " AND o.create_time>=?"
            params.append(start + " 00:00:00")
        if end:
            sql += " AND o.create_time<=?"
            params.append(end + " 23:59:59")
        if keyword:
            sql += " AND (o.order_no LIKE ? OR o.title LIKE ? OR b.code LIKE ?)"
            params += [f"%{keyword}%"] * 3
        sql += " ORDER BY o.create_time DESC LIMIT ?"
        prefix, sheet = "运维台账", "运维台账"

    params.append(MAX_EXPORT_ROWS)
    records = conn.execute(sql, params).fetchall()
    rows = [[clean(r[f]) if f in r.keys() else "" for f in fields] for r in records]

    widths = [18 if "时间" in h else 14 for h in headers]
    content = build_xlsx(headers, rows, sheet, widths)
    filename = f"{prefix}_{datetime.now().strftime('%Y%m%d%H%M%S')}.xlsx"
    return filename, content, len(rows)
