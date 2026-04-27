// API 通用类型
export interface Result<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

export interface PageResult<T> {
  total: number
  records: T[]
  page: number
  size: number
}

export interface LoginDTO {
  username: string
  password: string
}

export interface RegisterDTO {
  username: string
  password: string
  nickname?: string
}

export interface UserInfo {
  token: string
  username: string
  nickname: string
  role: string
}
