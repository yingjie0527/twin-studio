<template>
  <div class="models-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">模型库</h1>
        <p class="page-subtitle">管理 3D 模型资源，支持 GLB / GLTF 格式</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showUploadDialog = true">
          <el-icon><Upload /></el-icon>
          上传模型
        </el-button>
      </div>
    </header>

    <!-- 筛选区域 -->
    <div class="filter-bar">
      <!-- 分类标签 -->
      <div class="category-tabs">
        <button
          class="category-tag"
          :class="{ 'is-active': modelStore.selectedCategory === '' }"
          @click="handleCategoryChange('')"
        >
          全部
        </button>
        <button
          v-for="cat in modelStore.categories"
          :key="cat"
          class="category-tag"
          :class="{ 'is-active': modelStore.selectedCategory === cat }"
          @click="handleCategoryChange(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模型..."
          :prefix-icon="Search"
          clearable
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- 模型表格 -->
    <div class="table-wrapper">
      <el-table
        v-loading="modelStore.isLoading"
        :data="modelStore.models"
        style="width: 100%"
        row-class-name="model-table-row"
        empty-text="暂无模型数据"
      >
        <!-- 缩略图 -->
        <el-table-column label="缩略图" width="80" align="center">
          <template #default="{ row }">
            <div class="model-thumbnail">
              <img
                v-if="row.thumbnail"
                :src="row.thumbnail"
                :alt="row.name"
                class="thumbnail-img"
              />
              <div v-else class="thumbnail-placeholder">
                <el-icon :size="20"><Box /></el-icon>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- 名称 -->
        <el-table-column label="名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="model-name">{{ row.name }}</span>
            <span class="model-original-name">{{ row.originalName }}</span>
          </template>
        </el-table-column>

        <!-- 分类 -->
        <el-table-column label="分类" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.category || '未分类' }}</el-tag>
          </template>
        </el-table-column>

        <!-- 文件大小 -->
        <el-table-column label="文件大小" width="110" align="center">
          <template #default="{ row }">
            <span class="model-size">{{ formatFileSize(row.fileSize) }}</span>
          </template>
        </el-table-column>

        <!-- 顶点/面数 -->
        <el-table-column label="顶点/面数" width="130" align="center">
          <template #default="{ row }">
            <span class="model-stats">
              {{ formatNumber(row.vertexCount) }} / {{ formatNumber(row.faceCount) }}
            </span>
          </template>
        </el-table-column>

        <!-- 上传时间 -->
        <el-table-column label="上传时间" width="170" align="center">
          <template #default="{ row }">
            <span class="model-time">{{ formatDateTime(row.uploadTime) }}</span>
          </template>
        </el-table-column>

        <!-- 操作 -->
        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              type="danger"
              text
              size="small"
              @click.stop="handleDelete(row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div v-if="modelStore.total > modelStore.pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="modelStore.currentPage"
        :page-size="modelStore.pageSize"
        :total="modelStore.total"
        layout="total, prev, pager, next"
        background
        @current-change="handlePageChange"
      />
    </div>

    <!-- 上传模型对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传模型"
      width="520px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="uploadFormRef"
        :model="uploadForm"
        :rules="uploadRules"
        label-position="top"
      >
        <el-form-item label="模型分类" prop="category">
          <el-select
            v-model="uploadForm.category"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="cat in modelStore.categories"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="模型描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            placeholder="请输入模型描述（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="模型文件" prop="file" class="upload-form-item">
          <el-upload
            ref="uploadRef"
            drag
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-exceed="handleExceed"
            accept=".glb,.gltf"
            class="model-uploader"
          >
            <div class="upload-content">
              <el-icon class="upload-icon" :size="40"><UploadFilled /></el-icon>
              <div class="upload-text">
                <p class="upload-primary">拖拽文件到此处或 <em>点击上传</em></p>
                <p class="upload-hint">支持 GLB / GLTF 格式，单个文件不超过 100MB</p>
              </div>
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="isUploading"
          :disabled="!uploadForm.file"
          @click="handleUpload"
        >
          上传
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Upload,
  Search,
  Box,
  Delete,
  UploadFilled,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadInstance, type UploadFile, type UploadRawFile } from 'element-plus'
import { useModelStore } from '@/stores/modelStore'

const modelStore = useModelStore()

// ==================== 搜索与筛选 ====================
const searchKeyword = ref('')

function handleCategoryChange(category: string) {
  modelStore.setCategory(category)
  modelStore.fetchModels()
}

function handleSearch() {
  modelStore.setKeyword(searchKeyword.value)
  modelStore.fetchModels()
}

function handlePageChange(page: number) {
  modelStore.setPage(page)
  modelStore.fetchModels()
}

// ==================== 删除模型 ====================
async function handleDelete(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除模型"${row.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    )
    await modelStore.deleteModel(row.id)
    ElMessage.success('模型已删除')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.message || '删除失败')
    }
  }
}

// ==================== 上传模型 ====================
const showUploadDialog = ref(false)
const isUploading = ref(false)
const uploadFormRef = ref<FormInstance>()
const uploadRef = ref<UploadInstance>()
const uploadForm = reactive({
  category: '',
  description: '',
  file: null as File | null,
})

