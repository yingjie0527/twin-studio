package com.digitaltwin.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.digitaltwin.common.PageResult;
import com.digitaltwin.common.Result;
import com.digitaltwin.dto.ModelDTO;
import com.digitaltwin.entity.ModelAsset;
import com.digitaltwin.service.ModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/models")
public class ModelController {

    @Autowired
    private ModelService modelService;

    /**
     * 上传模型
     */
    @PostMapping("/upload")
    public Result<ModelDTO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "userId", required = false) Long userId) {
        ModelAsset modelAsset = modelService.upload(file, name, category, description, tags, userId);
        return Result.success(ModelDTO.fromEntity(modelAsset));
    }

    /**
     * 分页查询模型列表
     */
    @GetMapping("/list")
    public Result<PageResult<ModelDTO>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword) {
        Page<ModelAsset> modelPage = modelService.listModels(category, keyword, page, size);
        List<ModelDTO> records = modelPage.getRecords().stream()
                .map(ModelDTO::fromEntity)
                .collect(Collectors.toList());
        PageResult<ModelDTO> result = new PageResult<>();
        result.setTotal(modelPage.getTotal());
        result.setRecords(records);
        result.setPage((int) modelPage.getCurrent());
        result.setSize((int) modelPage.getSize());
        return Result.success(result);
    }

    /**
     * 获取模型详情
     */
    @GetMapping("/{id}")
    public Result<ModelDTO> getById(@PathVariable Long id) {
        ModelAsset modelAsset = modelService.getById(id);
        return Result.success(ModelDTO.fromEntity(modelAsset));
    }

    /**
     * 删除模型
     */
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        modelService.delete(id);
        return Result.success();
    }

    /**
     * 获取模型文件（302重定向到MinIO URL）
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<Void> getFile(@PathVariable Long id, HttpServletResponse response) throws IOException {
        String fileUrl = modelService.getFileUrl(id);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(fileUrl))
                .build();
    }

    /**
     * 获取缩略图
     */
    @GetMapping("/{id}/thumbnail")
    public Result<String> getThumbnail(@PathVariable Long id) {
        ModelAsset modelAsset = modelService.getById(id);
        return Result.success(modelAsset.getThumbnail());
    }
}
