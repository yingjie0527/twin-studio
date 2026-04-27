package com.digitaltwin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.digitaltwin.common.BusinessException;
import com.digitaltwin.dto.SceneDetailVO;
import com.digitaltwin.dto.SceneObjectVO;
import com.digitaltwin.dto.SceneSaveDTO;
import com.digitaltwin.entity.Scene;
import com.digitaltwin.entity.SceneObject;
import com.digitaltwin.mapper.SceneMapper;
import com.digitaltwin.mapper.SceneObjectMapper;
import com.digitaltwin.service.SceneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SceneServiceImpl implements SceneService {

    @Autowired
    private SceneMapper sceneMapper;

    @Autowired
    private SceneObjectMapper sceneObjectMapper;

    @Override
    public Page<Scene> listScenes(int page, int size) {
        Page<Scene> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Scene> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Scene::getIsDeleted, 0);
        wrapper.orderByDesc(Scene::getUpdatedAt);
        return sceneMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public Scene getById(Long id) {
        Scene scene = sceneMapper.selectById(id);
        if (scene == null || scene.getIsDeleted() == 1) {
            throw new BusinessException("场景不存在");
        }
        return scene;
    }

    @Override
    public SceneDetailVO getDetail(Long id) {
        Scene scene = getById(id);

        // 查询该场景所有对象
        LambdaQueryWrapper<SceneObject> objectWrapper = new LambdaQueryWrapper<>();
        objectWrapper.eq(SceneObject::getSceneId, id);
        objectWrapper.orderByAsc(SceneObject::getSortOrder);
        List<SceneObject> sceneObjects = sceneObjectMapper.selectList(objectWrapper);

        return SceneDetailVO.from(scene, sceneObjects);
    }

    @Override
    public Scene create(String name, String description, Long userId) {
        Scene scene = new Scene();
        scene.setName(name);
        scene.setDescription(description);
        scene.setCreatedBy(userId);
        scene.setCreatedAt(LocalDateTime.now());
        scene.setUpdatedAt(LocalDateTime.now());
        scene.setIsDeleted(0);
        sceneMapper.insert(scene);
        return scene;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, SceneSaveDTO dto) {
        Scene scene = getById(id);

        // 更新场景基本信息
        if (dto.getName() != null) {
            scene.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            scene.setDescription(dto.getDescription());
        }
        if (dto.getBackgroundColor() != null) {
            scene.setBackgroundColor(dto.getBackgroundColor());
        }
        if (dto.getAmbientLight() != null) {
            scene.setAmbientLight(dto.getAmbientLight());
        }
        if (dto.getGroundSettings() != null) {
            scene.setGroundSettings(dto.getGroundSettings());
        }
        if (dto.getCameraSettings() != null) {
            scene.setCameraSettings(dto.getCameraSettings());
        }
        scene.setUpdatedAt(LocalDateTime.now());
        sceneMapper.updateById(scene);

        // 删除旧对象（全量更新策略）
        LambdaQueryWrapper<SceneObject> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(SceneObject::getSceneId, id);
        sceneObjectMapper.delete(deleteWrapper);

        // 批量插入新对象
        if (dto.getObjects() != null && !dto.getObjects().isEmpty()) {
            for (int i = 0; i < dto.getObjects().size(); i++) {
                SceneObjectVO objectVO = dto.getObjects().get(i);
                SceneObject sceneObject = new SceneObject();
                sceneObject.setSceneId(id);
                sceneObject.setModelAssetId(objectVO.getModelAssetId());
                sceneObject.setName(objectVO.getName());
                sceneObject.setObjectType(objectVO.getObjectType());
                sceneObject.setParentId(objectVO.getParentId());
                sceneObject.setPosition(objectVO.getPosition() != null
                        ? com.alibaba.fastjson.JSON.toJSONString(objectVO.getPosition()) : null);
                sceneObject.setRotation(objectVO.getRotation() != null
                        ? com.alibaba.fastjson.JSON.toJSONString(objectVO.getRotation()) : null);
                sceneObject.setScale(objectVO.getScale() != null
                        ? com.alibaba.fastjson.JSON.toJSONString(objectVO.getScale()) : null);
                sceneObject.setVisible(objectVO.getVisible());
                sceneObject.setLocked(objectVO.getLocked());
                sceneObject.setSortOrder(i);
                sceneObject.setProperties(objectVO.getProperties() != null
                        ? com.alibaba.fastjson.JSON.toJSONString(objectVO.getProperties()) : null);
                sceneObject.setUserData(objectVO.getUserData());
                sceneObject.setCreatedAt(LocalDateTime.now());
                sceneObject.setUpdatedAt(LocalDateTime.now());
                sceneObjectMapper.insert(sceneObject);
            }
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        Scene scene = getById(id);

        // 软删除场景
        scene.setIsDeleted(1);
        scene.setUpdatedAt(LocalDateTime.now());
        sceneMapper.updateById(scene);

        // 删除关联对象
        LambdaQueryWrapper<SceneObject> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(SceneObject::getSceneId, id);
        sceneObjectMapper.delete(deleteWrapper);
    }
}
