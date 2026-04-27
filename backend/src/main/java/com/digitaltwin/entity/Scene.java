package com.digitaltwin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dt_scene")
public class Scene {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String description;

    private String thumbnail;

    private String backgroundColor;

    /** JSON 格式的环境光设置 */
    private String ambientLight;

    /** JSON 格式的地面设置 */
    private String groundSettings;

    /** JSON 格式的相机设置 */
    private String cameraSettings;

    private Long createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer isDeleted;
}
