import { get, post, put, del } from '@/utils/request'
import type { Result, PageResult } from '@/types/api'
import type {
  Scene,
  SceneDetail,
  SceneObject,
  SceneObjectCreateDTO,
  SceneObjectUpdateDTO,
  SceneSaveDTO,
} from '@/types/scene'

/**
 * 获取场景列表
 */
export function getSceneList(page: number = 1, size: number = 10): Promise<Result<PageResult<Scene>>> {
  return get<PageResult<Scene>>('/api/scenes', { page, size })
}

/**
 * 获取场景详情（含对象）
 */
export function getSceneDetail(id: number): Promise<Result<SceneDetail>> {
  return get<SceneDetail>(`/api/scenes/${id}`)
}

/**
 * 创建场景
 */
export function createScene(data: SceneSaveDTO): Promise<Result<Scene>> {
  return post<Scene>('/api/scenes', data)
}

/**
 * 更新场景
 */
export function updateScene(id: number, data: SceneSaveDTO): Promise<Result<Scene>> {
  return put<Scene>(`/api/scenes/${id}`, data)
}

/**
 * 删除场景
 */
export function deleteScene(id: number): Promise<Result<void>> {
  return del<void>(`/api/scenes/${id}`)
}

/**
 * 添加场景对象
 */
export function addSceneObject(
  sceneId: number,
  data: SceneObjectCreateDTO
): Promise<Result<SceneObject>> {
  return post<SceneObject>(`/api/scenes/${sceneId}/objects`, data)
}

/**
 * 更新场景对象
 */
export function updateSceneObject(
  sceneId: number,
  objectId: number,
  data: SceneObjectUpdateDTO
): Promise<Result<SceneObject>> {
  return put<SceneObject>(`/api/scenes/${sceneId}/objects/${objectId}`, data)
}

/**
 * 删除场景对象
 */
export function deleteSceneObject(sceneId: number, objectId: number): Promise<Result<void>> {
  return del<void>(`/api/scenes/${sceneId}/objects/${objectId}`)
}

/**
 * 创建场景快照
 */
export function createSnapshot(
  sceneId: number,
  description: string = ''
): Promise<Result<{ id: number; description: string; createdAt: string }>> {
  return post<{ id: number; description: string; createdAt: string }>(
    `/api/scenes/${sceneId}/snapshots`,
    { description }
  )
}

/**
 * 恢复场景快照
 */
export function restoreSnapshot(
  sceneId: number,
  snapshotId: number
): Promise<Result<SceneDetail>> {
  return post<SceneDetail>(`/api/scenes/${sceneId}/snapshots/${snapshotId}/restore`)
}
