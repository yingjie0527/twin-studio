package com.digitaltwin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.digitaltwin.common.PageResult;
import com.digitaltwin.common.Result;
import com.digitaltwin.dto.SceneDetailVO;
import com.digitaltwin.dto.SceneDTO;
import com.digitaltwin.dto.SceneObjectCreateDTO;
import com.digitaltwin.dto.SceneSaveDTO;
import com.digitaltwin.entity.Scene;
import com.digitaltwin.entity.SceneObject;
import com.digitaltwin.service.SceneObjectService;
import com.digitaltwin.service.SceneService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scenes")
public class SceneController {

    @Autowired
    private SceneService sceneService;

    @Autowired
    private SceneObjectService sceneObjectService;

    /**
     * 场景列表
     */
    @GetMapping("/list")
    public Result<PageResult<SceneDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Scene> scenePage = sceneService.listScenes(page, size);
        List<SceneDTO> records = scenePage.getRecords().stream()
                .map(SceneDTO::fromEntity)
                .collect(Collectors.toList());
        PageResult<SceneDTO> result = new PageResult<>();
        result.setTotal(scenePage.getTotal());
        result.setRecords(records);
        result.setPage((int) scenePage.getCurrent());
        result.setSize((int) scenePage.getSize());
        return Result.success(result);
    }

    /**
     * 创建场景
     */
    @PostMapping
    public Result<SceneDTO> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String description = body.get("description");
        Long userId = body.get("userId") != null ? Long.parseLong(body.get("userId")) : null;
        Scene scene = sceneService.create(name, description, userId);
        return Result.success(SceneDTO.fromEntity(scene));
    }

    /**
     * 场景详情
     */
    @GetMapping("/{id}")
    public Result<SceneDetailVO> getDetail(@PathVariable Long id) {
        SceneDetailVO detail = sceneService.getDetail(id);
        return Result.success(detail);
    }

    /**
     * 更新场景
     */
    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, @RequestBody SceneSaveDTO dto) {
        sceneService.update(id, dto);
        return Result.success();
    }

    /**
     * 删除场景
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        sceneService.delete(id);
        return Result.success();
    }

    /**
     * 添加场景对象
     */
    @PostMapping("/{sceneId}/objects")
    public Result<SceneObject> addObject(
            @PathVariable Long sceneId,
            @RequestBody SceneObjectCreateDTO dto) {
        SceneObject sceneObject = sceneObjectService.create(sceneId, dto);
        return Result.success(sceneObject);
    }

    /**
     * 更新场景对象
     */
    @PutMapping("/{sceneId}/objects/{objectId}")
    public Result<Void> updateObject(
            @PathVariable Long sceneId,
            @PathVariable Long objectId,
            @RequestBody Map<String, Object> updates) {
        sceneObjectService.update(sceneId, objectId, updates);
        return Result.success();
    }

    /**
     * 删除场景对象
     */
    @DeleteMapping("/{sceneId}/objects/{objectId}")
    public Result<Void> deleteObject(
            @PathVariable Long sceneId,
            @PathVariable Long objectId) {
        sceneObjectService.delete(sceneId, objectId);
        return Result.success();
    }
}
