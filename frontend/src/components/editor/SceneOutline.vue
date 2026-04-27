<template>
  <div class="scene-outline">
    <!-- 面板标题 -->
    <div class="panel-header">
      <span class="panel-title">场景大纲</span>
      <span class="object-count">{{ editorStore.sceneObjects.length }} 个对象</span>
    </div>

    <!-- 对象列表 -->
    <div class="outline-list">
      <div
        v-for="obj in editorStore.sceneObjects"
        :key="obj.id"
        class="outline-item"
        :class="{ selected: editorStore.selectedObjectId === obj.id }"
        @click="handleSelect(obj.id)"
      >
        <!-- 对象图标 -->
        <el-icon class="item-icon" :size="16">
          <component :is="getObjectIcon(obj.objectType)" />
        </el-icon>

        <!-- 对象名称 -->
        <span class="item-name" :title="obj.name">{{ obj.name }}</span>

        <!-- 操作按钮组 -->
        <div class="item-actions">
          <!-- 显示/隐藏切换 -->
          <el-icon
            class="action-icon"
            :class="{ 'is-hidden': !obj.visible }"
            :size="14"
            @click.stop="handleToggleVisible(obj)"
          >
            <View v-if="obj.visible" />
            <Hide v-else />
          </el-icon>
          <!-- 删除按钮 -->
          <el-icon
            class="action-icon delete-icon"
            :size="14"
            @click.stop="handleDelete(obj)"
          >
            <Delete />
          </el-icon>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="editorStore.sceneObjects.length === 0" class="empty-state">
        <span>场景为空</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { markRaw } from 'vue'
import {
  Box,
  Sunny,
  Camera,
  SetUp,
  FolderOpened,
  View,
  Hide,
  Delete,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useEditorStore } from '@/stores/editorStore'
import type { SceneObject } from '@/types'

const editorStore = useEditorStore()

// 对象类型图标映射
const iconMap: Record<string, ReturnType<typeof markRaw>> = {
  model: markRaw(Box),
  light: markRaw(Sunny),
  camera: markRaw(Camera),
  helper: markRaw(SetUp),
  group: markRaw(FolderOpened),
}

function getObjectIcon(type: string) {
  return iconMap[type] || Box
}

// 点击选中
function handleSelect(id: number) {
  editorStore.selectObject(id)
}

// 切换可见性（本地更新 + 同步 3D 场景）
function handleToggleVisible(obj: SceneObject) {
  const newVisible = !obj.visible
  // 本地直接更新，不依赖 API 返回
  const target = editorStore.sceneObjects.find(o => o.id === obj.id)
  if (target) {
    target.visible = newVisible
  }
  // 触发 3D 场景中的可见性更新（通过自定义事件）
  window.dispatchEvent(new CustomEvent('scene-object-visibility', {
    detail: { objectId: obj.id, visible: newVisible },
  }))
  // 异步保存到服务端（不阻塞 UI）
  editorStore.updateObjectProperties(obj.id, { visible: newVisible }).catch(() => {
    ElMessage.error('更新可见性失败')
  })
}

// 删除对象
async function handleDelete(obj: SceneObject) {
  try {
    await ElMessageBox.confirm(
      `确定要删除「${obj.name}」吗？`,
      '删除确认',
      { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
    )
    await editorStore.deleteSelectedObject()
    // 通知 3D 场景移除对象
    window.dispatchEvent(new CustomEvent('scene-object-delete', {
      detail: { objectId: obj.id },
    }))
    ElMessage.success('已删除')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.scene-outline {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--el-border-color);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  letter-spacing: 0.5px;
}

.object-count {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

.outline-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.outline-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  cursor: pointer;
  transition: background-color 0.15s;
  user-select: none;
}

.outline-item:hover {
  background: var(--el-fill-color);
}

.outline-item.selected {
  background: rgba(64, 158, 255, 0.12);
  border-right: 2px solid var(--el-color-primary);
}

.item-icon {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.item-name {
  flex: 1;
  font-size: 12px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-icon {
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  transition: color 0.15s;
  padding: 2px;
  border-radius: 3px;
}

.action-icon:hover {
  color: var(--el-color-primary);
  background: rgba(64, 158, 255, 0.08);
}

.action-icon.is-hidden {
  color: var(--el-text-color-disabled);
  opacity: 0.5;
}

.delete-icon:hover {
  color: var(--el-color-danger);
  background: rgba(245, 108, 108, 0.08);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>
