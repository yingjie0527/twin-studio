package com.digitaltwin.dto;

import lombok.Data;

import java.util.List;

@Data
public class SceneSaveDTO {

    private String name;
    private String description;
    private String backgroundColor;
    private String ambientLight;
    private String groundSettings;
    private String cameraSettings;
    private List<SceneObjectVO> objects;
}
