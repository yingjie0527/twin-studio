package com.digitaltwin.service;

import com.digitaltwin.dto.SceneObjectCreateDTO;
import com.digitaltwin.entity.SceneObject;

import java.util.List;
import java.util.Map;

public interface SceneObjectService {

    /**
     * 根据场景ID查询所有对象（按 sortOrder 排序）
     *
     * @param sceneId 场景ID
     * @return 场景对象列表
     */
    List<SceneObject> listBySceneId(Long sceneId);

    /**
     * 根据ID获取场景对象
     *
     * @param id 对象ID
     * @return 场景对象实体
     */
    SceneObject getById(Long id);

    /**
     * 创建场景对象
     *
     * @param sceneId 场景ID
     * @param dto     创建DTO
     * @return 创建的场景对象
     */
    SceneObject create(Long sceneId, SceneObjectCreateDTO dto);

    /**
     * 更新场景对象
     *
     * @param sceneId  场景ID
     * @param objectId 对象ID
     * @param updates  更新字段Map
     */
    void update(Long sceneId, Long objectId, Map<String, Object> updates);

    /**
     * 删除场景对象
     *
     * @param sceneId  场景ID
     * @param objectId 对象ID
     */
    void delete(Long sceneId, Long objectId);
}
