package com.digitaltwin.dto;

import lombok.Data;

import java.util.Map;

@Data
public class SceneObjectCreateDTO {

    private Long modelAssetId;
    private String name;
    private String objectType;
    private Long parentId;
    private double[] position;
    private double[] rotation;
    private double[] scale;
    private Map<String, Object> properties;
}
