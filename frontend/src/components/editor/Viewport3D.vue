<template>
  <div ref="containerRef" class="viewport-3d"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { useThreeScene } from '@/composables/useThreeScene'
import { useRaycaster } from '@/composables/useRaycaster'
import { useDragDrop } from '@/composables/useDragDrop'
import {
  initTransformSync,
  initShortcuts,
  setTransformMode,
} from '@/composables/useTransformControls'
import { loadModel } from '@/composables/useModelLoader'
import { useEditorStore } from '@/stores/editorStore'
import { MOCK_MODELS } from '@/mock'

const containerRef = ref<HTMLDivElement>()
const route = useRoute()
const editorStore = useEditorStore()

// 是否为预览模式（只读）
const isPreview = ref(route.query.mode === 'preview')

const {
  scene,
  camera,
  renderer,
  transformControls,
  orbitControls,
  init,
  dispose,
} = useThreeScene(containerRef)

// 射线拾取（预览模式下禁用）
const { initRaycaster, disposeRaycaster } = useRaycaster({
  scene,
  camera,
  containerRef,
  transformControls,
  onSelect: (objectId: number | null) => {
    if (isPreview.value) return
    editorStore.selectObject(objectId)
  },
})

// 拖拽放置（预览模式下禁用）
const { initDropZone } = useDragDrop({
  scene,
  camera,
  containerRef,
  transformControls,
  onModelDropped: async (info) => {
    if (isPreview.value) return
    try {
      const newObject = await editorStore.addObjectToScene({
        modelAssetId: info.modelAssetId,
        name: info.name,
        objectType: 'model',
        position: [info.position.x, info.position.y, info.position.z],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      })
      info.object.userData.objectId = newObject.id
      info.object.userData.sceneObjectId = newObject.id
    } catch (error) {
      console.error('[Viewport3D] 添加模型到场景失败:', error)
      scene.value?.remove(info.object)
    }
  },
})

// 变换同步清理函数
let cleanupTransformSync: (() => void) | null = null
let cleanupShortcuts: (() => void) | null = null
// 标签可见性
let labelsVisible = true
// 当前场景中的 CSS2D 标签引用
const labelObjects: CSS2DObject[] = []

/**
 * 创建属性表格 HTML
 */
function buildPropertiesHTML(properties: Record<string, any> | null): string {
  if (!properties || Object.keys(properties).length === 0) return ''
  let rows = ''
  for (const [key, value] of Object.entries(properties)) {
    if (key.startsWith('_')) continue // 跳过内部字段
    rows += `<tr><td class="prop-key">${key}</td><td class="prop-val">${value}</td></tr>`
  }
  if (!rows) return ''
  return `<table class="prop-table">${rows}</table>`
}

/**
 * 创建 CSS2D 标签元素
 */
function createLabelElement(name: string, properties: Record<string, any> | null): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'model-label-3d'

  const propsHtml = buildPropertiesHTML(properties)

  el.innerHTML = `
    <div class="label-header">
      <span class="label-dot"></span>
      <span class="label-name">${name}</span>
    </div>
    ${propsHtml ? `<div class="label-body">${propsHtml}</div>` : ''}
  `
  return el
}

/**
 * 根据 SceneObject 数据在 3D 场景中创建模型
 */
async function rebuildSceneObjects(objects: any[]) {
  const sc = scene.value
  if (!sc) return

  // 移除场景中已有的用户对象和标签
  clearSceneObjects()

  for (const obj of objects) {
    try {
      if (obj.objectType === 'light') continue

      let modelUrl = `/api/models/${obj.modelAssetId}/file`
      const modelInfo = MOCK_MODELS.find((m) => m.id === obj.modelAssetId)
      if (modelInfo?.fileUrl) {
        modelUrl = modelInfo.fileUrl
      }

      const model = await loadModel(modelUrl)

      if (obj.position) {
        model.position.set(obj.position[0], obj.position[1], obj.position[2])
      }
      if (obj.rotation) {
        model.rotation.set(obj.rotation[0], obj.rotation[1], obj.rotation[2])
      }
      if (obj.scale) {
        model.scale.set(obj.scale[0], obj.scale[1], obj.scale[2])
      }

      model.userData = {
        objectId: obj.id,
        sceneObjectId: obj.id,
        modelAssetId: obj.modelAssetId,
        name: obj.name,
      }

      model.visible = obj.visible !== false
      sc.add(model)

      // 创建 CSS2D 标签（始终创建，通过 visible 控制显示）
      const labelEl = createLabelElement(obj.name, obj.properties)
      labelEl.style.display = labelsVisible ? '' : 'none'
      const label2D = new CSS2DObject(labelEl)
      label2D.position.set(0, 1.5, 0) // 标签在模型上方
      model.add(label2D)
      labelObjects.push(label2D)
    } catch (error) {
      console.error(`[Viewport3D] 重建模型失败: ${obj.name}`, error)
    }
  }
}

/** 从 3D 场景中查找并移除指定对象 */
function remove3DObject(objectId: number) {
  const sc = scene.value
  if (!sc) return
  sc.traverse((child) => {
    if (child.userData.objectId === objectId || child.userData.sceneObjectId === objectId) {
      const tc = transformControls.value
      if (tc && tc.object === child) {
        tc.detach()
      }
      sc.remove(child)
    }
  })
}

