-- =====================================================================
-- 高速公路广告牌管理系统 —— MySQL 8.0 建表脚本
-- 与后端 SQLite 结构字段一一对应，生产环境直接执行本脚本即可。
-- =====================================================================
CREATE DATABASE IF NOT EXISTS billboard_ms DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE billboard_ms;

-- 广告牌资产主表
CREATE TABLE IF NOT EXISTS billboard (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    code         VARCHAR(50)  NOT NULL UNIQUE COMMENT '广告牌编号',
    name         VARCHAR(100) NOT NULL COMMENT '广告牌名称',
    route        VARCHAR(100) COMMENT '所在高速/路段',
    stake        VARCHAR(50)  COMMENT '桩号',
    direction    VARCHAR(10)  COMMENT '上行/下行',
    media_type   VARCHAR(30)  COMMENT '高立柱/跨线桥/墙面/收费站',
    size         VARCHAR(50)  COMMENT '版面尺寸',
    side         VARCHAR(10)  COMMENT '单面/双面',
    owner        VARCHAR(100) COMMENT '权属单位',
    install_date DATE         COMMENT '建设日期',
    status       VARCHAR(20)  NOT NULL DEFAULT '正常' COMMENT '正常/待整改/故障/停用',
    remark       VARCHAR(255),
    created_at   DATETIME NOT NULL,
    updated_at   DATETIME NOT NULL,
    INDEX idx_billboard_status (status),
    INDEX idx_billboard_route (route)
) ENGINE=InnoDB COMMENT='广告牌资产档案';

-- 巡检记录
CREATE TABLE IF NOT EXISTS inspection (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    billboard_id  BIGINT NOT NULL,
    inspector     VARCHAR(50) NOT NULL COMMENT '巡检人',
    inspect_time  DATETIME NOT NULL COMMENT '巡检时间',
    weather       VARCHAR(20),
    result        VARCHAR(10) NOT NULL DEFAULT '正常' COMMENT '正常/异常',
    has_hazard    TINYINT NOT NULL DEFAULT 0 COMMENT '1=发现隐患',
    description   VARCHAR(500),
    created_at    DATETIME NOT NULL,
    INDEX idx_inspect_time (inspect_time),
    CONSTRAINT fk_inspect_board FOREIGN KEY (billboard_id) REFERENCES billboard(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='巡检记录';

-- 隐患台账
CREATE TABLE IF NOT EXISTS hazard (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    billboard_id  BIGINT NOT NULL,
    inspection_id BIGINT COMMENT '来源巡检记录',
    hazard_type   VARCHAR(30) NOT NULL COMMENT '结构/画面/电气/其他',
    level         VARCHAR(10) NOT NULL DEFAULT '一般' COMMENT '一般/较大/重大',
    description   VARCHAR(500),
    status        VARCHAR(10) NOT NULL DEFAULT '待整改' COMMENT '待整改/整改中/已整改',
    found_time    DATETIME NOT NULL,
    resolve_time  DATETIME COMMENT '整改完成时间',
    created_at    DATETIME NOT NULL,
    INDEX idx_hazard_status (status),
    CONSTRAINT fk_hazard_board FOREIGN KEY (billboard_id) REFERENCES billboard(id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='隐患台账';

-- 运维工单
CREATE TABLE IF NOT EXISTS work_order (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no      VARCHAR(30) NOT NULL UNIQUE COMMENT '工单编号',
    billboard_id  BIGINT NOT NULL,
    hazard_id     BIGINT COMMENT '关联隐患',
    title         VARCHAR(100) NOT NULL,
    work_type     VARCHAR(30) COMMENT '维修/更换画面/加固/拆除',
    priority      VARCHAR(10) NOT NULL DEFAULT '中' COMMENT '高/中/低',
    assignee      VARCHAR(50) COMMENT '负责人',
    status        VARCHAR(10) NOT NULL DEFAULT '待派发' COMMENT '待派发/处理中/已完成/已关闭',
    create_time   DATETIME NOT NULL,
    finish_time   DATETIME COMMENT '完成时间',
    remark        VARCHAR(255),
    INDEX idx_order_time (create_time),
    CONSTRAINT fk_order_board  FOREIGN KEY (billboard_id) REFERENCES billboard(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_hazard FOREIGN KEY (hazard_id) REFERENCES hazard(id) ON DELETE SET NULL
) ENGINE=InnoDB COMMENT='运维工单';

-- 附件表：关联类型 + 关联 ID，实现附件与业务对象绑定
CREATE TABLE IF NOT EXISTS attachment (
    id           BIGINT PRIMARY KEY AUTO_INCREMENT,
    biz_type     VARCHAR(20) NOT NULL COMMENT 'billboard/inspection/work_order',
    biz_id       BIGINT NOT NULL COMMENT '关联业务记录ID',
    origin_name  VARCHAR(255) NOT NULL COMMENT '原始文件名',
    stored_name  VARCHAR(255) NOT NULL COMMENT '时间戳+随机串重命名',
    file_path    VARCHAR(500) NOT NULL,
    file_size    BIGINT NOT NULL DEFAULT 0,
    content_type VARCHAR(100),
    upload_time  DATETIME NOT NULL,
    INDEX idx_attach_biz (biz_type, biz_id)
) ENGINE=InnoDB COMMENT='附件';

-- 导出优化：时间、广告牌编号字段建索引，提升按时间段导出查询速度
CREATE INDEX idx_order_no_prefix ON work_order (order_no);
CREATE INDEX idx_hazard_found    ON hazard (found_time);
