<template>
  <div class="editor-toolbar">
    <!-- 左侧：返回、保存、撤销/重做 -->
    <div class="toolbar-group">
      <el-tooltip content="返回场景列表" placement="bottom">
        <el-button size="small" :icon="ArrowLeft" @click="handleBack">
          返回
        </el-button>
      </el-tooltip>
      <el-tooltip content="保存场景 (Ctrl+S)" placement="bottom">
        <el-button
          type="primary"
          size="small"
          :icon="FolderChecked"
          :loading="editorStore.isSaving"
          @click="handleSave"
        >
          保存
        </el-button>
      </el-tooltip>
      <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
        <el-button size="small" :icon="RefreshLeft" disabled />
      </el-tooltip>
      <el-tooltip content="重做 (Ctrl+Shift+Z)" placement="bottom">
        <el-button size="small" :icon="RefreshRight" disabled />
      </el-tooltip>
    </div>

    <div class="toolbar-divider"></div>

    <!-- 变换模式按钮组 -->
    <div class="toolbar-group">
      <el-tooltip content="平移 (W)" placement="bottom">
        <el-button
          size="small"
          :icon="Rank"
          :type="editorStore.transformMode === 'translate' ? 'primary' : 'default'"
          @click="editorStore.setTransformMode('translate')"
        >
          平移
        </el-button>
      </el-tooltip>
      <el-tooltip content="旋转 (E)" placement="bottom">
        <el-button
          size="small"
          :icon="Refresh"
          :type="editorStore.transformMode === 'rotate' ? 'primary' : 'default'"
          @click="editorStore.setTransformMode('rotate')"
        >
          旋转
        </el-button>
      </el-tooltip>
      <el-tooltip content="缩放 (R)" placement="bottom">
        <el-button
          size="small"
          :icon="FullScreen"
          :type="editorStore.transformMode === 'scale' ? 'primary' : 'default'"
          @click="editorStore.setTransformMode('scale')"
        >
          缩放
        </el-button>
      </el-tooltip>
    </div>

    <div class="toolbar-divider"></div>

    <!-- 视图控制 -->
    <div class="toolbar-group">
      <el-tooltip content="网格开关" placement="bottom">
        <el-button
          size="small"
          :icon="Grid"
          :type="showGrid ? 'primary' : 'default'"
          @click="showGrid = !showGrid"
        />
      </el-tooltip>
      <el-tooltip content="阴影开关" placement="bottom">
        <el-button
          size="small"
          :icon="Sunny"
          :type="showShadow ? 'primary' : 'default'"
          @click="showShadow = !showShadow"
        />
      </el-tooltip>
    </div>

    <!-- 右侧：场景名称 -->
    <div class="toolbar-right">
      <span class="scene-name">{{ editorStore.sceneName || '未命名场景' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft,
  FolderChecked,
  RefreshLeft,
  RefreshRight,
  Rank,
  Refresh,
  FullScreen,
  Grid,
  Sunny,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useEditorStore } from '@/stores/editorStore'

const router = useRouter()
const editorStore = useEditorStore()

// 视图控制状态
const showGrid = ref(true)
const showShadow = ref(true)

// 返回场景列表
function handleBack() {
  router.push({ name: 'Scenes' })
}

// 保存场景
async function handleSave() {
  try {
    await editorStore.saveScene()
    ElMessage.success('场景保存成功')
  } catch (error) {
    console.error('保存场景失败:', error)
    ElMessage.error('保存场景失败')
  }
}
</script>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 12px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  gap: 4px;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--el-border-color);
  margin: 0 8px;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.scene-name {
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}
</style>
