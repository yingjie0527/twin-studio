// 模型资源相关类型
export interface ModelAsset {
  id: number
  name: string
  originalName: string
  fileType: 'glb' | 'gltf'
  fileSize: number
  storagePath: string
  thumbnail: string
  category: string
  description: string
  boundingBox: { min: number[]; max: number[] } | null
  vertexCount: number
  faceCount: number
  hasDraco: boolean
  hasAnimation: boolean
  tags: string[]
  uploadTime: string
}

export interface ModelListParams {
  page?: number
  size?: number
  category?: string
  keyword?: string
}
