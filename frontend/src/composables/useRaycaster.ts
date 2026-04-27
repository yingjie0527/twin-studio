import { type Ref } from 'vue'
import * as THREE from 'three'
import type { TransformControls } from 'three/addons/controls/TransformControls.js'

/**
 * 射线拾取（点击选中模型）
 * 区分点击和拖拽，向上查找带 userData.objectId 的对象
 */

interface RaycasterOptions {
  scene: Ref<THREE.Scene | null>
  camera: Ref<THREE.PerspectiveCamera | null>
  containerRef: Ref<HTMLDivElement | undefined>
  transformControls: Ref<TransformControls | null>
  onSelect: (objectId: number | null) => void
}

const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2()

export function useRaycaster(options: RaycasterOptions) {
  const { scene, camera, containerRef, transformControls, onSelect } = options

  let pointerDownPos = { x: 0, y: 0 }
  let isDragging = false
  let isTransformDragging = false

  /**
   * 向上遍历对象树，查找带有 userData.objectId 的对象
   */
  function findObjectId(object: THREE.Object3D): number | null {
    let current: THREE.Object3D | null = object
    while (current) {
      if (current.userData.objectId !== undefined && current.userData.objectId !== null) {
        return current.userData.objectId as number
      }
      current = current.parent
    }
    return null
  }

  /**
   * 获取射线与场景对象的交点
   */
  function getIntersects(clientX: number, clientY: number): THREE.Intersection[] {
    const container = containerRef.value
    const cam = camera.value
    const sc = scene.value
    if (!container || !cam || !sc) return []

    const rect = container.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, cam)
    return raycaster.intersectObjects(sc.children, true)
  }

  function onPointerDown(event: PointerEvent) {
    pointerDownPos.x = event.clientX
    pointerDownPos.y = event.clientY
    isDragging = false
  }

  function onPointerMove(event: PointerEvent) {
    const dx = event.clientX - pointerDownPos.x
    const dy = event.clientY - pointerDownPos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > 5) {
      isDragging = true
    }
  }

  function onPointerUp(event: PointerEvent) {
    // TransformControls 拖拽中不处理
    if (isTransformDragging) return

    // 拖拽距离超过 5px 视为拖拽操作，不触发选择
    if (isDragging) return

    const intersects = getIntersects(event.clientX, event.clientY)

    if (intersects.length > 0) {
      const hit = intersects[0].object
      const objectId = findObjectId(hit)
      if (objectId !== null) {
        onSelect(objectId)
      } else {
        // 点击了场景中的对象但没有 objectId（如网格地面），取消选择
        onSelect(null)
      }
    } else {
      // 点击空白区域，取消选择
      onSelect(null)
    }
  }

  /**
   * 初始化射线拾取
   */
  function initRaycaster() {
    const container = containerRef.value
    if (!container) return

    // 监听 TransformControls 的拖拽状态
    const tc = transformControls.value
    if (tc) {
      tc.addEventListener('dragging-changed', (event: { value: boolean }) => {
        isTransformDragging = event.value
      })
    }

    container.addEventListener('pointerdown', onPointerDown)
    container.addEventListener('pointermove', onPointerMove)
    container.addEventListener('pointerup', onPointerUp)
  }

  /**
   * 清理事件监听
   */
  function disposeRaycaster() {
    const container = containerRef.value
    if (!container) return

    container.removeEventListener('pointerdown', onPointerDown)
    container.removeEventListener('pointermove', onPointerMove)
    container.removeEventListener('pointerup', onPointerUp)
  }

  return {
    initRaycaster,
    disposeRaycaster,
  }
}
