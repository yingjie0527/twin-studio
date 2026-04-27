package com.digitaltwin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.digitaltwin.common.BusinessException;
import com.digitaltwin.entity.ModelAsset;
import com.digitaltwin.mapper.ModelAssetMapper;
import com.digitaltwin.service.FileStorageService;
import com.digitaltwin.service.ModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
public class ModelServiceImpl implements ModelService {

    @Autowired
    private ModelAssetMapper modelAssetMapper;

    @Autowired
    private FileStorageService fileStorageService;

    private static final long MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("glb", "gltf");

    @Override
    public Page<ModelAsset> listModels(String category, String keyword, int page, int size) {
        Page<ModelAsset> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<ModelAsset> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ModelAsset::getIsDeleted, 0);

        if (category != null && !category.trim().isEmpty()) {
            wrapper.eq(ModelAsset::getCategory, category);
        }

        if (keyword != null && !keyword.trim().isEmpty()) {
            wrapper.and(w -> w
                    .like(ModelAsset::getName, keyword)
                    .or()
                    .like(ModelAsset::getDescription, keyword)
                    .or()
                    .like(ModelAsset::getOriginalName, keyword)
            );
        }

        wrapper.orderByDesc(ModelAsset::getUploadTime);
        return modelAssetMapper.selectPage(pageParam, wrapper);
    }

    @Override
    public ModelAsset getById(Long id) {
        ModelAsset model = modelAssetMapper.selectById(id);
        if (model == null || model.getIsDeleted() == 1) {
            throw new BusinessException("模型不存在");
        }
        return model;
    }

    @Override
    public ModelAsset upload(MultipartFile file, String name, String category, String description, String tags, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }

        // 校验文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException("文件大小不能超过200MB");
        }

        // 校验文件类型
        String originalName = file.getOriginalFilename();
        String extension = getFileExtension(originalName);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException("仅支持 glb/gltf 格式的模型文件");
        }

        // 生成UUID文件名
        String fileName = UUID.randomUUID().toString().replace("-", "") + "." + extension;
        String storagePath = "models/" + fileName;

        // 上传文件到存储
        String contentType = file.getContentType();
        if (contentType == null) {
            contentType = "model/gltf-binary";
            if ("gltf".equalsIgnoreCase(extension)) {
                contentType = "model/gltf+json";
            }
        }

        try {
            fileStorageService.upload(storagePath, file.getInputStream(), contentType);
        } catch (IOException e) {
            throw new BusinessException("文件上传失败", e);
        }

        // 保存元数据到数据库
        ModelAsset modelAsset = new ModelAsset();
        modelAsset.setName(name != null ? name : originalName);
        modelAsset.setOriginalName(originalName);
        modelAsset.setFileType(extension.toLowerCase());
        modelAsset.setFileSize(file.getSize());
        modelAsset.setStoragePath(storagePath);
        modelAsset.setCategory(category);
        modelAsset.setDescription(description);
        modelAsset.setTags(tags);
        modelAsset.setUploadUserId(userId);
        modelAsset.setUploadTime(LocalDateTime.now());
        modelAsset.setUpdateTime(LocalDateTime.now());
        modelAsset.setIsDeleted(0);

        modelAssetMapper.insert(modelAsset);
        return modelAsset;
    }

    @Override
    public void delete(Long id) {
        ModelAsset model = getById(id);
        // 软删除
        model.setIsDeleted(1);
        model.setUpdateTime(LocalDateTime.now());
        modelAssetMapper.updateById(model);
        // 异步删除存储文件
        asyncDeleteFile(model.getStoragePath());
    }

    @Async
    public void asyncDeleteFile(String storagePath) {
        try {
            fileStorageService.delete(storagePath);
        } catch (Exception e) {
            // 异步删除失败不影响主流程，仅记录日志
        }
    }

    @Override
    public String getFileUrl(Long id) {
        ModelAsset model = getById(id);
        return fileStorageService.getFileUrl(model.getStoragePath());
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
}
