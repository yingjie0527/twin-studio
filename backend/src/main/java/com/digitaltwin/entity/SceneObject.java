package com.digitaltwin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dt_scene_object")
public class SceneObject {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long sceneId;

    private Long modelAssetId;

    private String name;

    private String objectType;

    private Long parentId;

    /** JSON 格式的位置信息 [x, y, z] */
    private String position;

    /** JSON 格式的旋转信息 [rx, ry, rz] */
    private String rotation;

    /** JSON 格式的缩放信息 [sx, sy, sz] */
    private String scale;

    private Boolean visible;

    private Boolean locked;

    private Integer sortOrder;

    /** JSON 格式的扩展属性 */
    private String properties;

    /** JSON 格式的用户自定义数据 */
    private String userData;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
