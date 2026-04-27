import { post, get } from '@/utils/request'
import type { Result } from '@/types/api'
import type { LoginDTO, RegisterDTO, UserInfo } from '@/types/api'

/**
 * 用户登录
 */
export function login(data: LoginDTO): Promise<Result<UserInfo>> {
  return post<UserInfo>('/api/auth/login', data)
}

/**
 * 用户注册
 */
export function register(data: RegisterDTO): Promise<Result<UserInfo>> {
  return post<UserInfo>('/api/auth/register', data)
}

/**
 * 获取当前用户信息
 */
export function getUserInfo(): Promise<Result<UserInfo>> {
  return get<UserInfo>('/api/auth/userinfo')
}
