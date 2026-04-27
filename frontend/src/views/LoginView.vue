<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="login-bg">
      <div class="bg-grid"></div>
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card animate-fade-in-up">
      <!-- Logo / 标题区域 -->
      <div class="login-header">
        <div class="login-logo">
          <div class="logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="36" height="36" rx="8" stroke="#3b82f6" stroke-width="2" opacity="0.6" />
              <rect x="8" y="8" width="24" height="24" rx="4" stroke="#60a5fa" stroke-width="1.5" opacity="0.4" />
              <circle cx="20" cy="20" r="6" fill="#3b82f6" opacity="0.8" />
              <circle cx="20" cy="20" r="3" fill="#93c5fd" />
              <line x1="20" y1="2" x2="20" y2="14" stroke="#3b82f6" stroke-width="1" opacity="0.3" />
              <line x1="20" y1="26" x2="20" y2="38" stroke="#3b82f6" stroke-width="1" opacity="0.3" />
              <line x1="2" y1="20" x2="14" y2="20" stroke="#3b82f6" stroke-width="1" opacity="0.3" />
              <line x1="26" y1="20" x2="38" y2="20" stroke="#3b82f6" stroke-width="1" opacity="0.3" />
            </svg>
          </div>
        </div>
        <h1 class="login-title">数字孪生编辑器</h1>
        <p class="login-subtitle">Digital Twin Editor</p>
      </div>

      <!-- 登录表单 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            class="dt-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="dt-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <button
            type="button"
            class="login-btn"
            :class="{ 'is-loading': isLogging }"
            :disabled="isLogging"
            @click="handleLogin"
          >
            <span v-if="!isLogging">登 录</span>
            <span v-else class="loading-text">
              <svg class="spinner" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
              </svg>
              登录中...
            </span>
          </button>
        </el-form-item>
      </el-form>

      <!-- 注册链接 -->
      <div class="login-footer">
        <span class="footer-text">没有账号？</span>
        <router-link to="/login" class="footer-link" @click.prevent="handleRegister">
          立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: import.meta.env.DEV ? 'admin' : '',
  password: import.meta.env.DEV ? 'admin123' : '',
})

// 表单校验规则
const loginRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度为 2-20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度为 6-32 个字符', trigger: 'blur' },
  ],
}

// 登录状态
const isLogging = ref(false)

/** 处理登录 */
async function handleLogin() {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
  } catch {
    return
  }

  isLogging.value = true
  try {
    await userStore.login(loginForm.username, loginForm.password)
    ElMessage.success('登录成功')
    // userStore.login 内部会自动跳转到 /scenes
  } catch (error: any) {
    ElMessage.error(error?.message || '登录失败，请检查用户名和密码')
  } finally {
    isLogging.value = false
  }
}

/** 处理注册（跳转到注册页面或弹出注册对话框） */
function handleRegister() {
  // 暂时使用注册接口直接注册后登录
  ElMessage.info('注册功能开发中，请联系管理员')
}
</script>

<style scoped lang="scss">
.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0e1a;
  overflow: hidden;
}

// 背景装饰
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.4;

  &-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    top: -100px;
    right: -100px;
  }

  &-2 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
    bottom: -80px;
    left: -80px;
  }
}

// 登录卡片
.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 48px 40px 36px;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%);
  border: 1px solid rgba(30, 41, 59, 0.8);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(59, 130, 246, 0.05);
  backdrop-filter: blur(20px);
}

// 标题区域
.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  animation: pulse-glow 3s ease-in-out infinite;

  svg {
    width: 100%;
    height: 100%;
  }
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.login-subtitle {
  font-size: 13px;
  color: #64748b;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

// 表单
.login-form {
  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  :deep(.el-input) {
    .el-input__wrapper {
      background-color: #111827;
      border: 1px solid #1e293b;
      border-radius: 10px;
      box-shadow: none;
      padding: 4px 16px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: #334155;
      }

      &.is-focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
      }
    }

    .el-input__inner {
      color: #f1f5f9;
      font-size: 15px;
      height: 44px;

      &::placeholder {
        color: #475569;
      }
    }

    .el-input__prefix .el-icon {
      color: #64748b;
      font-size: 18px;
    }

    .el-input__suffix .el-icon {
      color: #64748b;
    }
  }

  :deep(.el-form-item__error) {
    color: #ef4444;
    font-size: 12px;
    padding-top: 4px;
  }
}

// 登录按钮
.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 46px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);

  &:hover:not(:disabled) {
    box-shadow: 0 6px 24px rgba(59, 130, 246, 0.45);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.is-loading {
    opacity: 0.85;
  }
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(59, 130, 246, 0.6));
  }
}

// 底部注册链接
.login-footer {
  text-align: center;
  margin-top: 8px;
  padding-top: 20px;
  border-top: 1px solid rgba(30, 41, 59, 0.6);
}

.footer-text {
  font-size: 14px;
  color: #64748b;
}

.footer-link {
  font-size: 14px;
  color: #60a5fa;
  font-weight: 500;
  transition: color 0.2s ease;
  margin-left: 4px;

  &:hover {
    color: #93c5fd;
    text-decoration: underline;
  }
}
</style>
