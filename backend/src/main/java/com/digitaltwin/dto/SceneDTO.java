package com.digitaltwin.dto;

import com.digitaltwin.entity.Scene;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SceneDTO {

    private Long id;
    private String name;
    private String description;
    private String thumbnail;
    private String backgroundColor;
    private String ambientLight;
    private String groundSettings;
    private String cameraSettings;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 从 Scene 实体转换为 SceneDTO
     */
    public static SceneDTO fromEntity(Scene entity) {
        if (entity == null) {
            return null;
        }
        SceneDTO dto = new SceneDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setThumbnail(entity.getThumbnail());
        dto.setBackgroundColor(entity.getBackgroundColor());
        dto.setAmbientLight(entity.getAmbientLight());
        dto.setGroundSettings(entity.getGroundSettings());
        dto.setCameraSettings(entity.getCameraSettings());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
