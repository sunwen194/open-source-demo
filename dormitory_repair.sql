/*
Navicat MySQL Data Transfer

Source Server         : user
Source Server Version : 50562
Source Host           : localhost:3306
Source Database       : dormitory_repair

Target Server Type    : MYSQL
Target Server Version : 50562
File Encoding         : 65001

Date: 2026-06-23 17:27:34
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for repair_order
-- ----------------------------
DROP TABLE IF EXISTS `repair_order`;
CREATE TABLE `repair_order` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `student_id` bigint(20) NOT NULL COMMENT '学生ID',
  `dormitory_building` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '宿舍楼',
  `dormitory_room` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '宿舍房间',
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '联系电话',
  `repair_type` int(11) NOT NULL COMMENT '维修类型ID',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '问题描述',
  `images` text COLLATE utf8mb4_unicode_ci COMMENT '图片URL，多个用逗号分隔',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态：1-待处理，2-已分配，3-维修中，4-已完成，5-已取消，6-已评价',
  `worker_id` bigint(20) DEFAULT NULL COMMENT '维修人员ID',
  `assign_time` timestamp NULL DEFAULT NULL COMMENT '分配时间',
  `complete_time` timestamp NULL DEFAULT NULL COMMENT '完成时间',
  `rating` int(11) DEFAULT NULL COMMENT '评分（1-5）',
  `comment` text COLLATE utf8mb4_unicode_ci COMMENT '评价内容',
  `create_time` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  `deleted` int(11) DEFAULT '0' COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_worker_id` (`worker_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报修单表';

-- ----------------------------
-- Records of repair_order
-- ----------------------------
INSERT INTO `repair_order` VALUES ('1', 'BX202606210001', '1', '1号楼', '101', '13800138000', '1', '宿舍水管漏水，需要紧急维修', '', '1', null, null, null, null, null, '2026-06-21 17:34:35', '2026-06-21 17:34:35', '0');
INSERT INTO `repair_order` VALUES ('2', 'RP202606210001', '2', 'A栋', '101', '13800138001', '1', '宿舍水管漏水，需要紧急维修', null, '1', null, null, null, null, null, '2026-06-21 20:01:32', null, '0');
INSERT INTO `repair_order` VALUES ('3', 'RP202606210002', '3', 'A栋', '102', '13800138002', '2', '书桌椅子损坏，无法正常使用', null, '1', null, null, null, null, null, '2026-06-21 20:01:32', null, '0');
INSERT INTO `repair_order` VALUES ('4', 'RP202606210003', '4', 'B栋', '201', '13800138003', '5', '空调不制冷，温度调低也没用', null, '1', null, null, null, null, null, '2026-06-21 20:01:32', null, '0');
INSERT INTO `repair_order` VALUES ('5', 'RP202606210004', '5', 'B栋', '202', '13800138004', '4', '宿舍网络经常断线，影响学习', null, '1', null, null, null, null, null, '2026-06-21 20:01:32', null, '0');
INSERT INTO `repair_order` VALUES ('6', 'RP202606210005', '6', 'C栋', '301', '13800138005', '3', '阳台门无法关闭，锁坏了', null, '1', null, null, null, null, null, '2026-06-21 20:01:32', null, '0');
INSERT INTO `repair_order` VALUES ('8', 'BX202606210002', '13', 'F', '610', '15536413526', '1', '浴室漏水', '', '2', '9', '2026-06-21 21:05:31', null, null, null, '2026-06-21 21:02:56', '2026-06-21 21:02:56', '0');

-- ----------------------------
-- Table structure for repair_type
-- ----------------------------
DROP TABLE IF EXISTS `repair_type`;
CREATE TABLE `repair_type` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `type_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型名称',
  `type_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '类型编码',
  `description` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '类型描述',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `create_time` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  `deleted` int(11) DEFAULT '0' COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='维修类型表';

-- ----------------------------
-- Records of repair_type
-- ----------------------------
INSERT INTO `repair_type` VALUES ('1', '水电维修', 'WATER_ELECTRIC', '水管、电路等水电问题', '1', '1', '2026-06-21 16:51:55', null, '0');
INSERT INTO `repair_type` VALUES ('2', '家具维修', 'FURNITURE', '桌椅、床铺等家具损坏', '2', '1', '2026-06-21 16:51:55', null, '0');
INSERT INTO `repair_type` VALUES ('3', '门窗维修', 'DOOR_WINDOW', '门窗损坏或无法关闭', '3', '1', '2026-06-21 16:51:55', null, '0');
INSERT INTO `repair_type` VALUES ('4', '网络问题', 'NETWORK', '网络连接故障', '4', '1', '2026-06-21 16:51:55', null, '0');
INSERT INTO `repair_type` VALUES ('5', '空调维修', 'AIR_CONDITIONER', '空调故障', '5', '1', '2026-06-21 16:51:55', null, '0');
INSERT INTO `repair_type` VALUES ('6', '其他', 'OTHER', '其他类型的维修需求', '6', '1', '2026-06-21 16:51:55', null, '0');

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码',
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `role` int(11) NOT NULL DEFAULT '1' COMMENT '角色：1-学生，2-管理员，3-维修人员',
  `status` int(11) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `dormitory_building` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '宿舍楼',
  `dormitory_room` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '宿舍房间',
  `create_time` timestamp NULL DEFAULT NULL COMMENT '创建时间',
  `update_time` timestamp NULL DEFAULT NULL COMMENT '更新时间',
  `deleted` int(11) DEFAULT '0' COMMENT '逻辑删除：0-未删除，1-已删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', 'admin', 'e10adc3949ba59abbe56e057f20f883e', '管理员', null, null, '2', '1', null, null, '2026-06-21 16:51:55', null, '0');
INSERT INTO `user` VALUES ('2', 'student1', 'e10adc3949ba59abbe56e057f20f883e', '张三', '13800138000', 'zhangsan@example.com', '1', '1', '1号楼', '101', '2026-06-21 17:27:57', '2026-06-21 17:27:57', '0');
INSERT INTO `user` VALUES ('3', '李四', 'e10adc3949ba59abbe56e057f20f883e', '李四', '13000000000', null, '1', '1', '110', '110', '2026-06-21 19:49:35', '2026-06-21 19:49:35', '0');
INSERT INTO `user` VALUES ('4', 'student001', 'e10adc3949ba59abbe56e057f20f883e', '张三', '13800138001', 'zhangsan@example.com', '1', '1', 'A栋', '101', '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('5', 'student002', 'e10adc3949ba59abbe56e057f20f883e', '李四', '13800138002', 'lisi@example.com', '1', '1', 'A栋', '102', '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('6', 'student003', 'e10adc3949ba59abbe56e057f20f883e', '王五', '13800138003', 'wangwu@example.com', '1', '1', 'B栋', '201', '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('7', 'student004', 'e10adc3949ba59abbe56e057f20f883e', '赵六', '13800138004', 'zhaoliu@example.com', '1', '1', 'B栋', '202', '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('8', 'student005', 'e10adc3949ba59abbe56e057f20f883e', '孙七', '13800138005', 'sunqi@example.com', '1', '1', 'C栋', '301', '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('9', 'worker001', 'e10adc3949ba59abbe56e057f20f883e', '刘师傅', '13900139001', 'liushi@example.com', '3', '1', 'A栋,B栋', null, '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('10', 'worker002', 'e10adc3949ba59abbe56e057f20f883e', '陈师傅', '13900139002', 'chenshi@example.com', '3', '1', 'B栋,C栋', null, '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('11', 'worker003', 'e10adc3949ba59abbe56e057f20f883e', '杨师傅', '13900139003', 'yangshi@example.com', '3', '1', 'A栋,C栋', null, '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('12', 'worker004', 'e10adc3949ba59abbe56e057f20f883e', '周师傅', '13900139004', 'zhoushi@example.com', '3', '1', 'A栋,B栋,C栋', null, '2026-06-21 20:01:31', null, '0');
INSERT INTO `user` VALUES ('13', '2025019700', 'e10adc3949ba59abbe56e057f20f883e', '小明', '13066666666', null, '1', '1', 'F', '610', '2026-06-21 21:01:09', '2026-06-21 21:01:09', '0');
