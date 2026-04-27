package com.digitaltwin.service;

import java.io.InputStream;

public interface FileStorageService {

    /**
     * 上传文件到存储
     *
     * @param path        文件路径
     * @param inputStream 输入流
     * @param contentType 内容类型
     */
    void upload(String path, InputStream inputStream, String contentType);

    /**
     * 获取文件访问URL
     *
     * @param path 文件路径
     * @return 文件URL
     */
    String getFileUrl(String path);

    /**
     * 删除存储中的文件
     *
     * @param path 文件路径
     */
    void delete(String path);
}
