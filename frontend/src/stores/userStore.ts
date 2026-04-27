import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router'
import * as authApi from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // ==================== 状态 ====================
  const token = ref(localStorage.getItem('dt_token') || '')
  const username = ref('')
  const nickname = ref('')
  const role = ref('')

  // ==================== 计算属性 ====================
  const isLoggedIn = computed(() => !!token.value)

  // ==================== 操作方法 ====================

  /** 用户登录 */
  async function login(loginUsername: string, password: string) {
    const res = await authApi.login({ username: loginUsername, password })
    const userInfo = res.data
    token.value = userInfo.token
    username.value = userInfo.username
    nickname.value = userInfo.nickname
    role.value = userInfo.role
    localStorage.setItem('dt_token', userInfo.token)
    // 登录成功后跳转到场景列表页
    router.push({ name: 'Scenes' })
  }

  /** 用户注册 */
  async function register(
    registerUsername: string,
    password: string,
    registerNickname?: string
  ) {
    const res = await authApi.register({
      username: registerUsername,
      password,
      nickname: registerNickname,
    })
    const userInfo = res.data
    token.value = userInfo.token
    username.value = userInfo.username
    nickname.value = userInfo.nickname
    role.value = userInfo.role
    localStorage.setItem('dt_token', userInfo.token)
    // 注册成功后跳转到场景列表页
    router.push({ name: 'Scenes' })
  }

  /** 用户登出 */
  function logout() {
    token.value = ''
    username.value = ''
    nickname.value = ''
    role.value = ''
    localStorage.removeItem('dt_token')
    router.push({ name: 'Login' })
  }

  /** 获取当前用户信息 */
  async function fetchUserInfo() {
    try {
      const res = await authApi.getUserInfo()
      const userInfo = res.data
      username.value = userInfo.username
      nickname.value = userInfo.nickname
      role.value = userInfo.role
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // token 无效时自动登出
      logout()
      throw error
    }
  }

  return {
    // 状态
    token,
    username,
    nickname,
    role,
    // 计算属性
    isLoggedIn,
    // 方法
    login,
    register,
    logout,
    fetchUserInfo,
  }
})
