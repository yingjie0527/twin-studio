package com.digitaltwin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dt_model_asset")
public class ModelAsset {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;

    private String originalName;

    private String fileType;

    private Long fileSize;

    private String storagePath;

    private String storageBucket;

    private String thumbnail;

    private String category;

    private String description;

    /** JSON 格式的包围盒信息 */
    private String boundingBox;

    private Integer vertexCount;

    private Integer faceCount;

    private Boolean hasDraco;

    private Boolean hasAnimation;

    /** JSON 格式的标签 */
    private String tags;

    private Long uploadUserId;

    private LocalDateTime uploadTime;

    private LocalDateTime updateTime;

    private Integer isDeleted;
}
