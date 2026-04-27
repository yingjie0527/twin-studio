import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { USE_MOCK, MOCK_MODELS } from '@/mock'

/**
 * 3D 模型加载器
 * 全局单例 GLTFLoader + DRACOLoader，支持模型缓存和克隆
 * Mock 模式下使用本地真实 GLB 文件
 */

// ---- 全局单例加载器 ----
const gltfLoader = new GLTFLoader()

const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)

// ---- 模型缓存 ----
const modelCache = new Map<string, THREE.Group>()

/**
 * 遍历模型子对象，开启 castShadow 和 receiveShadow
 */
function enableShadows(object: THREE.Object3D) {
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.castShadow = true
      mesh.receiveShadow = true
    }
  })
}

/**
 * 计算包围盒并将模型居中到原点
 */
function centerModel(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object)
  const center = box.getCenter(new THREE.Vector3())
  const size = box.getSize(new THREE.Vector3())

  // 将模型的几何中心移动到原点
  object.position.sub(center)
  // 让模型底部落在 y=0 平面
  object.position.y += size.y / 2
}

/**
 * Mock 模式下：将 API 路径映射到本地真实 GLB 文件路径
 * /api/models/{id}/file -> /models/{filename}.glb
 */
function resolveMockUrl(url: string): string {
  const idMatch = url.match(/\/api\/models\/(\d+)/)
  if (!idMatch) return url
  const modelId = parseInt(idMatch[1])
  const model = MOCK_MODELS.find((m) => m.id === modelId)
  if (model?.fileUrl) return model.fileUrl
  return url
}

/**
 * 加载 GLTF/GLB 模型
 * @param url 模型文件 URL
 * @param onProgress 加载进度回调
 * @returns Promise<THREE.Group> 返回模型克隆实例
 */
export function loadModel(
  url: string,
  onProgress?: (event: ProgressEvent) => void,
): Promise<THREE.Group> {
  return new Promise((resolve, reject) => {
    // 如果缓存中已有该模型，直接返回克隆
    if (modelCache.has(url)) {
      const cached = modelCache.get(url)!
      const cloned = cached.clone(true)
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.castShadow = true
          mesh.receiveShadow = true
        }
      })
      resolve(cloned)
      return
    }

    // Mock 模式：将 API 路径替换为本地文件路径
    const loadUrl = USE_MOCK ? resolveMockUrl(url) : url

    gltfLoader.load(
      loadUrl,
      (gltf) => {
        const model = gltf.scene

        // 开启阴影
        enableShadows(model)

        // 居中模型
        centerModel(model)

        // 存入缓存（用原始 URL 作为 key）
        modelCache.set(url, model)

        // 返回克隆实例，确保每个放置的模型独立
        const cloned = model.clone(true)
        cloned.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh
            mesh.castShadow = true
            mesh.receiveShadow = true
          }
        })

        resolve(cloned)
      },
      onProgress,
      (error) => {
        console.error(`[useModelLoader] 加载模型失败: ${loadUrl}`, error)
        reject(error)
      },
    )
  })
}

/**
 * 获取当前模型缓存
 */
export function getModelCache(): ReadonlyMap<string, THREE.Group> {
  return modelCache
}

/**
 * 清除指定 URL 的缓存
 */
export function clearModelCache(url?: string) {
  if (url) {
    const cached = modelCache.get(url)
    if (cached) {
      cached.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.geometry?.dispose()
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          } else {
            mesh.material?.dispose()
          }
        }
      })
    }
    modelCache.delete(url)
  } else {
    modelCache.forEach((cached) => {
      cached.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          mesh.geometry?.dispose()
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose())
          } else {
            mesh.material?.dispose()
          }
        }
      })
    })
    modelCache.clear()
  }
}
