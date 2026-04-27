package com.digitaltwin.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.digitaltwin.entity.ModelAsset;
import org.springframework.web.multipart.MultipartFile;

public interface ModelService {

    /**
     * 分页查询模型列表
     *
     * @param category 分类（可选）
     * @param keyword  关键词（可选）
     * @param page     页码
     * @param size     每页大小
     * @return 分页结果
     */
    Page<ModelAsset> listModels(String category, String keyword, int page, int size);

    /**
     * 根据ID获取模型
     *
     * @param id 模型ID
     * @return 模型实体
     */
    ModelAsset getById(Long id);

    /**
     * 上传模型文件
     *
     * @param file        模型文件
     * @param name        模型名称
     * @param category    分类
     * @param description 描述
     * @param tags        标签
     * @param userId      上传用户ID
     * @return 模型实体
     */
    ModelAsset upload(MultipartFile file, String name, String category, String description, String tags, Long userId);

    /**
     * 删除模型（软删除）
     *
     * @param id 模型ID
     */
    void delete(Long id);

    /**
     * 获取模型文件URL
     *
     * @param id 模型ID
     * @return 文件URL
     */
    String getFileUrl(Long id);
}
