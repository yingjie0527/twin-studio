<template>
  <div class="editor-view" :class="{ 'preview-mode': isPreview }">
    <!-- 顶部工具栏（预览模式隐藏） -->
    <header v-if="!isPreview" class="editor-header">
      <EditorToolbar />
    </header>

    <!-- 预览模式顶部提示栏 -->
    <header v-else class="editor-header preview-header">
      <div class="preview-info">
        <el-icon :size="16"><View /></el-icon>
        <span>预览模式</span>
        <span class="preview-scene-name">{{ editorStore.sceneName || '未命名场景' }}</span>
      </div>
      <div class="preview-actions">
        <el-button
          size="small"
          :type="showLabels ? 'primary' : 'default'"
          @click="toggleLabels"
        >
          <el-icon :size="12"><View v-if="showLabels" /><Hide v-else /></el-icon>
          {{ showLabels ? '隐藏标签' : '显示标签' }}
        </el-button>
        <el-button size="small" @click="handleBackToScenes">
          <el-icon :size="12"><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </header>

    <!-- 主体三栏布局 -->
    <div class="editor-body" :class="{ 'preview-body': isPreview }">
      <!-- 左侧面板（预览模式隐藏） -->
      <aside v-if="!isPreview" class="editor-left">
        <div class="left-top">
          <ModelLibraryPanel />
        </div>
        <div class="left-bottom">
          <SceneOutline />
        </div>
      </aside>

      <!-- 中间 3D 视口 -->
      <main class="editor-viewport">
        <Viewport3D ref="viewportRef" />
        <!-- 加载遮罩 -->
        <Transition name="loading-fade">
          <div v-if="isLoadingScene" class="loading-overlay">
            <div class="loading-content">
              <div class="loading-spinner"></div>
              <span class="loading-text">场景加载中...</span>
            </div>
          </div>
        </Transition>
        <!-- WebGL 不可用提示 -->
        <div v-if="webglError" class="webgl-error-overlay">
          <div class="error-content">
            <el-icon :size="48" color="#f56c6c"><WarningFilled /></el-icon>
            <h3>WebGL 不可用</h3>
            <p>当前浏览器环境不支持 WebGL，无法渲染 3D 场景。</p>
            <p class="error-hint">请在本地浏览器（Chrome / Edge）中打开此页面以使用完整功能。</p>
          </div>
        </div>
      </main>

      <!-- 右侧属性面板（预览模式隐藏） -->
      <aside v-if="!isPreview" class="editor-right">
        <PropertiesPanel />
      </aside>
    </div>

    <!-- 底部状态栏 -->
    <footer class="editor-statusbar">
      <div class="statusbar-left">
        <span class="status-item">
          <el-icon :size="12"><Folder /></el-icon>
          {{ editorStore.sceneName || '未命名场景' }}
        </span>
        <span class="status-divider">|</span>
        <span class="status-item">
          {{ editorStore.sceneObjects.length }} 个对象
        </span>
        <span v-if="isPreview" class="status-divider">|</span>
        <span v-if="isPreview" class="status-item preview-badge">只读</span>
      </div>
      <div class="statusbar-right">
        <span class="status-item fps-display">FPS: {{ fps }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Folder, View, ArrowLeft, Hide, WarningFilled } from '@element-plus/icons-vue'
import { useEditorStore } from '@/stores/editorStore'
import EditorToolbar from '@/components/editor/EditorToolbar.vue'
import ModelLibraryPanel from '@/components/editor/ModelLibraryPanel.vue'
import SceneOutline from '@/components/editor/SceneOutline.vue'
import Viewport3D from '@/components/editor/Viewport3D.vue'
import PropertiesPanel from '@/components/editor/PropertiesPanel.vue'

const route = useRoute()
const router = useRouter()
const editorStore = useEditorStore()

// Viewport3D 组件引用
const viewportRef = ref<InstanceType<typeof Viewport3D> | null>(null)

// 是否为预览模式
const isPreview = computed(() => route.query.mode === 'preview')

// 加载状态
const isLoadingScene = ref(false)
// WebGL 不可用提示
const webglError = ref(false)

// 标签显示控制
const showLabels = ref(true)

function toggleLabels() {
  showLabels.value = !showLabels.value
  viewportRef.value?.setLabelsVisible(showLabels.value)
}

// FPS 计算
const fps = ref(0)
let frameCount = 0
let lastFpsTime = performance.now()
let fpsAnimationId: number | null = null

