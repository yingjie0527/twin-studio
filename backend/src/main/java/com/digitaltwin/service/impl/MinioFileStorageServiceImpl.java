package com.digitaltwin.service.impl;

import com.digitaltwin.config.MinioConfig;
import com.digitaltwin.service.FileStorageService;
import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class MinioFileStorageServiceImpl implements FileStorageService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private MinioConfig minioConfig;

    @PostConstruct
    public void init() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .build()
            );
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder()
                                .bucket(minioConfig.getBucketName())
                                .build()
                );
                log.info("MinIO 桶 '{}' 创建成功", minioConfig.getBucketName());
            }
        } catch (Exception e) {
            log.error("MinIO 桶初始化失败", e);
            throw new RuntimeException("MinIO 桶初始化失败", e);
        }
    }

    @Override
    public void upload(String path, InputStream inputStream, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(path)
                            .stream(inputStream, inputStream.available(), -1)
                            .contentType(contentType)
                            .build()
            );
        } catch (Exception e) {
            log.error("文件上传失败: {}", path, e);
            throw new RuntimeException("文件上传失败", e);
        }
    }

    @Override
    public String getFileUrl(String path) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(io.minio.http.Method.GET)
                            .bucket(minioConfig.getBucketName())
                            .object(path)
                            .expiry(1, TimeUnit.HOURS)
                            .build()
            );
        } catch (Exception e) {
            log.error("获取文件URL失败: {}", path, e);
            throw new RuntimeException("获取文件URL失败", e);
        }
    }

    @Override
    public void delete(String path) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(path)
                            .build()
            );
        } catch (Exception e) {
            log.error("文件删除失败: {}", path, e);
            throw new RuntimeException("文件删除失败", e);
        }
    }
}
