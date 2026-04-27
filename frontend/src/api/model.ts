import { post, get, del } from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type { ModelAsset, ModelListParams } from '@/types/model'

/**
 * 上传模型文件
 */
export function uploadModel(
  file: File,
  params?: { category?: string; description?: string; tags?: string[] }
): Promise<Result<ModelAsset>> {
  const formData = new FormData()
  formData.append('file', file)
  if (params?.category) {
    formData.append('category', params.category)
  }
  if (params?.description) {
    formData.append('description', params.description)
  }
  if (params?.tags && params.tags.length > 0) {
    formData.append('tags', params.tags.join(','))
  }
  return post<ModelAsset>('/api/models/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 获取模型列表（分页）
 */
export function getModelList(params: ModelListParams): Promise<Result<PageResult<ModelAsset>>> {
  return get<PageResult<ModelAsset>>('/api/models', params)
}

/**
 * 获取模型详情
 */
export function getModelDetail(id: number): Promise<Result<ModelAsset>> {
  return get<ModelAsset>(`/api/models/${id}`)
}

/**
 * 删除模型
 */
export function deleteModel(id: number): Promise<Result<void>> {
  return del<void>(`/api/models/${id}`)
}

/**
 * 获取模型文件 URL
 */
export function getModelFileUrl(id: number): string {
  return `/api/models/${id}/file`
}
