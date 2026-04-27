<template>
  <div class="model-library-panel">
    <!-- 面板标题 -->
    <div class="panel-header">
      <span class="panel-title">模型库</span>
      <el-button
        type="primary"
        size="small"
        :icon="Upload"
        @click="handleUpload"
      >
        上传
      </el-button>
    </div>

    <!-- 分类筛选标签 -->
    <div class="category-tabs">
      <span
        v-for="cat in allCategories"
        :key="cat"
        class="category-tag"
        :class="{ active: activeCategory === cat }"
        @click="handleCategoryChange(cat)"
      >
        {{ cat }}
      </span>
    </div>

    <!-- 搜索输入框 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索模型..."
        clearable
        size="small"
        :prefix-icon="Search"
        @input="handleSearch"
      />
    </div>

    <!-- 模型网格列表 -->
    <div v-loading="modelStore.isLoading" class="model-grid">
      <div
        v-for="model in filteredModels"
        :key="model.id"
        class="model-card"
        draggable="true"
        @dragstart="onDragStart($event, model)"
      >
        <div class="model-thumbnail">
          <img
            v-if="model.thumbnail"
            :src="model.thumbnail"
            :alt="model.name"
          />
          <div v-else class="model-thumbnail-placeholder">
            <el-icon :size="32"><Box /></el-icon>
          </div>
        </div>
        <div class="model-info">
          <span class="model-name" :title="model.name">{{ model.name }}</span>
          <span class="model-size">{{ formatFileSize(model.fileSize) }}</span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredModels.length === 0 && !modelStore.isLoading" class="empty-state">
        <el-empty description="暂无模型" :image-size="60" />
      </div>
    </div>

    <!-- 隐藏的上传 input -->
    <input
      ref="uploadInputRef"
      type="file"
      accept=".glb,.gltf"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Upload, Search, Box } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useModelStore } from '@/stores/modelStore'
import type { ModelAsset } from '@/types'

const modelStore = useModelStore()

const searchKeyword = ref('')
const activeCategory = ref('')
const uploadInputRef = ref<HTMLInputElement>()

// 所有分类（含"全部"）
const allCategories = computed(() => ['全部', ...modelStore.categories])

// 根据搜索和分类筛选模型
const filteredModels = computed(() => {
  return modelStore.models
})

// 组件挂载时获取模型列表
onMounted(() => {
  modelStore.fetchModels()
})

// 分类切换
function handleCategoryChange(cat: string) {
  activeCategory.value = cat
  if (cat === '全部') {
    modelStore.setCategory('')
  } else {
    modelStore.setCategory(cat)
  }
  modelStore.fetchModels()
}

// 搜索
function handleSearch() {
  modelStore.setKeyword(searchKeyword.value)
  modelStore.fetchModels()
}

// 拖拽开始
function onDragStart(event: DragEvent, model: ModelAsset) {
  if (!event.dataTransfer) return
  event.dataTransfer.setData('model-id', String(model.id))
  event.dataTransfer.setData('model-name', model.name)
  event.dataTransfer.setData('model-url', `/api/models/${model.id}/file`)
  event.dataTransfer.effectAllowed = 'copy'
}

// 上传按钮点击
function handleUpload() {
  uploadInputRef.value?.click()
}

// 文件选择
async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    await modelStore.uploadModel(file, {
      name: file.name.replace(/\.(glb|gltf)$/i, ''),
    })
    ElMessage.success('模型上传成功')
  } catch (error) {
    console.error('上传模型失败:', error)
    ElMessage.error('模型上传失败')
  } finally {
    // 重置 input 以允许重复上传同一文件
    target.value = ''
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}
</script>

<style scoped>
.model-library-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--el-border-color);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color);
}

.category-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.category-tag:hover {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.category-tag.active {
  color: #fff;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.search-bar {
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color);
}

.model-grid {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  align-content: start;
}

.model-card {
  display: flex;
  flex-direction: column;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
  transition: all 0.2s;
}

.model-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.2);
  transform: translateY(-1px);
}

.model-card:active {
  cursor: grabbing;
  opacity: 0.8;
}

.model-thumbnail {
  width: 100%;
  aspect-ratio: 1;
  background: var(--el-fill-color);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.model-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.model-thumbnail-placeholder {
  color: var(--el-text-color-placeholder);
}

.model-info {
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.model-name {
  font-size: 12px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.model-size {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
</style>
