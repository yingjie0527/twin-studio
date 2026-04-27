package com.digitaltwin.dto;

import com.digitaltwin.entity.ModelAsset;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ModelDTO {

    private Long id;
    private String name;
    private String originalName;
    private String fileType;
    private Long fileSize;
    private String thumbnail;
    private String category;
    private String description;
    private String boundingBox;
    private Integer vertexCount;
    private Integer faceCount;
    private Boolean hasDraco;
    private Boolean hasAnimation;
    private String tags;
    private LocalDateTime uploadTime;

    /**
     * 从 ModelAsset 实体转换为 ModelDTO
     */
    public static ModelDTO fromEntity(ModelAsset entity) {
        if (entity == null) {
            return null;
        }
        ModelDTO dto = new ModelDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setOriginalName(entity.getOriginalName());
        dto.setFileType(entity.getFileType());
        dto.setFileSize(entity.getFileSize());
        dto.setThumbnail(entity.getThumbnail());
        dto.setCategory(entity.getCategory());
        dto.setDescription(entity.getDescription());
        dto.setBoundingBox(entity.getBoundingBox());
        dto.setVertexCount(entity.getVertexCount());
        dto.setFaceCount(entity.getFaceCount());
        dto.setHasDraco(entity.getHasDraco());
        dto.setHasAnimation(entity.getHasAnimation());
        dto.setTags(entity.getTags());
        dto.setUploadTime(entity.getUploadTime());
        return dto;
    }
}
