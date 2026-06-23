<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>宿舍报修系统</h2>
        <p>Dormitory Repair System</p>
      </div>
      <el-card class="login-card" shadow="hover">
        <el-tabs v-model="activeTab" stretch>
          <el-tab-pane label="用户登录" name="login">
            <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="custom-form">
              <el-form-item prop="username">
                <el-input 
                  v-model="loginForm.username" 
                  placeholder="请输入用户名" 
                  prefix-icon="User" 
                  size="large"
                  clearable
                />
              </el-form-item>
              <el-form-item prop="password">
                <el-input 
                  v-model="loginForm.password" 
                  type="password" 
                  placeholder="请输入密码" 
                  prefix-icon="Lock" 
                  show-password 
                  size="large"
                />
              </el-form-item>
              <el-button type="primary" @click="handleLogin" size="large" class="login-btn">登 录</el-button>
            </el-form>
            <div class="footer-link">
              还没有账号？ <span @click="activeTab = 'register'">立即注册</span>
            </div>
          </el-tab-pane>

          <el-tab-pane label="学生注册" name="register">
            <el-form :model="registerForm" :rules="regRules" ref="registerFormRef" class="custom-form">
              <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="设置用户名" prefix-icon="User" size="large" />
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="设置密码" prefix-icon="Lock" show-password size="large" />
              </el-form-item>
              <el-form-item prop="realName">
                <el-input v-model="registerForm.realName" placeholder="真实姓名" prefix-icon="Avatar" size="large" />
              </el-form-item>
              <el-form-item prop="phone">
                <el-input v-model="registerForm.phone" placeholder="手机号码" prefix-icon="Phone" size="large" />
              </el-form-item>
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-form-item prop="dormitoryBuilding">
                    <el-input v-model="registerForm.dormitoryBuilding" placeholder="宿舍楼" size="large" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="dormitoryRoom">
                    <el-input v-model="registerForm.dormitoryRoom" placeholder="房间号" size="large" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-button type="success" @click="handleRegister" size="large" class="login-btn">注 册</el-button>
            </el-form>
            <div class="footer-link">
              已有账号？ <span @click="activeTab = 'login'">去登录</span>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const activeTab = ref('login')
const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginForm = reactive({ username: '', password: '' })
const registerForm = reactive({
  username: '', password: '', realName: '', phone: '',
  dormitoryBuilding: '', dormitoryRoom: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const regRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请设置密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await userStore.login(loginForm)
        ElMessage.success('欢迎回来！')
      } catch (e) {}
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await userStore.register(registerForm)
        ElMessage.success('注册成功！')
      } catch (e) {}
    }
  })
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰圆圈 */
.login-container::before, .login-container::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}
.login-container::before { width: 300px; height: 300px; top: -50px; left: -50px; }
.login-container::after { width: 400px; height: 400px; bottom: -100px; right: -100px; }

.login-box {
  width: 450px;
  z-index: 1;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
  color: white;
}
.login-header h2 { margin: 0; font-size: 28px; letter-spacing: 2px; }
.login-header p { margin: 5px 0 0; opacity: 0.8; font-size: 14px; }

.login-card {
  border-radius: 12px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
}

.custom-form {
  padding: 10px 0;
}

.login-btn {
  width: 100%;
  margin-top: 10px;
  font-weight: bold;
  letter-spacing: 4px;
}

.footer-link {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}
.footer-link span {
  color: #409eff;
  cursor: pointer;
  font-weight: bold;
  margin-left: 5px;
}
.footer-link span:hover { text-decoration: underline; }
</style>