/** 设置 3D 对象可见性 */
function set3DObjectVisibility(objectId: number, visible: boolean) {
  const sc = scene.value
  if (!sc) return
  sc.traverse((child) => {
    if (child.userData.objectId === objectId || child.userData.sceneObjectId === objectId) {
      child.visible = visible
    }
  })
}

/** 清空 3D 场景中的所有用户对象和标签 */
function clearSceneObjects() {
  const sc = scene.value
  if (!sc) return
  const toRemove: THREE.Object3D[] = []
  sc.traverse((child) => {
    if (child.userData.objectId !== undefined || child.userData.sceneObjectId !== undefined) {
      toRemove.push(child)
    }
  })
  toRemove.forEach((obj) => sc.remove(obj))
  const tc = transformControls.value
  if (tc) tc.detach()
  labelObjects.length = 0
}

/** 设置所有标签的显示/隐藏 */
function setLabelsVisible(visible: boolean) {
  labelsVisible = visible
  labelObjects.forEach((label) => {
    const el = label.element as HTMLDivElement
    if (el) {
      if (visible) {
        el.style.opacity = '1'
        el.style.visibility = 'visible'
      } else {
        el.style.opacity = '0'
        el.style.visibility = 'hidden'
      }
    }
  })
}

onMounted(async () => {
  init()
  initRaycaster()

  if (!isPreview.value && containerRef.value) {
    initDropZone(containerRef.value)
  }

  if (!isPreview.value) {
    cleanupTransformSync = initTransformSync(transformControls, (info) => {
      if (info.objectId !== null) {
        editorStore.updateObjectTransform(info.objectId, {
          position: [info.position.x, info.position.y, info.position.z],
          rotation: [info.rotation.x, info.rotation.y, info.rotation.z],
          scale: [info.scale.x, info.scale.y, info.scale.z],
        })
      }
    })

    cleanupShortcuts = initShortcuts(transformControls, (action) => {
      switch (action.type) {
        case 'cancel':
          editorStore.selectObject(null)
          break
        case 'delete': {
          const selectedId = editorStore.selectedObjectId
          if (selectedId !== null) {
            remove3DObject(selectedId)
            editorStore.deleteSelectedObject().catch((err) => {
              console.error('删除对象失败:', err)
            })
          }
          break
        }
        case 'duplicate':
          break
      }
    })
  }

  const handleDeleteEvent = ((e: CustomEvent) => {
    if (isPreview.value) return
    remove3DObject(e.detail.objectId)
  }) as EventListener
  window.addEventListener('scene-object-delete', handleDeleteEvent)

  const handleVisibilityEvent = ((e: CustomEvent) => {
    set3DObjectVisibility(e.detail.objectId, e.detail.visible)
  }) as EventListener
  window.addEventListener('scene-object-visibility', handleVisibilityEvent)

  onBeforeUnmount(() => {
    window.removeEventListener('scene-object-delete', handleDeleteEvent)
    window.removeEventListener('scene-object-visibility', handleVisibilityEvent)
  })

  if (isPreview.value) {
    const tc = transformControls.value
    if (tc) tc.detach()
  }
})

onBeforeUnmount(() => {
  cleanupTransformSync?.()
  cleanupShortcuts?.()
  disposeRaycaster()
  dispose()
})

watch(
  () => editorStore.selectedObjectId,
  (newId) => {
    if (isPreview.value) return
    const tc = transformControls.value
    const sc = scene.value
    if (!tc || !sc) return

    if (newId !== null) {
      let target: THREE.Object3D | null = null
      sc.traverse((child) => {
        if (child.userData.objectId === newId || child.userData.sceneObjectId === newId) {
          target = child
        }
      })
      if (target) tc.attach(target)
    } else {
      tc.detach()
    }
  },
)

watch(
  () => editorStore.transformMode,
  (newMode) => {
    if (isPreview.value) return
    setTransformMode(transformControls, newMode)
  },
)

defineExpose({
  rebuildSceneObjects,
  clearSceneObjects,
  setLabelsVisible,
})
</script>

<style scoped>
.viewport-3d {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>

<!-- 全局样式：CSS2D 标签（不能用 scoped） -->
<style>
.model-label-3d {
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  user-select: none;
  transform: translateY(-8px);
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.label-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(59, 130, 246, 0.35);
  border-radius: 6px 6px 0 0;
  backdrop-filter: blur(6px);
  white-space: nowrap;
}

.label-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
  flex-shrink: 0;
}

.label-name {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
  letter-spacing: 0.3px;
}

.label-body {
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(59, 130, 246, 0.25);
  border-top: none;
  border-radius: 0 0 6px 6px;
  backdrop-filter: blur(6px);
  padding: 4px 0;
}

.prop-table {
  border-collapse: collapse;
  font-size: 11px;
  width: 100%;
}

.prop-table tr {
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.prop-table tr:last-child {
  border-bottom: none;
}

.prop-table td {
  padding: 2px 10px;
  white-space: nowrap;
}

.prop-key {
  color: #64748b;
  font-weight: 500;
}

.prop-val {
  color: #93c5fd;
  font-family: 'JetBrains Mono', 'Consolas', monospace;
  font-size: 10px;
}
</style>
