<template>
  <div class="scenes-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">我的场景</h1>
        <p class="page-subtitle">管理和编辑你的数字孪生场景</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建场景
        </el-button>
        <el-divider direction="vertical" />
        <el-dropdown @command="handleUserCommand">
          <span class="user-info">
            <el-icon :size="16"><User /></el-icon>
            <span class="user-name">{{ userStore.userInfo?.username || '用户' }}</span>
            <el-icon :size="12"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 场景卡片网格 -->
    <div v-loading="isLoading" class="scenes-grid">
      <template v-if="scenes.length > 0">
        <div
          v-for="scene in scenes"
          :key="scene.id"
          class="scene-card dt-card"
        >
          <!-- 缩略图 -->
          <div class="card-thumbnail">
            <img
              v-if="scene.thumbnail"
              :src="scene.thumbnail"
              :alt="scene.name"
              class="thumbnail-img"
            />
            <div v-else class="thumbnail-placeholder">
              <el-icon :size="40"><Picture /></el-icon>
            </div>
          </div>

          <!-- 卡片信息 -->
          <div class="card-body">
            <h3 class="card-name text-ellipsis">{{ scene.name }}</h3>
            <p class="card-desc text-ellipsis-2">{{ scene.description || '暂无描述' }}</p>
            <div class="card-meta">
              <span class="meta-time">
                <el-icon :size="12"><Clock /></el-icon>
                {{ formatTime(scene.updatedAt) }}
              </span>
              <div class="card-actions">
                <el-button
                  size="small"
                  class="preview-btn"
                  @click.stop="goToPreview(scene.id)"
                >
                  <el-icon :size="12"><View /></el-icon>
                  预览
                </el-button>
                <el-button
                  type="primary"
                  size="small"
                  class="edit-btn"
                  @click.stop="goToEditor(scene.id)"
                >
                  <el-icon :size="12"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  size="small"
                  class="delete-btn"
                  @click.stop="handleDelete(scene)"
                >
                  <el-icon :size="12"><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 空状态 -->
      <div v-else-if="!isLoading" class="empty-state">
        <el-icon :size="64" class="empty-icon"><FolderOpened /></el-icon>
        <p class="empty-title">暂无场景</p>
        <p class="empty-desc">点击"新建场景"按钮创建你的第一个数字孪生场景</p>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          新建场景
        </el-button>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="handlePageChange"
      />
    </div>

    <!-- 新建场景对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="新建场景"
      width="480px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-position="top"
      >
        <el-form-item label="场景名称" prop="name">
          <el-input
            v-model="createForm.name"
            placeholder="请输入场景名称"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="场景描述" prop="description">
          <el-input
            v-model="createForm.description"
            type="textarea"
            placeholder="请输入场景描述（可选）"
            :rows="3"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="isCreating" @click="handleCreate">
          创建
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Picture, Clock, FolderOpened, Edit, View, Delete, User, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import * as sceneApi from '@/api/scene'
import type { Scene } from '@/types'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

// ==================== 场景列表 ====================
const scenes = ref<Scene[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

/** 获取场景列表 */
async function fetchScenes() {
  isLoading.value = true
  try {
    const res = await sceneApi.getSceneList(currentPage.value, pageSize.value)
    const pageResult = res.data
    scenes.value = pageResult.records
    total.value = pageResult.total
  } catch (error: any) {
    ElMessage.error(error?.message || '获取场景列表失败')
  } finally {
    isLoading.value = false
  }
}

/** 跳转到编辑器 */
function goToEditor(id: number) {
  router.push({ name: 'Editor', params: { id } })
}

/** 跳转到预览（只读模式进入编辑器） */
function goToPreview(id: number) {
  router.push({ name: 'Editor', params: { id }, query: { mode: 'preview' } })
}

/** 删除场景 */
async function handleDelete(scene: Scene) {
  try {
    await ElMessageBox.confirm(
      `确定要删除场景「${scene.name}」吗？删除后不可恢复。`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await sceneApi.deleteScene(scene.id)
    ElMessage.success('场景已删除')
    fetchScenes()
  } catch {
    // 用户取消
  }
}

/** 用户下拉菜单操作 */
function handleUserCommand(command: string) {
  if (command === 'logout') {
    userStore.logout()
    router.push({ name: 'Login' })
  }
}

/** 分页切换 */
function handlePageChange(page: number) {
  currentPage.value = page
  fetchScenes()
}

/** 格式化时间 */
function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 30) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}

// ==================== 新建场景 ====================
const showCreateDialog = ref(false)
const isCreating = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  name: '',
  description: '',
})

const createRules: FormRules = {
  name: [
    { required: true, message: '请输入场景名称', trigger: 'blur' },
    { min: 2, max: 50, message: '场景名称长度为 2-50 个字符', trigger: 'blur' },
  ],
}

/** 创建场景 */
async function handleCreate() {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
  } catch {
    return
  }

  isCreating.value = true
  try {
    const res = await sceneApi.createScene({
      name: createForm.name,
      description: createForm.description,
    })
    const newScene = res.data
    ElMessage.success('场景创建成功')
    showCreateDialog.value = false
    createForm.name = ''
    createForm.description = ''
    // 跳转到编辑器
    router.push({ name: 'Editor', params: { id: newScene.id } })
  } catch (error: any) {
    ElMessage.error(error?.message || '创建场景失败')
  } finally {
    isCreating.value = false
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  fetchScenes()
})
</script>

<style scoped lang="scss">
.scenes-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #0a0e1a 0%, #111827 100%);
  padding: 32px;
}

// 页面头部
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 32px;
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  font-size: 13px;
  transition: all 0.2s;
}

.user-info:hover {
  background: var(--el-fill-color);
  color: var(--el-text-color-primary);
}

.user-name {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 场景卡片网格
.scenes-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  min-height: 300px;
}

// 场景卡片
.scene-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(59, 130, 246, 0.4);
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.5),
      0 0 30px rgba(59, 130, 246, 0.1);
  }
}

// 缩略图
.card-thumbnail {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #111827;

  .thumbnail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .thumbnail-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #111827 0%, #1a2035 100%);
    color: #334155;
  }
}

// 卡片内容
.card-body {
  padding: 16px 20px 20px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
  color: #f1f5f9;
  margin-bottom: 6px;
}

.card-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  min-height: 40px;
  margin-bottom: 12px;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(30, 41, 59, 0.6);
}

.meta-time {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
}

.edit-btn {
  flex-shrink: 0;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.preview-btn {
  flex-shrink: 0;
}

.delete-btn {
  flex-shrink: 0;
  color: var(--el-color-danger);
  border-color: transparent;
}

.delete-btn:hover {
  color: #fff;
  background: var(--el-color-danger);
  border-color: var(--el-color-danger);
}

// 空状态
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.empty-icon {
  color: #334155;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 8px;
}

.empty-desc {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}

// 分页
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

// 响应式
@media (max-width: 1200px) {
  .scenes-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .scenes-page {
    padding: 16px;
  }

  .scenes-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
