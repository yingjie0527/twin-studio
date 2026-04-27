-- ============================================================
-- Digital Twin Editor - 数据库初始化脚本
-- 适用于 MySQL 8.0+
-- 数据库名: digital_twin
-- ============================================================

-- 设置默认字符集和排序规则
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------
-- 1. 用户表 dt_user
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `dt_user`;
CREATE TABLE `dt_user` (
    `id`          BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username`    VARCHAR(50)  NOT NULL                COMMENT '用户名',
    `password`    VARCHAR(255) NOT NULL                COMMENT '密码（BCrypt加密）',
    `nickname`    VARCHAR(100) DEFAULT NULL            COMMENT '昵称',
    `avatar`      VARCHAR(500) DEFAULT NULL            COMMENT '头像URL',
    `role`        VARCHAR(20)  DEFAULT 'user'          COMMENT '角色: admin / user',
    `status`      TINYINT      DEFAULT 1               COMMENT '状态: 1-正常, 0-禁用',
    `created_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`  TINYINT      DEFAULT 0               COMMENT '逻辑删除: 0-未删除, 1-已删除',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- -----------------------------------------------------------
-- 2. 模型资源表 dt_model_asset
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `dt_model_asset`;
CREATE TABLE `dt_model_asset` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`            VARCHAR(200) NOT NULL                COMMENT '模型名称',
    `original_name`   VARCHAR(200) DEFAULT NULL            COMMENT '原始文件名',
    `file_type`       VARCHAR(20)  DEFAULT NULL            COMMENT '文件类型: glb/gltf/fbx/obj',
    `file_size`       BIGINT       DEFAULT NULL            COMMENT '文件大小(字节)',
    `storage_path`    VARCHAR(500) NOT NULL                COMMENT '存储路径',
    `storage_bucket`  VARCHAR(100) DEFAULT NULL            COMMENT '存储桶名称',
    `thumbnail`       VARCHAR(500) DEFAULT NULL            COMMENT '缩略图路径',
    `category`        VARCHAR(50)  DEFAULT NULL            COMMENT '分类',
    `description`     TEXT         DEFAULT NULL            COMMENT '描述',
    `bounding_box`    JSON         DEFAULT NULL            COMMENT '包围盒 {minX, minY, minZ, maxX, maxY, maxZ}',
    `vertex_count`    INT          DEFAULT NULL            COMMENT '顶点数',
    `face_count`      INT          DEFAULT NULL            COMMENT '面数',
    `has_draco`       TINYINT      DEFAULT 0               COMMENT '是否包含Draco压缩: 0-否, 1-是',
    `has_animation`   TINYINT      DEFAULT 0               COMMENT '是否包含动画: 0-否, 1-是',
    `tags`            JSON         DEFAULT NULL            COMMENT '标签列表',
    `upload_user_id`  BIGINT       DEFAULT NULL            COMMENT '上传用户ID',
    `upload_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
    `update_time`     DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      DEFAULT 0               COMMENT '逻辑删除: 0-未删除, 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_upload_user` (`upload_user_id`),
    KEY `idx_category` (`category`),
    KEY `idx_file_type` (`file_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='模型资源表';

-- -----------------------------------------------------------
-- 3. 场景表 dt_scene
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `dt_scene`;
CREATE TABLE `dt_scene` (
    `id`               BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `name`             VARCHAR(200) NOT NULL                COMMENT '场景名称',
    `description`      TEXT         DEFAULT NULL            COMMENT '场景描述',
    `thumbnail`        VARCHAR(500) DEFAULT NULL            COMMENT '缩略图路径',
    `background_color` VARCHAR(20)  DEFAULT '#1a1a2e'      COMMENT '背景颜色',
    `ambient_light`    JSON         DEFAULT NULL            COMMENT '环境光设置',
    `ground_settings`  JSON         DEFAULT NULL            COMMENT '地面设置',
    `camera_settings`  JSON         DEFAULT NULL            COMMENT '相机设置',
    `created_by`       BIGINT       DEFAULT NULL            COMMENT '创建人ID',
    `created_at`       DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`       TINYINT      DEFAULT 0               COMMENT '逻辑删除: 0-未删除, 1-已删除',
    PRIMARY KEY (`id`),
    KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景表';

-- -----------------------------------------------------------
-- 4. 场景对象实例表 dt_scene_object
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `dt_scene_object`;
CREATE TABLE `dt_scene_object` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `scene_id`      BIGINT       NOT NULL                COMMENT '所属场景ID',
    `model_asset_id` BIGINT      DEFAULT NULL            COMMENT '关联模型资源ID（可为空，如灯光、辅助对象）',
    `name`          VARCHAR(200) DEFAULT NULL            COMMENT '对象名称',
    `object_type`   VARCHAR(50)  DEFAULT 'model'         COMMENT '对象类型: model/light/helper/group',
    `parent_id`     BIGINT       DEFAULT NULL            COMMENT '父对象ID',
    `position`      JSON         DEFAULT NULL            COMMENT '位置 {x, y, z}',
    `rotation`      JSON         DEFAULT NULL            COMMENT '旋转 {x, y, z}',
    `scale`         JSON         DEFAULT NULL            COMMENT '缩放 {x, y, z}',
    `visible`       TINYINT      DEFAULT 1               COMMENT '是否可见: 1-可见, 0-隐藏',
    `locked`        TINYINT      DEFAULT 0               COMMENT '是否锁定: 0-未锁定, 1-锁定',
    `sort_order`    INT          DEFAULT 0               COMMENT '排序序号',
    `properties`    JSON         DEFAULT NULL            COMMENT '扩展属性',
    `user_data`     JSON         DEFAULT NULL            COMMENT '用户自定义数据',
    `created_at`    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`    DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_scene_id` (`scene_id`),
    KEY `idx_parent_id` (`parent_id`),
    KEY `idx_model_asset_id` (`model_asset_id`),
    CONSTRAINT `fk_scene_object_scene` FOREIGN KEY (`scene_id`) REFERENCES `dt_scene` (`id`),
    CONSTRAINT `fk_scene_object_model` FOREIGN KEY (`model_asset_id`) REFERENCES `dt_model_asset` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景对象实例表';

-- -----------------------------------------------------------
-- 5. 场景快照表 dt_scene_snapshot
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `dt_scene_snapshot`;
CREATE TABLE `dt_scene_snapshot` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `scene_id`      BIGINT       NOT NULL                COMMENT '所属场景ID',
    `version`       VARCHAR(50)  NOT NULL                COMMENT '版本号',
    `snapshot_data` JSON         NOT NULL                COMMENT '快照数据（完整场景状态）',
    `description`   VARCHAR(500) DEFAULT NULL            COMMENT '版本描述',
    `created_by`    BIGINT       DEFAULT NULL            COMMENT '创建人ID',
    `created_at`    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_scene_version` (`scene_id`, `version`),
    CONSTRAINT `fk_snapshot_scene` FOREIGN KEY (`scene_id`) REFERENCES `dt_scene` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='场景快照表';

-- -----------------------------------------------------------
-- 6. 对象关系表 dt_scene_relation
-- -----------------------------------------------------------
DROP TABLE IF EXISTS `dt_scene_relation`;
CREATE TABLE `dt_scene_relation` (
    `id`            BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `scene_id`      BIGINT       NOT NULL                COMMENT '所属场景ID',
    `source_id`     BIGINT       NOT NULL                COMMENT '源对象ID',
    `target_id`     BIGINT       NOT NULL                COMMENT '目标对象ID',
    `relation_type` VARCHAR(50)  NOT NULL                COMMENT '关系类型: parent/attach/constraint/link',
    `properties`    JSON         DEFAULT NULL            COMMENT '关系属性',
    `created_at`    DATETIME     DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_scene_source` (`scene_id`, `source_id`),
    KEY `idx_scene_target` (`scene_id`, `target_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对象关系表';

-- -----------------------------------------------------------
-- 初始数据
-- -----------------------------------------------------------

-- 插入默认管理员用户
-- 密码: admin123 的 BCrypt 哈希值
INSERT INTO `dt_user` (`username`, `password`, `nickname`, `role`, `status`)
VALUES (
    'admin',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi',
    '系统管理员',
    'admin',
    1
);

SET FOREIGN_KEY_CHECKS = 1;
