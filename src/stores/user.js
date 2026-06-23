import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as apiLogin, register as apiRegister } from '@/api/auth'
import router from '@/router'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userId = ref(localStorage.getItem('userId') || null)
  const role = ref(localStorage.getItem('role') ? Number(localStorage.getItem('role')) : null)
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

  function setUserInfo(data) {
    token.value = data.token
    userId.value = data.userId
    role.value = data.role
    userInfo.value = data
    
    localStorage.setItem('token', data.token)
    localStorage.setItem('userId', data.userId)
    localStorage.setItem('role', data.role)
    localStorage.setItem('userInfo', JSON.stringify(data))
  }

  async function login(loginForm) {
    const res = await apiLogin(loginForm)
    setUserInfo(res.data)
    redirectByRole()
  }

  async function register(registerForm) {
    const res = await apiRegister(registerForm)
    setUserInfo(res.data)
    redirectByRole()
  }

  function redirectByRole() {
    if (role.value === 1) router.push('/student/orders')
    else if (role.value === 2) router.push('/admin/orders')
    else if (role.value === 3) router.push('/worker/tasks')
  }

  function logout() {
    token.value = ''
    userId.value = null
    role.value = null
    userInfo.value = {}
    localStorage.clear()
    router.push('/login')
  }

  return { token, userId, role, userInfo, login, register, logout }
})