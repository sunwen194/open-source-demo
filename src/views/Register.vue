<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2>学生注册</h2>
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="宿舍楼" prop="dormitoryBuilding">
          <el-input v-model="form.dormitoryBuilding" />
        </el-form-item>
        <el-form-item label="房间号" prop="dormitoryRoom">
          <el-input v-model="form.dormitoryRoom" />
        </el-form-item>
        <el-button type="primary" @click="handleRegister" style="width: 100%">注册</el-button>
      </el-form>
      <div class="link">
        <router-link to="/login">已有账号？去登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()
const formRef = ref(null)
const form = reactive({
  username: '', password: '', realName: '', phone: '',
  dormitoryBuilding: '', dormitoryRoom: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
}

const handleRegister = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await userStore.register(form)
        ElMessage.success('注册成功')
      } catch (e) {
        console.error(e)
      }
    }
  })
}
</script>

<style scoped>
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5; }
.login-card { width: 450px; }
.link { margin-top: 10px; text-align: right; }
</style>