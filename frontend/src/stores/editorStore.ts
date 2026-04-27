import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SceneObject, SceneDetail } from '@/types'
import * as sceneApi from '@/api/scene'

export const useEditorStore = defineStore('editor', () => {
  // ==================== 状态 ====================
  const currentSceneId = ref<number | null>(null)
  const sceneName = ref('')
  const sceneObjects = ref<SceneObject[]>([])
  const selectedObjectId = ref<number | null>(null)
  const transformMode = ref<'translate' | 'rotate' | 'scale'>('translate')
  const isSaving = ref(false)
  const isLoading = ref(false)

  // ==================== 计算属性 ====================
  const selectedObject = computed(() =>
    sceneObjects.value.find(obj => obj.id === selectedObjectId.value) || null
  )

  // ==================== 操作方法 ====================

  /** 选中场景对象 */
  function selectObject(id: number | null) {
    selectedObjectId.value = id
  }

  /** 设置变换模式 */
  function setTransformMode(mode: 'translate' | 'rotate' | 'scale') {
    transformMode.value = mode
  }

  /** 加载场景详情 */
  async function loadScene(sceneId: number) {
    isLoading.value = true
    try {
      const res = await sceneApi.getSceneDetail(sceneId)
      const detail: SceneDetail = res.data
      currentSceneId.value = detail.id
      sceneName.value = detail.name
      sceneObjects.value = detail.objects || []
      selectedObjectId.value = null
    } catch (error) {
      console.error('加载场景失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /** 向场景添加对象 */
  async function addObjectToScene(data: {
    modelAssetId?: number
    name?: string
    objectType?: string
    parentId?: number
    position?: number[]
    rotation?: number[]
    scale?: number[]
    properties?: Record<string, any>
  }) {
    if (currentSceneId.value === null) {
      throw new Error('当前没有打开的场景')
    }
    const res = await sceneApi.addSceneObject(currentSceneId.value, data)
    const newObject: SceneObject = res.data
    sceneObjects.value.push(newObject)
    selectedObjectId.value = newObject.id
    return newObject
  }

  /** 本地更新对象变换（不发起网络请求） */
  function updateObjectTransform(
    objectId: number,
    transform: { position: number[]; rotation: number[]; scale: number[] }
  ) {
    const obj = sceneObjects.value.find(o => o.id === objectId)
    if (obj) {
      obj.position = transform.position
      obj.rotation = transform.rotation
      obj.scale = transform.scale
    }
  }

  /** 将对象变换保存到服务端 */
  async function saveObjectTransform(objectId: number) {
    if (currentSceneId.value === null) {
      throw new Error('当前没有打开的场景')
    }
    const obj = sceneObjects.value.find(o => o.id === objectId)
    if (!obj) {
      throw new Error(`未找到对象: ${objectId}`)
    }
    const res = await sceneApi.updateSceneObject(currentSceneId.value, objectId, {
      position: obj.position,
      rotation: obj.rotation,
      scale: obj.scale,
    })
    const updated: SceneObject = res.data
    Object.assign(obj, updated)
    return updated
  }

  /** 更新对象属性并保存到服务端 */
  async function updateObjectProperties(
    objectId: number,
    properties: Record<string, any>
  ) {
    if (currentSceneId.value === null) {
      throw new Error('当前没有打开的场景')
    }
    const obj = sceneObjects.value.find(o => o.id === objectId)
    if (!obj) {
      throw new Error(`未找到对象: ${objectId}`)
    }
    // 提取特殊字段
    const updateData: Record<string, any> = {}
    if (properties._name !== undefined) {
      updateData.name = properties._name
      obj.name = properties._name
      delete properties._name
    }
    const mergedProperties = {
      ...(obj.properties || {}),
      ...properties,
    }
    updateData.properties = mergedProperties
    const res = await sceneApi.updateSceneObject(currentSceneId.value, objectId, updateData)
    const updated: SceneObject = res.data
    Object.assign(obj, updated)
    return updated
  }

  /** 删除当前选中的对象 */
  async function deleteSelectedObject() {
    if (selectedObjectId.value === null) {
      throw new Error('没有选中的对象')
    }
    if (currentSceneId.value === null) {
      throw new Error('当前没有打开的场景')
    }
    const objectId = selectedObjectId.value
    await sceneApi.deleteSceneObject(currentSceneId.value, objectId)
    sceneObjects.value = sceneObjects.value.filter(o => o.id !== objectId)
    selectedObjectId.value = null
  }

  /** 全量保存场景 */
  async function saveScene() {
    if (currentSceneId.value === null) {
      throw new Error('当前没有打开的场景')
    }
    isSaving.value = true
    try {
      await sceneApi.updateScene(currentSceneId.value, {
        name: sceneName.value,
        objects: sceneObjects.value,
      })
    } catch (error) {
      console.error('保存场景失败:', error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  return {
    // 状态
    currentSceneId,
    sceneName,
    sceneObjects,
    selectedObjectId,
    transformMode,
    isSaving,
    isLoading,
    // 计算属性
    selectedObject,
    // 方法
    selectObject,
    setTransformMode,
    loadScene,
    addObjectToScene,
    updateObjectTransform,
    saveObjectTransform,
    updateObjectProperties,
    deleteSelectedObject,
    saveScene,
  }
})
