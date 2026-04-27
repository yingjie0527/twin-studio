package com.digitaltwin.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("dt_scene_snapshot")
public class SceneSnapshot {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long sceneId;

    private String version;

    /** JSON 格式的快照数据 */
    private String snapshotData;

    private String description;

    private Long createdBy;

    private LocalDateTime createdAt;
}
