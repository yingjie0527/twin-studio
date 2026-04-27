package com.digitaltwin.dto;

import com.digitaltwin.entity.SceneObject;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class SceneObjectVO {

    private Long id;
    private Long sceneId;
    private Long modelAssetId;
    private String name;
    private String objectType;
    private Long parentId;
    private double[] position;
    private double[] rotation;
    private double[] scale;
    private Boolean visible;
    private Boolean locked;
    private Integer sortOrder;
    private Map<String, Object> properties;
    private String userData;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 从 SceneObject 实体转换为 SceneObjectVO
     * 将 JSON 字符串的 position/rotation/scale 转为 double[]，properties 转为 Map
     */
    public static SceneObjectVO fromEntity(SceneObject entity) {
        if (entity == null) {
            return null;
        }
        SceneObjectVO vo = new SceneObjectVO();
        vo.setId(entity.getId());
        vo.setSceneId(entity.getSceneId());
        vo.setModelAssetId(entity.getModelAssetId());
        vo.setName(entity.getName());
        vo.setObjectType(entity.getObjectType());
        vo.setParentId(entity.getParentId());
        vo.setVisible(entity.getVisible());
        vo.setLocked(entity.getLocked());
        vo.setSortOrder(entity.getSortOrder());
        vo.setUserData(entity.getUserData());
        vo.setCreatedAt(entity.getCreatedAt());
        vo.setUpdatedAt(entity.getUpdatedAt());

        // 将 JSON 字符串转为 double[]
        vo.setPosition(parseDoubleArray(entity.getPosition()));
        vo.setRotation(parseDoubleArray(entity.getRotation()));
        vo.setScale(parseDoubleArray(entity.getScale()));

        // 将 JSON 字符串转为 Map
        vo.setProperties(parseMap(entity.getProperties()));

        return vo;
    }

    private static double[] parseDoubleArray(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, double[].class);
        } catch (Exception e) {
            return null;
        }
    }

    private static Map<String, Object> parseMap(String json) {
        if (json == null || json.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return null;
        }
    }
}
