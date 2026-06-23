<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside">
      <div class="logo-container">
        <el-icon :size="24" color="#fff" style="margin-right: 8px"><House /></el-icon>
        <span class="logo-text">报修管理系统</span>
      </div>
      <el-menu
        active-text-color="#409eff"
        background-color="#304156"
        text-color="#bfcbd9"
        :default-active="$route.path"
        router
        class="el-menu-vertical-demo"
      >
        <template v-if="userStore.role === 1">
          <el-menu-item index="/student/orders">
            <el-icon><List /></el-icon>
            <span>我的报修单</span>
          </el-menu-item>
          <el-menu-item index="/student/create">
            <el-icon><Plus /></el-icon>
            <span>提交新报修</span>
          </el-menu-item>
        </template>
        <template v-if="userStore.role === 2">
          <el-menu-item index="/admin/orders">
            <el-icon><Management /></el-icon>
            <span>报修单管理</span>
          </el-menu-item>
        </template>
        <template v-if="userStore.role === 3">
          <el-menu-item index="/worker/tasks">
            <el-icon><Tools /></el-icon>
            <span>我的维修任务</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <el-container class="main-wrapper">
      <el-header class="header">
        <div class="breadcrumb">
          <span class="welcome-text">您好, {{ userStore.userInfo.realName }}</span>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88a3c4d113db4c6f8308a635b9966a3djpeg.jpeg" />
              <span class="username">{{ userStore.userInfo.realName }}</span>
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useUserStore } from '@/stores/user'
import { House, List, Plus, Management, Tools, ArrowDown } from '@element-plus/icons-vue'

const userStore = useUserStore()

const handleCommand = (command) => {
  if (command === 'logout') {
    userStore.logout()
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #304156;
  box-shadow: 2px 0 6px rgba(0,21,41,.35);
  transition: width 0.3s;
}

.logo-container {
  height: 60px;
  line-height: 60px;
  text-align: center;
  background-color: #2b3a4e;
  color: white;
  font-size: 18px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
}

.el-menu-vertical-demo {
  border-right: none;
}

.main-wrapper {
  display: flex;
  flex-direction: column;
}

.header {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.welcome-text {
  font-size: 16px;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  outline: none;
}

.username {
  margin: 0 8px;
  font-size: 14px;
  color: #606266;
}

.main-content {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}

/* 页面切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}
.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}
.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>