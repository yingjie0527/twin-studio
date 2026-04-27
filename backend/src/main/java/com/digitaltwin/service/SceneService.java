package com.digitaltwin.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.digitaltwin.dto.SceneDetailVO;
import com.digitaltwin.dto.SceneSaveDTO;
import com.digitaltwin.entity.Scene;

public interface SceneService {

    /**
     * 分页查询场景列表
     *
     * @param page 页码
     * @param size 每页大小
     * @return 分页结果
     */
    Page<Scene> listScenes(int page, int size);

    /**
     * 根据ID获取场景
     *
     * @param id 场景ID
     * @return 场景实体
     */
    Scene getById(Long id);

    /**
     * 获取场景详情（包含场景对象）
     *
     * @param id 场景ID
     * @return 场景详情VO
     */
    SceneDetailVO getDetail(Long id);

    /**
     * 创建场景
     *
     * @param name        场景名称
     * @param description 场景描述
     * @param userId      创建用户ID
     * @return 创建的场景实体
     */
    Scene create(String name, String description, Long userId);

    /**
     * 更新场景（全量更新策略：更新基本信息 + 删除旧对象 + 批量插入新对象）
     *
     * @param id  场景ID
     * @param dto 场景保存DTO
     */
    void update(Long id, SceneSaveDTO dto);

    /**
     * 删除场景（软删除 + 删除关联对象）
     *
     * @param id 场景ID
     */
    void delete(Long id);
}
