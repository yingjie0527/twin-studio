package com.digitaltwin.dto;

import com.digitaltwin.entity.Scene;
import com.digitaltwin.entity.SceneObject;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.List;
import java.util.stream.Collectors;

@Data
@EqualsAndHashCode(callSuper = true)
public class SceneDetailVO extends SceneDTO {

    private List<SceneObjectVO> objects;

    /**
     * 从 Scene 实体和 SceneObject 列表转换为 SceneDetailVO
     */
    public static SceneDetailVO from(Scene scene, List<SceneObject> sceneObjects) {
        if (scene == null) {
            return null;
        }
        SceneDetailVO vo = new SceneDetailVO();
        vo.setId(scene.getId());
        vo.setName(scene.getName());
        vo.setDescription(scene.getDescription());
        vo.setThumbnail(scene.getThumbnail());
        vo.setBackgroundColor(scene.getBackgroundColor());
        vo.setAmbientLight(scene.getAmbientLight());
        vo.setGroundSettings(scene.getGroundSettings());
        vo.setCameraSettings(scene.getCameraSettings());
        vo.setCreatedBy(scene.getCreatedBy());
        vo.setCreatedAt(scene.getCreatedAt());
        vo.setUpdatedAt(scene.getUpdatedAt());

        if (sceneObjects != null) {
            vo.setObjects(sceneObjects.stream()
                    .map(SceneObjectVO::fromEntity)
                    .collect(Collectors.toList()));
        }
        return vo;
    }
}
