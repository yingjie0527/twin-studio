import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { requiresAuth: false, title: '登录' },
  },
  {
    path: '/scenes',
    name: 'Scenes',
    component: () => import('@/views/ScenesView.vue'),
    meta: { requiresAuth: true, title: '场景列表' },
  },
  {
    path: '/editor/:id',
    name: 'Editor',
    component: () => import('@/views/EditorView.vue'),
    meta: { requiresAuth: true, title: '场景编辑器' },
    props: true,
  },
  {
    path: '/models',
    name: 'Models',
    component: () => import('@/views/ModelsView.vue'),
    meta: { requiresAuth: true, title: '模型库管理' },
  },
  {
    path: '/',
    redirect: '/scenes',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/scenes',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('dt_token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && token) {
    next({ name: 'Scenes' })
  } else {
    document.title = `${to.meta.title || '数字孪生编辑器'} - 数字孪生编辑器`
    next()
  }
})

export default router
