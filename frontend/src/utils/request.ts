import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Result } from '@/types/api'
import { USE_MOCK, createMockAdapter } from '@/mock'

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Mock 模式下使用自定义 adapter，完全在客户端拦截请求
  ...(USE_MOCK ? { adapter: createMockAdapter() as any } : {}),
})

if (USE_MOCK) {
  console.log('[Mock] Mock 适配器已启用 — 所有 API 请求将使用本地模拟数据')
}

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('dt_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<Result>) => {
    const res = response.data

    if (res.code !== 0 && res.code !== 200) {
      ElMessage.error(res.message || '请求失败')

      // 401 未授权，跳转登录页
      if (res.code === 401) {
        localStorage.removeItem('dt_token')
        window.location.href = '/login'
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    }

    return response
  },
  (error) => {
    const status = error.response?.status
    let message = error.message || '网络错误'

    if (status === 401) {
      message = '登录已过期，请重新登录'
      localStorage.removeItem('dt_token')
      window.location.href = '/login'
    } else if (status === 403) {
      message = '没有权限访问该资源'
    } else if (status === 404) {
      message = '请求的资源不存在'
    } else if (status === 500) {
      message = '服务器内部错误'
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }
)

/**
 * GET 请求
 */
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
  return service.get(url, { params, ...config }).then((res) => res.data)
}

/**
 * POST 请求
 */
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
  return service.post(url, data, config).then((res) => res.data)
}

/**
 * PUT 请求
 */
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
  return service.put(url, data, config).then((res) => res.data)
}

/**
 * DELETE 请求
 */
export function del<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<Result<T>> {
  return service.delete(url, { params, ...config }).then((res) => res.data)
}

export default service
