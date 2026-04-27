import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ModelAsset, ModelListParams } from '@/types'
import * as modelApi from '@/api/model'

export const useModelStore = defineStore('model', () => {
  // ==================== 状态 ====================
  const models = ref<ModelAsset[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const isLoading = ref(false)
  const categories = ref<string[]>(['建筑', '设备', '车辆', '人物', '环境', '其他'])
  const selectedCategory = ref<string>('')
  const keyword = ref('')

  // ==================== 操作方法 ====================

  /** 获取模型列表（分页） */
  async function fetchModels(params?: Partial<ModelListParams>) {
    isLoading.value = true
    try {
      const queryParams: ModelListParams = {
        page: params?.page ?? currentPage.value,
        size: params?.size ?? pageSize.value,
        category: (params?.category ?? selectedCategory.value) || undefined,
        keyword: (params?.keyword ?? keyword.value) || undefined,
      }
      const res = await modelApi.getModelList(queryParams)
      const pageResult = res.data
      models.value = pageResult.records
      total.value = pageResult.total
      currentPage.value = pageResult.page
      pageSize.value = pageResult.size
    } catch (error) {
      console.error('获取模型列表失败:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /** 上传模型文件 */
  async function uploadModel(
    file: File,
    params?: { name?: string; category?: string; description?: string }
  ) {
    const uploadParams: { category?: string; description?: string; tags?: string[] } = {}
    if (params?.category) {
      uploadParams.category = params.category
      selectedCategory.value = params.category
    }
    if (params?.description) {
      uploadParams.description = params.description
    }
    const res = await modelApi.uploadModel(file, uploadParams)
    const newModel: ModelAsset = res.data
    // 上传成功后刷新列表
    await fetchModels()
    return newModel
  }

  /** 删除模型 */
  async function deleteModel(id: number) {
    await modelApi.deleteModel(id)
    // 从本地列表中移除
    models.value = models.value.filter(m => m.id !== id)
    total.value = Math.max(0, total.value - 1)
  }

  /** 设置筛选分类 */
  function setCategory(category: string) {
    selectedCategory.value = category
    currentPage.value = 1
  }

  /** 设置搜索关键词 */
  function setKeyword(kw: string) {
    keyword.value = kw
    currentPage.value = 1
  }

  /** 设置当前页码 */
  function setPage(page: number) {
    currentPage.value = page
  }

  return {
    // 状态
    models,
    total,
    currentPage,
    pageSize,
    isLoading,
    categories,
    selectedCategory,
    keyword,
    // 方法
    fetchModels,
    uploadModel,
    deleteModel,
    setCategory,
    setKeyword,
    setPage,
  }
})
