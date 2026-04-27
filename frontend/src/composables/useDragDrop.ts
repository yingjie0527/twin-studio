import { type Ref } from 'vue'
import * as THREE from 'three'
import type { TransformControls } from 'three/addons/controls/TransformControls.js'
import { loadModel } from './useModelLoader'

/**
 * 拖拽模型到场景
 * 从外部面板拖拽模型资源到 3D 场景中放置
 */

interface DragDropOptions {
  scene: Ref<THREE.Scene | null>
  camera: Ref<THREE.PerspectiveCamera | null>
  containerRef: Ref<HTMLDivElement | undefined>
  transformControls: Ref<TransformControls | null>
  onModelDropped: (info: {
    modelAssetId: number
    name: string
    position: { x: number; y: number; z: number }
    object: THREE.Object3D
  }) => void
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const intersectPoint = new THREE.Vector3()

export function useDragDrop(options: DragDropOptions) {
  const { scene, camera, containerRef, transformControls, onModelDropped } = options

  /**
   * 获取鼠标射线与 y=0 平面的交点
   */
  function getGroundIntersection(clientX: number, clientY: number): THREE.Vector3 | null {
    const container = containerRef.value
    const cam = camera.value
    if (!container || !cam) return null

    const rect = container.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, cam)

    const target = new THREE.Vector3()
    const hit = raycaster.ray.intersectPlane(groundPlane, target)
    return hit ? target : null
  }

  /**
   * 初始化拖拽放置区域
   */
  function initDropZone(containerEl: HTMLElement) {
    // 阻止默认的拖拽行为（允许放置）
    containerEl.addEventListener('dragover', (event: DragEvent) => {
      event.preventDefault()
      event.dataTransfer!.dropEffect = 'copy'
    })

    // 阻止 dragenter 默认行为
    containerEl.addEventListener('dragenter', (event: DragEvent) => {
      event.preventDefault()
    })

    // 处理放置
    containerEl.addEventListener('drop', async (event: DragEvent) => {
      event.preventDefault()

      const sc = scene.value
      if (!sc) return

      // 从 dataTransfer 中读取模型信息
      const dataTransfer = event.dataTransfer
      if (!dataTransfer) return

      const modelIdStr = dataTransfer.getData('model-id')
      const modelName = dataTransfer.getData('model-name')
      const modelUrl = dataTransfer.getData('model-url')

      if (!modelIdStr || !modelName) {
        console.warn('[useDragDrop] 缺少 model-id 或 model-name')
        return
      }

      const modelAssetId = parseInt(modelIdStr, 10)
      if (isNaN(modelAssetId)) {
        console.warn('[useDragDrop] model-id 无效:', modelIdStr)
        return
      }

      // 计算放置坐标（鼠标射线与 y=0 平面交点）
      const position = getGroundIntersection(event.clientX, event.clientY)
      if (!position) {
        console.warn('[useDragDrop] 无法计算放置坐标')
        return
      }

      try {
        // 加载模型
        const url = modelUrl || `/api/models/${modelAssetId}/file`
        const model = await loadModel(url)

        // 设置放置位置
        model.position.copy(position)

        // 设置用户数据
        model.userData = {
          modelAssetId,
          name: modelName,
          isNew: true,
        }

        // 添加到场景
        sc.add(model)

        // 回调通知
        onModelDropped({
          modelAssetId,
          name: modelName,
          position: {
            x: parseFloat(position.x.toFixed(3)),
            y: parseFloat(position.y.toFixed(3)),
            z: parseFloat(position.z.toFixed(3)),
          },
          object: model,
        })
      } catch (error) {
        console.error('[useDragDrop] 加载模型失败:', error)
      }
    })
  }

  return {
    initDropZone,
  }
}
