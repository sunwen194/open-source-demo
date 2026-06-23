import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/views/Register.vue') },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/student/orders',
    children: [
      // 学生端
      { path: '/student/orders', name: 'StudentOrders', component: () => import('@/views/student/MyOrders.vue'), meta: { role: 1 } },
      { path: '/student/create', name: 'CreateOrder', component: () => import('@/views/student/CreateOrder.vue'), meta: { role: 1 } },
      // 管理员端
      { path: '/admin/orders', name: 'AdminOrders', component: () => import('@/views/admin/OrderManage.vue'), meta: { role: 2 } },
      // 维修工端
      { path: '/worker/tasks', name: 'WorkerTasks', component: () => import('@/views/worker/MyTasks.vue'), meta: { role: 3 } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：检查登录状态和权限
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isAuthenticated = !!userStore.token
  
  if (to.path === '/login' || to.path === '/register') {
    next()
  } else {
    if (!isAuthenticated) {
      next('/login')
    } else {
      // 简单的角色权限校验
      if (to.meta.role && to.meta.role !== userStore.role) {
        ElMessage.warning('权限不足，无法访问该页面')
        next(false)
      } else {
        next()
      }
    }
  }
})

export default router