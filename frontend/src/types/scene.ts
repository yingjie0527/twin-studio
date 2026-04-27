// 场景相关类型
export interface Scene {
  id: number
  name: string
  description: string
  thumbnail: string
  backgroundColor: string
  ambientLight: { color: string; intensity: number } | null
  groundSettings: { show: boolean; gridSize: number; color: string } | null
  cameraSettings: { position: number[]; target: number[] } | null
  createdBy: number
  createdAt: string
  updatedAt: string
}

export interface SceneObject {
  id: number
  sceneId: number
  modelAssetId: number | null
  name: string
  objectType: 'model' | 'light' | 'camera' | 'helper' | 'group'
  parentId: number | null
  position: number[]
  rotation: number[]
  scale: number[]
  visible: boolean
  locked: boolean
  sortOrder: number
  properties: Record<string, any> | null
  userData: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

export interface SceneDetail extends Scene {
  objects: SceneObject[]
}

export interface SceneObjectCreateDTO {
  modelAssetId?: number
  name?: string
  objectType?: string
  parentId?: number
  position?: number[]
  rotation?: number[]
  scale?: number[]
  properties?: Record<string, any>
}

export interface SceneObjectUpdateDTO {
  name?: string
  position?: number[]
  rotation?: number[]
  scale?: number[]
  visible?: boolean
  locked?: boolean
  properties?: Record<string, any>
  parentId?: number
}

export interface SceneSaveDTO {
  name?: string
  description?: string
  backgroundColor?: string
  ambientLight?: { color: string; intensity: number }
  groundSettings?: { show: boolean; gridSize: number; color: string }
  cameraSettings?: { position: number[]; target: number[] }
  objects?: SceneObject[]
}