function updateFps() {
  frameCount++
  const now = performance.now()
  const elapsed = now - lastFpsTime
  if (elapsed >= 1000) {
    fps.value = Math.round((frameCount * 1000) / elapsed)
    frameCount = 0
    lastFpsTime = now
  }
  fpsAnimationId = requestAnimationFrame(updateFps)
}

function handleBackToScenes() {
  router.push({ name: 'Scenes' })
}

onMounted(async () => {
  // 检测 WebGL 是否可用
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      webglError.value = true
      isLoadingScene.value = false
      return
    }
  } catch {
    webglError.value = true
    isLoadingScene.value = false
    return
  }

  const sceneId = Number(route.params.id)
  if (!isNaN(sceneId)) {
    isLoadingScene.value = true
    try {
      // 先清空 store 中的旧数据，确保后续赋值能触发变化
      editorStore.sceneObjects = []

      await editorStore.loadScene(sceneId)

      // 等待 Vue 更新 DOM 和子组件挂载
      await nextTick()

      // 直接调用 Viewport3D 的重建方法，不依赖 watch
      if (viewportRef.value && editorStore.sceneObjects.length > 0) {
        await viewportRef.value.rebuildSceneObjects(editorStore.sceneObjects)
      }

      console.log('[EditorView] 场景加载完成，对象数量:', editorStore.sceneObjects.length)
    } catch (error) {
      console.error('加载场景失败:', error)
    } finally {
      isLoadingScene.value = false
    }
  }
  // 启动 FPS 计算
  fpsAnimationId = requestAnimationFrame(updateFps)
})

onBeforeUnmount(() => {
  if (fpsAnimationId !== null) {
    cancelAnimationFrame(fpsAnimationId)
  }
})
</script>

<style scoped>
.editor-view {
  display: grid;
  grid-template-rows: 44px 1fr 28px;
  grid-template-columns: 1fr;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a0e1a;
}

.editor-header {
  grid-row: 1;
  grid-column: 1;
  z-index: 10;
}

/* 预览模式顶部栏 */
.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(59, 130, 246, 0.3);
  backdrop-filter: blur(8px);
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #60a5fa;
  font-size: 13px;
  font-weight: 500;
}

.preview-scene-name {
  color: #94a3b8;
  font-weight: 400;
  margin-left: 4px;
}

.preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-body {
  grid-row: 2;
  grid-column: 1;
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  grid-template-rows: 1fr;
  overflow: hidden;
}

/* 预览模式：视口占满 */
.preview-body {
  grid-template-columns: 0px 1fr 0px;
}

/* 左侧面板 */
.editor-left {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 5;
}

.left-top {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.left-bottom {
  height: 240px;
  flex-shrink: 0;
  overflow: hidden;
}

/* 中间视口 */
.editor-viewport {
  grid-column: 2;
  grid-row: 1;
  overflow: hidden;
  position: relative;
}

/* 右侧面板 */
.editor-right {
  grid-column: 3;
  grid-row: 1;
  overflow: hidden;
  z-index: 5;
}

/* 加载遮罩 */
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 26, 0.85);
  backdrop-filter: blur(4px);
  z-index: 20;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #94a3b8;
  letter-spacing: 1px;
}

/* 加载动画过渡 */
.loading-fade-enter-active {
  transition: opacity 0.3s ease;
}

.loading-fade-leave-active {
  transition: opacity 0.5s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}

/* WebGL 不可用提示 */
.webgl-error-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 14, 26, 0.95);
  z-index: 25;
}

.error-content {
  text-align: center;
  color: #e2e8f0;
}

.error-content h3 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #f56c6c;
}

.error-content p {
  margin: 4px 0;
  font-size: 13px;
  color: #94a3b8;
}

.error-hint {
  margin-top: 12px !important;
  padding: 8px 16px;
  background: rgba(245, 108, 108, 0.1);
  border-radius: 6px;
  color: #f89898 !important;
  font-size: 12px !important;
}

/* 底部状态栏 */
.editor-statusbar {
  grid-row: 3;
  grid-column: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
  z-index: 10;
}

.statusbar-left,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  font-family: var(--font-mono);
}

.status-divider {
  color: var(--el-border-color);
  font-size: 11px;
}

.fps-display {
  min-width: 60px;
  text-align: right;
}

.preview-badge {
  padding: 1px 6px;
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
}
</style>
