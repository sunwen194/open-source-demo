# 高速公路广告牌管理系统

依据《计科专本7班 + Forever小组 原型设计》实验报告搭建的完整可运行系统，
覆盖 **广告牌档案、巡检记录、隐患台账、运维工单、附件管理、台账导出** 六大功能模块
+ 运营概览看板，并实现了报告中要求的核心业务联动。

## 运行方式

```bash
# 1. 启动（Python 3.10+，零第三方依赖）
python backend/server.py            # 默认 http://127.0.0.1:8000
python backend/server.py --port 8080

# 2. Windows 一键启动：双击 run.bat
```

浏览器打开 <http://127.0.0.1:8000> 即可使用。首次启动自动建库并写入演示数据
（8 块广告牌、16 条巡检、4 条隐患、5 张工单）。

> 演示数据/库文件：`data/billboard.db`；附件目录：`uploads/`。
> 删除这两个目录即可重置系统。

## 目录结构

```
highway-billboard-system/
├── backend/
│   ├── server.py        # HTTP 服务 + 路由（标准库实现）
│   ├── services.py      # 业务逻辑（状态联动、事务控制）
│   ├── db.py            # SQLite 建表 / 演示数据
│   └── export.py        # 零依赖 xlsx 导出
├── frontend/
│   ├── index.html       # 后台管理界面（左侧菜单 + 顶部导航公共母版）
│   └── assets/          # 样式与脚本（原生 JS，无构建）
├── db/mysql_schema.sql  # MySQL 8.0 建表脚本（与代码字段一一对应）
├── run.bat              # Windows 一键启动
└── shots/               # 系统界面截图
```

## 核心业务规则（对应实验报告“问题 1：状态联动失效”）

| 业务事件 | 联动效果 |
|---|---|
| 新增巡检并勾选「发现隐患」 | 同一事务内写入隐患台账，广告牌状态 → **待整改** |
| 隐患登记 / 开始整改 / 整改完成 | 实时重算广告牌状态 |
| 工单关联隐患创建 | 隐患 → 整改中 |
| 工单办结 | 关联隐患 → 已整改；该广告牌**无未整改隐患且无未办结工单**时自动恢复 **正常** |
| 存在未办结工单但无隐患 | 广告牌 → 故障（维修中） |
| 人工置为「停用」 | 不参与自动联动 |

所有多表写入均包裹在事务中，异常整体回滚，杜绝数据不一致。

## 台账导出（对应实验报告“问题 2：导出字段缺失、列顺序错乱”）

- 表头顺序**硬编码固定**，不依赖字段/字典顺序；
- 空值统一替换为空字符串，单元格不丢失；
- 单次导出上限 **1000 条**，时间字段、编号字段已建索引，避免超时；
- 支持运维台账（14 列）、隐患台账（10 列）、广告牌资产档案（11 列）三类导出。

## 附件管理（对应实验报告“问题 4：同名覆盖、无法关联业务对象”）

- 文件保存名 = `时间戳 + 8 位随机串`，同名文件不再互相覆盖；
- 附件表含 `biz_type` + `biz_id`，与广告牌 / 巡检 / 工单绑定；
- 支持多文件上传（≤20MB）、在线预览、下载、删除。

## 主要接口

```
GET    /api/stats                     运营统计
GET    /api/options                   字典与下拉选项
GET    /api/billboards                广告牌列表（keyword/status/route/分页）
POST   /api/billboards                新增广告牌
GET    /api/billboards/{id}           广告牌详情（含隐患/巡检/工单）
PUT    /api/billboards/{id}           编辑
DELETE /api/billboards/{id}           删除（级联）
GET    /api/inspections               巡检列表（时间区间筛选）
POST   /api/inspections               新增巡检（可自动生成隐患并联动状态）
GET    /api/hazards                   隐患列表
POST   /api/hazards                   登记隐患
PUT    /api/hazards/{id}/status       隐患状态流转
GET    /api/work-orders               工单列表
POST   /api/work-orders               新建工单（可关联隐患）
PUT    /api/work-orders/{id}/status   工单状态流转（办结联动）
GET    /api/attachments               附件列表（biz_type/biz_id/keyword）
POST   /api/attachments               上传附件（base64，绑定业务对象）
GET    /api/attachments/{id}/download 下载/预览（?inline=1）
DELETE /api/attachments/{id}          删除附件
GET    /api/export?type=ledger|hazard|billboard  Excel 导出
```

所有查询均使用参数绑定防 SQL 注入，所有输出经 HTML 转义防 XSS。

## 切换 MySQL

执行 `db/mysql_schema.sql` 建库建表后，将 `backend/db.py` 中的
`get_conn()` 替换为 `pymysql.connect(...)`（SQL 语法均为标准写法，
`AUTOINCREMENT` → `AUTO_INCREMENT`，`TEXT` → `VARCHAR`，脚本内已给出对应版本）。
