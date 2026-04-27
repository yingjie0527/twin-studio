package com.digitaltwin.service.impl;

import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.digitaltwin.common.BusinessException;
import com.digitaltwin.dto.SceneObjectCreateDTO;
import com.digitaltwin.entity.SceneObject;
import com.digitaltwin.mapper.SceneObjectMapper;
import com.digitaltwin.service.SceneObjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class SceneObjectServiceImpl implements SceneObjectService {

    @Autowired
    private SceneObjectMapper sceneObjectMapper;

    @Override
    public List<SceneObject> listBySceneId(Long sceneId) {
        LambdaQueryWrapper<SceneObject> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SceneObject::getSceneId, sceneId);
        wrapper.orderByAsc(SceneObject::getSortOrder);
        return sceneObjectMapper.selectList(wrapper);
    }

    @Override
    public SceneObject getById(Long id) {
        SceneObject sceneObject = sceneObjectMapper.selectById(id);
        if (sceneObject == null) {
            throw new BusinessException("场景对象不存在");
        }
        return sceneObject;
    }

    @Override
    public SceneObject create(Long sceneId, SceneObjectCreateDTO dto) {
        SceneObject sceneObject = new SceneObject();
        sceneObject.setSceneId(sceneId);
        sceneObject.setModelAssetId(dto.getModelAssetId());
        sceneObject.setName(dto.getName());
        sceneObject.setObjectType(dto.getObjectType());
        sceneObject.setParentId(dto.getParentId());

        // JSON 字段使用 JSON.toJSONString 序列化
        sceneObject.setPosition(dto.getPosition() != null
                ? JSON.toJSONString(dto.getPosition()) : null);
        sceneObject.setRotation(dto.getRotation() != null
                ? JSON.toJSONString(dto.getRotation()) : null);
        sceneObject.setScale(dto.getScale() != null
                ? JSON.toJSONString(dto.getScale()) : null);
        sceneObject.setProperties(dto.getProperties() != null
                ? JSON.toJSONString(dto.getProperties()) : null);

        sceneObject.setVisible(true);
        sceneObject.setLocked(false);
        sceneObject.setSortOrder(0);
        sceneObject.setCreatedAt(LocalDateTime.now());
        sceneObject.setUpdatedAt(LocalDateTime.now());

        sceneObjectMapper.insert(sceneObject);
        return sceneObject;
    }

    @Override
    public void update(Long sceneId, Long objectId, Map<String, Object> updates) {
        SceneObject sceneObject = getById(objectId);

        // 校验对象属于该场景
        if (!sceneObject.getSceneId().equals(sceneId)) {
            throw new BusinessException("场景对象不属于该场景");
        }

        // 根据 updates Map 更新对应字段
        if (updates.containsKey("name")) {
            sceneObject.setName((String) updates.get("name"));
        }
        if (updates.containsKey("objectType")) {
            sceneObject.setObjectType((String) updates.get("objectType"));
        }
        if (updates.containsKey("parentId")) {
            sceneObject.setParentId(toLong(updates.get("parentId")));
        }
        if (updates.containsKey("modelAssetId")) {
            sceneObject.setModelAssetId(toLong(updates.get("modelAssetId")));
        }
        if (updates.containsKey("position")) {
            sceneObject.setPosition(JSON.toJSONString(updates.get("position")));
        }
        if (updates.containsKey("rotation")) {
            sceneObject.setRotation(JSON.toJSONString(updates.get("rotation")));
        }
        if (updates.containsKey("scale")) {
            sceneObject.setScale(JSON.toJSONString(updates.get("scale")));
        }
        if (updates.containsKey("visible")) {
            sceneObject.setVisible(toBoolean(updates.get("visible")));
        }
        if (updates.containsKey("locked")) {
            sceneObject.setLocked(toBoolean(updates.get("locked")));
        }
        if (updates.containsKey("sortOrder")) {
            sceneObject.setSortOrder(toInteger(updates.get("sortOrder")));
        }
        if (updates.containsKey("properties")) {
            sceneObject.setProperties(JSON.toJSONString(updates.get("properties")));
        }
        if (updates.containsKey("userData")) {
            sceneObject.setUserData((String) updates.get("userData"));
        }

        sceneObject.setUpdatedAt(LocalDateTime.now());
        sceneObjectMapper.updateById(sceneObject);
    }

    @Override
    public void delete(Long sceneId, Long objectId) {
        SceneObject sceneObject = getById(objectId);

        // 校验对象属于该场景
        if (!sceneObject.getSceneId().equals(sceneId)) {
            throw new BusinessException("场景对象不属于该场景");
        }

        sceneObjectMapper.deleteById(objectId);
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.parseLong(value.toString());
    }

    private Boolean toBoolean(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private Integer toInteger(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.parseInt(value.toString());
    }
}
