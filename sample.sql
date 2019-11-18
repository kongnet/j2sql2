/*
 Navicat Premium Data Transfer

 Source Server         : 127.0.0.1
 Source Server Type    : MySQL
 Source Server Version : 80018
 Source Host           : localhost:3306
 Source Schema         : test

 Target Server Type    : MySQL
 Target Server Version : 80018
 File Encoding         : 65001

 Date: 18/11/2019 18:31:11
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for t1
-- ----------------------------
DROP TABLE IF EXISTS `t1`;
CREATE TABLE `t1`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pid` int(11) NULL DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `son` int(11) NULL DEFAULT NULL,
  `c_time` datetime(0) NULL DEFAULT NULL,
  `m_time` datetime(0) NULL DEFAULT NULL,
  `d_flag` int(11) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of t1
-- ----------------------------
INSERT INTO `t1` VALUES (1, 0, 'A', 2, NULL, NULL, 1);
INSERT INTO `t1` VALUES (2, 0, 'B', 1, NULL, NULL, 1);
INSERT INTO `t1` VALUES (3, 1, 'C', 0, NULL, NULL, 0);
INSERT INTO `t1` VALUES (4, 1, 'D', 0, NULL, NULL, 0);
INSERT INTO `t1` VALUES (5, 2, 'E', 0, NULL, NULL, 0);

-- ----------------------------
-- Table structure for t2
-- ----------------------------
DROP TABLE IF EXISTS `t2`;
CREATE TABLE `t2`  (
  `id` int(11) NOT NULL,
  `c_time` datetime(0) NULL DEFAULT NULL,
  `m_time` datetime(0) NULL DEFAULT NULL,
  `d_flag` int(11) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
