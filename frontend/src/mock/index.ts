import type { Result } from '@/types/api'
import type { SceneObject } from '@/types'

/**
 * Mock 数据层
 * 当后端服务不可用时，直接返回模拟数据
 * 通过环境变量 VITE_USE_MOCK=true 启用
 */

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

// ==================== Mock 数据 ====================

export const MOCK_USER = {
  token: 'mock-jwt-token-' + Date.now(),
  username: 'admin',
  nickname: '管理员',
  role: 'admin',
}

export const MOCK_SCENES = [
  {
    id: 1,
    name: '智慧园区数字孪生',
    description: '园区整体数字孪生场景，包含仓库、车间、办公楼等建筑',
    thumbnail: '',
    backgroundColor: '#1a1a2e',
    ambientLight: { color: '#ffffff', intensity: 0.6 },
    groundSettings: { show: true, gridSize: 100, color: '#444444' },
    cameraSettings: { position: [15, 12, 15], target: [0, 0, 0] },
    createdBy: 1,
    createdAt: '2026-04-20 10:00:00',
    updatedAt: '2026-04-26 16:30:00',
  },
  {
    id: 2,
    name: '工厂产线模拟',
    description: '生产线数字孪生，模拟设备运行状态',
    thumbnail: '',
    backgroundColor: '#0d1321',
    ambientLight: { color: '#ffffff', intensity: 0.5 },
    groundSettings: { show: true, gridSize: 50, color: '#333333' },
    cameraSettings: { position: [10, 8, 10], target: [0, 0, 0] },
    createdBy: 1,
    createdAt: '2026-04-22 14:00:00',
    updatedAt: '2026-04-25 09:15:00',
  },
  {
    id: 3,
    name: '物流仓储中心',
    description: '仓储物流中心三维可视化',
    thumbnail: '',
    backgroundColor: '#111827',
    ambientLight: { color: '#ffffff', intensity: 0.7 },
    groundSettings: { show: true, gridSize: 80, color: '#3a3a3a' },
    cameraSettings: { position: [20, 15, 20], target: [0, 0, 0] },
    createdBy: 1,
    createdAt: '2026-04-24 08:30:00',
    updatedAt: '2026-04-26 11:00:00',
  },
]

export const MOCK_SCENE_OBJECTS: SceneObject[] = []

/**
 * 运行时对象存储
 * 当用户在编辑器中添加/更新对象时，存储完整数据
 * PUT 操作需要查到原始对象并合并，确保返回完整 SceneObject
 */
const runtimeObjects = new Map<number, SceneObject>()

/**
 * 运行时场景对象存储（按场景 ID 分组）
 * 使用 localStorage 持久化，页面刷新后数据不丢失
 */
const STORAGE_KEY = 'dt_mock_scene_objects'

function loadSceneObjectsFromStorage(): Map<number, SceneObject[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      const map = new Map<number, SceneObject[]>()
      for (const [key, value] of Object.entries(data)) {
        map.set(Number(key), value as SceneObject[])
      }
      // 恢复 runtimeObjects
      for (const objects of map.values()) {
        for (const obj of objects) {
          runtimeObjects.set(obj.id, obj as SceneObject)
        }
      }
      return map
    }
  } catch (e) {
    console.error('[Mock] 读取 localStorage 失败:', e)
  }
  return new Map()
}