const uploadRules: FormRules = {
  category: [
    { required: true, message: '请选择模型分类', trigger: 'change' },
  ],
}

function handleFileChange(file: UploadFile) {
  if (file.raw) {
    // 校验文件类型
    const validTypes = ['.glb', '.gltf']
    const fileName = file.raw.name.toLowerCase()
    const isValid = validTypes.some(ext => fileName.endsWith(ext))
    if (!isValid) {
      ElMessage.error('仅支持 GLB / GLTF 格式文件')
      uploadRef.value?.clearFiles()
      return
    }
    // 校验文件大小 (100MB)
    if (file.raw.size > 100 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 100MB')
      uploadRef.value?.clearFiles()
      return
    }
    uploadForm.file = file.raw
  }
}

function handleFileRemove() {
  uploadForm.file = null
}

function handleExceed() {
  ElMessage.warning('只能上传一个文件，请先移除已有文件')
}

async function handleUpload() {
  if (!uploadFormRef.value || !uploadForm.file) return

  try {
    await uploadFormRef.value.validate()
  } catch {
    return
  }

  isUploading.value = true
  try {
    await modelStore.uploadModel(uploadForm.file, {
      category: uploadForm.category,
      description: uploadForm.description,
    })
    ElMessage.success('模型上传成功')
    showUploadDialog.value = false
    // 重置表单
    uploadForm.category = ''
    uploadForm.description = ''
    uploadForm.file = null
    uploadRef.value?.clearFiles()
  } catch (error: any) {
    ElMessage.error(error?.message || '上传失败')
  } finally {
    isUploading.value = false
  }
}

// ==================== 格式化工具 ====================
function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const value = bytes / Math.pow(k, i)
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

function formatNumber(num: number): string {
  if (!num) return '0'
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}w`
  }
  return num.toLocaleString()
}

function formatDateTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}`
}

// ==================== 生命周期 ====================
onMounted(() => {
  modelStore.fetchModels()
})
</script>

<style scoped lang="scss">
.models-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0e1a 0%, #111827 100%);
  padding: 32px;
}

// 页面头部
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}

.header-left {
  .page-title {
    font-size: 28px;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.02em;
  }

  .page-subtitle {
    font-size: 14px;
    color: #64748b;
    margin-top: 4px;
  }
}

// 筛选栏
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid #1e293b;
  border-radius: 12px;
}

.category-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.category-tag {
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #f1f5f9;
    background: rgba(59, 130, 246, 0.08);
  }

  &.is-active {
    color: #60a5fa;
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.3);
  }
}

.search-box {
  width: 240px;
  flex-shrink: 0;

  :deep(.el-input) {
    .el-input__wrapper {
      background-color: #111827;
      border: 1px solid #1e293b;
      border-radius: 8px;
      box-shadow: none;

      &:hover {
        border-color: #334155;
      }

      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }
    }

    .el-input__inner {
      color: #f1f5f9;

      &::placeholder {
        color: #475569;
      }
    }
  }
}

// 表格容器
.table-wrapper {
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid #1e293b;
  border-radius: 12px;
  overflow: hidden;

  :deep(.el-table) {
    --el-table-bg-color: transparent;
    --el-table-tr-bg-color: transparent;
    --el-table-header-bg-color: rgba(17, 24, 39, 0.8);
    --el-table-row-hover-bg-color: rgba(59, 130, 246, 0.06);
    --el-table-border-color: #1e293b;
    --el-table-text-color: #f1f5f9;
    --el-table-header-text-color: #94a3b8;

    th.el-table__cell {
      background-color: rgba(17, 24, 39, 0.8) !important;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    td.el-table__cell {
      border-bottom-color: rgba(30, 41, 59, 0.6);
    }

    &::before,
    &::after {
      display: none;
    }
  }
}

// 表格行内样式
.model-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: #111827;
  border: 1px solid #1e293b;

  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #334155;
  }
}

.model-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #f1f5f9;
}

.model-original-name {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.model-size {
  font-size: 13px;
  color: #94a3b8;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.model-stats {
  font-size: 12px;
  color: #64748b;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.model-time {
  font-size: 13px;
  color: #64748b;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

// 上传区域
.upload-form-item {
  :deep(.el-form-item__content) {
    line-height: normal;
  }
}

.model-uploader {
  width: 100%;

  :deep(.el-upload) {
    width: 100%;
  }

  :deep(.el-upload-dragger) {
    width: 100%;
    padding: 32px 20px;
    background-color: #111827;
    border: 2px dashed #334155;
    border-radius: 12px;
    transition: border-color 0.25s ease, background-color 0.25s ease;

    &:hover {
      border-color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.03);
    }

    &.is-dragover {
      border-color: #3b82f6;
      background-color: rgba(59, 130, 246, 0.06);
    }
  }
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  color: #334155;
}

.upload-text {
  text-align: center;
}

.upload-primary {
  font-size: 14px;
  color: #94a3b8;
  margin: 0 0 4px;

  em {
    color: #60a5fa;
    font-style: normal;
    font-weight: 500;
  }
}

.upload-hint {
  font-size: 12px;
  color: #475569;
  margin: 0;
}

// 响应式
@media (max-width: 768px) {
  .models-page {
    padding: 16px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }

  .category-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 4px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
