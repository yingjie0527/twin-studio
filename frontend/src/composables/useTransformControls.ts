import { type Ref } from 'vue'
import * as THREE from 'three'
import type { TransformControls } from 'three/addons/controls/TransformControls.js'

/**
 * 变换控制与属性同步
 * 监听 TransformControls 的 objectChange 事件，提供键盘快捷键
 */

type TransformMode = 'translate' | 'rotate' | 'scale'

interface TransformChangeInfo {
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  scale: { x: number; y: number; z: number }
  objectId: number | null
}

interface ShortcutAction {
  type: 'cancel' | 'delete' | 'duplicate'
}

/**
 * 初始化变换控制的实时同步
 * @param transformControls TransformControls 的响应式引用
 * @param onTransformChange 变换属性变化时的回调
 */
export function initTransformSync(
  transformControls: Ref<TransformControls | null>,
  onTransformChange: (info: TransformChangeInfo) => void,
) {
  const tc = transformControls.value
  if (!tc) return

  function onObjectChange() {
    const object = tc.object
    if (!object) return

    const objectId = (object.userData.objectId as number) ?? null

    onTransformChange({
      position: {
        x: parseFloat(object.position.x.toFixed(3)),
        y: parseFloat(object.position.y.toFixed(3)),
        z: parseFloat(object.position.z.toFixed(3)),
      },
      rotation: {
        x: parseFloat(THREE.MathUtils.radToDeg(object.rotation.x).toFixed(2)),
        y: parseFloat(THREE.MathUtils.radToDeg(object.rotation.y).toFixed(2)),
        z: parseFloat(THREE.MathUtils.radToDeg(object.rotation.z).toFixed(2)),
      },
      scale: {
        x: parseFloat(object.scale.x.toFixed(3)),
        y: parseFloat(object.scale.y.toFixed(3)),
        z: parseFloat(object.scale.z.toFixed(3)),
      },
      objectId,
    })
  }

  tc.addEventListener('objectChange', onObjectChange)

  // 返回清理函数
  return () => {
    tc.removeEventListener('objectChange', onObjectChange)
  }
}

/**
 * 初始化键盘快捷键
 * @param transformControls TransformControls 的响应式引用
 * @param onAction 快捷键动作回调
 */
export function initShortcuts(
  transformControls: Ref<TransformControls | null>,
  onAction: (action: ShortcutAction) => void,
) {
  function onKeyDown(event: KeyboardEvent) {
    const tc = transformControls.value
    if (!tc) return

    // 如果焦点在输入框中，不处理快捷键
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    switch (event.key.toLowerCase()) {
      case 'w':
        tc.setMode('translate')
        break
      case 'e':
        tc.setMode('rotate')
        break
      case 'r':
        tc.setMode('scale')
        break
      case 'escape':
        tc.detach()
        onAction({ type: 'cancel' })
        break
      case 'delete':
      case 'backspace':
        onAction({ type: 'delete' })
        break
      case 'd':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          onAction({ type: 'duplicate' })
        }
        break
    }
  }

  window.addEventListener('keydown', onKeyDown)

  // 返回清理函数
  return () => {
    window.removeEventListener('keydown', onKeyDown)
  }
}

/**
 * 设置变换模式
 * @param transformControls TransformControls 的响应式引用
 * @param mode 变换模式: translate | rotate | scale
 */
export function setTransformMode(
  transformControls: Ref<TransformControls | null>,
  mode: TransformMode,
) {
  const tc = transformControls.value
  if (!tc) return
  tc.setMode(mode)
}