function saveSceneObjectsToStorage() {
  try {
    const data: Record<string, SceneObject[]> = {}
    for (const [key, value] of runtimeSceneObjects) {
      data[String(key)] = value
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('[Mock] 写入 localStorage 失败:', e)
  }
}

const runtimeSceneObjects = loadSceneObjectsFromStorage()

export const MOCK_MODELS = [
  {
    id: 1,
    name: '东京街景',
    originalName: 'LittlestTokyo.glb',
    fileType: 'glb',
    fileSize: 4133072,
    storagePath: 'models/LittlestTokyo.glb',
    fileUrl: '/models/LittlestTokyo.glb',
    thumbnail: '',
    category: '场景',
    description: '精致的东京街景微缩模型，含建筑、街道、动画',
    boundingBox: { min: [-15, 0, -15], max: [15, 15, 15] },
    vertexCount: 125000,
    faceCount: 83000,
    hasDraco: false,
    hasAnimation: true,
    tags: ['街景', '建筑', '城市', '日本'],
    uploadTime: '2026-04-18 10:00:00',
  },
  {
    id: 2,
    name: '损坏头盔',
    originalName: 'DamagedHelmet.glb',
    fileType: 'glb',
    fileSize: 3773916,
    storagePath: 'models/DamagedHelmet.glb',
    fileUrl: '/models/DamagedHelmet.glb',
    thumbnail: '',
    category: '道具',
    description: '科幻风格损坏头盔，高精度 PBR 材质',
    boundingBox: { min: [-0.5, 0, -0.5], max: [0.5, 0.8, 0.5] },
    vertexCount: 24600,
    faceCount: 16400,
    hasDraco: false,
    hasAnimation: false,
    tags: ['头盔', '科幻', '道具'],
    uploadTime: '2026-04-19 14:00:00',
  },
  {
    id: 3,
    name: '牛奶运输车',
    originalName: 'CesiumMilkTruck.glb',
    fileType: 'glb',
    fileSize: 542144,
    storagePath: 'models/CesiumMilkTruck.glb',
    fileUrl: '/models/CesiumMilkTruck.glb',
    thumbnail: '',
    category: '车辆',
    description: '低多边形牛奶运输卡车模型',
    boundingBox: { min: [-2, 0, -1], max: [3, 2, 1.5] },
    vertexCount: 4200,
    faceCount: 2800,
    hasDraco: false,
    hasAnimation: false,
    tags: ['卡车', '车辆', '物流', '低多边形'],
    uploadTime: '2026-04-20 09:00:00',
  },
  {
    id: 4,
    name: '士兵角色',
    originalName: 'Soldier.glb',
    fileType: 'glb',
    fileSize: 2160468,
    storagePath: 'models/Soldier.glb',
    fileUrl: '/models/Soldier.glb',
    thumbnail: '',
    category: '角色',
    description: '带骨骼动画的士兵角色模型',
    boundingBox: { min: [-0.5, 0, -0.5], max: [0.5, 1.8, 0.5] },
    vertexCount: 8600,
    faceCount: 5700,
    hasDraco: false,
    hasAnimation: true,
    tags: ['士兵', '角色', '人物', '动画'],
    uploadTime: '2026-04-21 11:00:00',
  },
  {
    id: 5,
    name: '鸭子模型',
    originalName: 'Duck.glb',
    fileType: 'glb',
    fileSize: 32464,
    storagePath: 'models/Duck.glb',
    fileUrl: '/models/Duck.glb',
    thumbnail: '',
    category: '动物',
    description: '经典 three.js 鸭子测试模型',
    boundingBox: { min: [-1, 0, -1], max: [1, 1, 1] },
    vertexCount: 1400,
    faceCount: 960,
    hasDraco: false,
    hasAnimation: false,
    tags: ['鸭子', '动物', '测试'],
    uploadTime: '2026-04-22 08:00:00',
  },
  {
    id: 6,
    name: '纹理方块',
    originalName: 'BoxTextured.glb',
    fileType: 'glb',
    fileSize: 5956,
    storagePath: 'models/BoxTextured.glb',
    fileUrl: '/models/BoxTextured.glb',
    thumbnail: '',
    category: '基础',
    description: '带纹理贴图的立方体基础模型',
    boundingBox: { min: [-0.5, -0.5, -0.5], max: [0.5, 0.5, 0.5] },
    vertexCount: 24,
    faceCount: 12,
    hasDraco: false,
    hasAnimation: false,
    tags: ['方块', '基础', '纹理'],
    uploadTime: '2026-04-23 15:00:00',
  },
]

// ==================== Mock 处理器 ====================

interface MockHandler {
  method: string
  url: RegExp
  handler: (url: string, data?: any) => Result<any>
}

const mockHandlers: MockHandler[] = [
  // ---- 认证 ----
  {
    method: 'POST',
    url: /\/api\/auth\/login/,
    handler: (_url, data) => {
      return {
        code: 200,
        message: '登录成功',
        data: { ...MOCK_USER, username: data?.username || 'admin', nickname: data?.username || '管理员' },
        timestamp: Date.now(),
      }
    },
  },
  {
    method: 'POST',
    url: /\/api\/auth\/register/,
    handler: (_url, data) => ({
      code: 200,
      message: '注册成功',
      data: { ...MOCK_USER, username: data?.username || 'user', nickname: data?.nickname || '用户' },
      timestamp: Date.now(),
    }),
  },
  {
    method: 'GET',
    url: /\/api\/auth\/userinfo/,
    handler: () => ({ code: 200, message: 'success', data: MOCK_USER, timestamp: Date.now() }),
  },

  // ---- 场景 ----
  {
    method: 'GET',
    url: /\/api\/scenes\/(\d+)$/,
    handler: (url) => {
      const id = parseInt(url.match(/\/api\/scenes\/(\d+)/)?.[1] || '0')
      const scene = MOCK_SCENES.find((s) => s.id === id)
      if (!scene) return { code: 404, message: '场景不存在', data: null, timestamp: Date.now() }
      // 优先从运行时存储读取对象（保存后的数据），其次从静态数据读取
      const objects = runtimeSceneObjects.get(id) || MOCK_SCENE_OBJECTS.filter((o) => o.sceneId === id)
      return { code: 200, message: 'success', data: { ...scene, objects }, timestamp: Date.now() }
    },
  },
  {
    method: 'GET',
    url: /\/api\/scenes(\?.*)?$/,
    handler: () => ({
      code: 200,
      message: 'success',
      data: { total: MOCK_SCENES.length, records: MOCK_SCENES, page: 1, size: 20 },
      timestamp: Date.now(),
    }),
  },
  {
    method: 'POST',
    url: /\/api\/scenes$/,
    handler: (_url, data) => ({
      code: 200,
      message: '创建成功',
      data: {
        id: Date.now(),
        name: data?.name || '新场景',
        description: data?.description || '',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      },
      timestamp: Date.now(),
    }),
  },
  {
    method: 'PUT',
    url: /\/api\/scenes\/(\d+)$/,
    handler: (_url, data) => {
      const sceneId = parseInt(_url.match(/\/api\/scenes\/(\d+)/)?.[1] || '0')
      // 如果请求中包含 objects，持久化到运行时存储
      if (data?.objects && Array.isArray(data.objects)) {
        runtimeSceneObjects.set(sceneId, data.objects)
        // 同步更新 runtimeObjects
        data.objects.forEach((obj: SceneObject) => {
          runtimeObjects.set(obj.id, { ...obj })
        })
        // 持久化到 localStorage
        saveSceneObjectsToStorage()
        console.log(`[Mock] 场景 ${sceneId} 已保存，对象数量: ${data.objects.length}`)
      }
      // 更新场景基本信息
      const scene = MOCK_SCENES.find((s) => s.id === sceneId)
      if (scene && data?.name) {
        scene.name = data.name
      }
      if (scene && data?.description !== undefined) {
        scene.description = data.description
      }
      return { code: 200, message: '保存成功', data: null, timestamp: Date.now() }
    },
  },
  {
    method: 'DELETE',
    url: /\/api\/scenes\/(\d+)$/,
    handler: (_url) => {
      const sceneId = parseInt(_url.match(/\/api\/scenes\/(\d+)/)?.[1] || '0')
      // 从静态数据中删除
      const idx = MOCK_SCENES.findIndex((s) => s.id === sceneId)
      if (idx !== -1) MOCK_SCENES.splice(idx, 1)
      // 从运行时存储中删除
      runtimeSceneObjects.delete(sceneId)
      // 清理 runtimeObjects 中属于该场景的对象
      for (const [objId, obj] of runtimeObjects) {
        if (obj.sceneId === sceneId) runtimeObjects.delete(objId)
      }
      // 同步 localStorage
      saveSceneObjectsToStorage()
      console.log(`[Mock] 场景 ${sceneId} 已删除`)
      return { code: 200, message: '删除成功', data: null, timestamp: Date.now() }
    },
  },

  // ---- 场景对象 ----
  {
    method: 'POST',
    url: /\/api\/scenes\/(\d+)\/objects/,
    handler: (_url, data) => {
      const newObj: SceneObject = {
        id: Date.now(),
        sceneId: parseInt(_url.match(/\/api\/scenes\/(\d+)/)?.[1] || '0'),
        modelAssetId: data?.modelAssetId ?? null,
        name: data?.name || '未命名对象',
        objectType: data?.objectType || 'model',
        parentId: data?.parentId ?? null,
        position: data?.position || [0, 0, 0],
        rotation: data?.rotation || [0, 0, 0],
        scale: data?.scale || [1, 1, 1],
        visible: true,
        locked: false,
        sortOrder: 0,
        properties: data?.properties || null,
        userData: null,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }
      // 存入运行时存储，供后续 PUT 查询
      runtimeObjects.set(newObj.id, { ...newObj })
      return {
        code: 200,
        message: '添加成功',
        data: newObj,
        timestamp: Date.now(),
      }
    },
  },
  {
    method: 'PUT',
    url: /\/api\/scenes\/(\d+)\/objects\/(\d+)/,
    handler: (_url, data) => {
      const objId = parseInt(_url.match(/\/objects\/(\d+)/)?.[1] || '0')
      // 从运行时存储中找到原始完整对象
      const existing = runtimeObjects.get(objId)
      // 合并：原始对象 + 更新数据，确保返回完整 SceneObject
      const updated: SceneObject = {
        id: objId,
        sceneId: existing?.sceneId ?? parseInt(_url.match(/\/api\/scenes\/(\d+)/)?.[1] || '0'),
        modelAssetId: existing?.modelAssetId ?? null,
        name: data?.name ?? existing?.name ?? '未命名对象',
        objectType: existing?.objectType ?? 'model',
        parentId: existing?.parentId ?? null,
        position: data?.position ?? existing?.position ?? [0, 0, 0],
        rotation: data?.rotation ?? existing?.rotation ?? [0, 0, 0],
        scale: data?.scale ?? existing?.scale ?? [1, 1, 1],
        visible: data?.visible ?? existing?.visible ?? true,
        locked: existing?.locked ?? false,
        sortOrder: existing?.sortOrder ?? 0,
        properties: data?.properties ?? existing?.properties ?? null,
        userData: existing?.userData ?? null,
        createdAt: existing?.createdAt ?? new Date().toISOString().replace('T', ' ').slice(0, 19),
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      }
      // 更新运行时存储
      runtimeObjects.set(objId, { ...updated })
      return {
        code: 200,
        message: '更新成功',
        data: updated,
        timestamp: Date.now(),
      }
    },
  },
  {
    method: 'DELETE',
    url: /\/api\/scenes\/(\d+)\/objects\/(\d+)/,
    handler: () => ({ code: 200, message: '删除成功', data: null, timestamp: Date.now() }),
  },

  // ---- 场景快照 ----
  {
    method: 'POST',
    url: /\/api\/scenes\/(\d+)\/snapshots\/(\d+)\/restore/,
    handler: (_url) => {
      const sceneId = parseInt(_url.match(/\/api\/scenes\/(\d+)/)?.[1] || '0')
      const scene = MOCK_SCENES.find((s) => s.id === sceneId)
      const objects = MOCK_SCENE_OBJECTS.filter((o) => o.sceneId === sceneId)
      return { code: 200, message: '快照恢复成功', data: { ...scene, objects }, timestamp: Date.now() }
    },
  },
  {
    method: 'POST',
    url: /\/api\/scenes\/(\d+)\/snapshots/,
    handler: () => ({
      code: 200,
      message: '快照创建成功',
      data: { id: Date.now(), description: '场景快照', createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) },
      timestamp: Date.now(),
    }),
  },

  // ---- 模型 ----
  {
    method: 'GET',
    url: /\/api\/models\/(\d+)$/,
    handler: (url) => {
      const id = parseInt(url.match(/\/api\/models\/(\d+)/)?.[1] || '0')
      const model = MOCK_MODELS.find((m) => m.id === id)
      if (!model) return { code: 404, message: '模型不存在', data: null, timestamp: Date.now() }
      return { code: 200, message: 'success', data: model, timestamp: Date.now() }
    },
  },
  {
    method: 'GET',
    url: /\/api\/models(\?.*)?$/,
    handler: () => ({
      code: 200,
      message: 'success',
      data: { total: MOCK_MODELS.length, records: MOCK_MODELS, page: 1, size: 20 },
      timestamp: Date.now(),
    }),
  },
  {
    method: 'POST',
    url: /\/api\/models\/upload/,
    handler: () => ({
      code: 200,
      message: '上传成功',
      data: { id: Date.now(), name: '新模型', fileType: 'glb', fileSize: 1048576, thumbnail: '', category: '其他', uploadTime: new Date().toISOString().replace('T', ' ').slice(0, 19) },
      timestamp: Date.now(),
    }),
  },
  {
    method: 'DELETE',
    url: /\/api\/models\/(\d+)$/,
    handler: () => ({ code: 200, message: '删除成功', data: null, timestamp: Date.now() }),
  },
]

// ==================== Axios Adapter（官方推荐方式）====================

/**
 * 使用 axios adapter 机制拦截请求
 * 这是 axios 官方支持的拦截方式，比覆盖 request 方法更可靠
 */
export function createMockAdapter() {
  return (config: any): Promise<any> => {
    return new Promise((resolve) => {
      const method = (config.method || 'GET').toUpperCase()
      const url = config.url || ''

      // 解析请求数据：axios 可能将 data 序列化为 JSON 字符串
      let requestData = config.data
      if (typeof requestData === 'string') {
        try {
          requestData = JSON.parse(requestData)
        } catch {
          requestData = null
        }
      }

      const handler = mockHandlers.find(
        (h) => h.method === method && h.url.test(url)
      )

      if (handler) {
        console.log(`[Mock] ${method} ${url}`, requestData)
        const result = handler.handler(url, requestData)
        resolve({
          data: result,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      } else {
        console.warn(`[Mock] 未匹配: ${method} ${url}`)
        resolve({
          data: { code: 200, message: 'success', data: null, timestamp: Date.now() },
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        })
      }
    })
  }
}
