CREATE DATABASE IF NOT EXISTS `dormitory_repair` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `dormitory_repair`;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
                        `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                        `username` VARCHAR(50) NOT NULL COMMENT '用户名',
                        `password` VARCHAR(255) NOT NULL COMMENT '密码',
                        `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',
                        `phone` VARCHAR(20) COMMENT '手机号',
                        `email` VARCHAR(100) COMMENT '邮箱',
                        `role` INT NOT NULL DEFAULT 1 COMMENT '角色：1-学生，2-管理员，3-维修人员',
                        `status` INT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
                        `dormitory_building` VARCHAR(50) COMMENT '宿舍楼',
                        `dormitory_room` VARCHAR(50) COMMENT '宿舍房间',
                        `create_time` TIMESTAMP NULL DEFAULT NULL COMMENT '创建时间',
                        `update_time` TIMESTAMP NULL DEFAULT NULL COMMENT '更新时间',
                        `deleted` INT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
                        PRIMARY KEY (`id`),
                        UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

DROP TABLE IF EXISTS `repair_type`;
CREATE TABLE `repair_type` (
                               `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                               `type_name` VARCHAR(50) NOT NULL COMMENT '类型名称',
                               `type_code` VARCHAR(50) NOT NULL COMMENT '类型编码',
                               `description` VARCHAR(200) COMMENT '类型描述',
                               `sort_order` INT DEFAULT 0 COMMENT '排序',
                               `status` INT NOT NULL DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
                               `create_time` TIMESTAMP NULL DEFAULT NULL COMMENT '创建时间',
                               `update_time` TIMESTAMP NULL DEFAULT NULL COMMENT '更新时间',
                               `deleted` INT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
                               PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='维修类型表';

DROP TABLE IF EXISTS `repair_order`;
CREATE TABLE `repair_order` (
                                `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
                                `order_no` VARCHAR(50) NOT NULL COMMENT '订单编号',
                                `student_id` BIGINT NOT NULL COMMENT '学生ID',
                                `dormitory_building` VARCHAR(50) NOT NULL COMMENT '宿舍楼',
                                `dormitory_room` VARCHAR(50) NOT NULL COMMENT '宿舍房间',
                                `contact_phone` VARCHAR(20) NOT NULL COMMENT '联系电话',
                                `repair_type` INT NOT NULL COMMENT '维修类型ID',
                                `description` TEXT NOT NULL COMMENT '问题描述',
                                `images` TEXT COMMENT '图片URL，多个用逗号分隔',
                                `status` INT NOT NULL DEFAULT 1 COMMENT '状态：1-待处理，2-已分配，3-维修中，4-已完成，5-已取消，6-已评价',
                                `worker_id` BIGINT COMMENT '维修人员ID',
                                `assign_time` TIMESTAMP NULL COMMENT '分配时间',
                                `complete_time` TIMESTAMP NULL COMMENT '完成时间',
                                `rating` INT COMMENT '评分（1-5）',
                                `comment` TEXT COMMENT '评价内容',
                                `create_time` TIMESTAMP NULL DEFAULT NULL COMMENT '创建时间',
                                `update_time` TIMESTAMP NULL DEFAULT NULL COMMENT '更新时间',
                                `deleted` INT DEFAULT 0 COMMENT '逻辑删除：0-未删除，1-已删除',
                                PRIMARY KEY (`id`),
                                UNIQUE KEY `uk_order_no` (`order_no`),
                                KEY `idx_student_id` (`student_id`),
                                KEY `idx_worker_id` (`worker_id`),
                                KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报修单表';

INSERT INTO `user` (`username`, `password`, `real_name`, `role`, `status`, `create_time`) VALUES
    ('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '管理员', 2, 1, NOW());

INSERT INTO `repair_type` (`type_name`, `type_code`, `description`, `sort_order`, `status`, `create_time`) VALUES
                                                                                                               ('水电维修', 'WATER_ELECTRIC', '水管、电路等水电问题', 1, 1, NOW()),
                                                                                                               ('家具维修', 'FURNITURE', '桌椅、床铺等家具损坏', 2, 1, NOW()),
                                                                                                               ('门窗维修', 'DOOR_WINDOW', '门窗损坏或无法关闭', 3, 1, NOW()),
                                                                                                               ('网络问题', 'NETWORK', '网络连接故障', 4, 1, NOW()),
                                                                                                               ('空调维修', 'AIR_CONDITIONER', '空调故障', 5, 1, NOW()),
                                                                                                               ('其他', 'OTHER', '其他类型的维修需求', 6, 1, NOW());
