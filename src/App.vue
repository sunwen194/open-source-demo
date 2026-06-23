<template>
  <router-view />
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  background-color: #f0f2f5;
}
#app {
  width: 100%;
  height: 100%;
}

/* 全局卡片优化 */
.el-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}
.el-card__header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
}

/* 表格优化 */
.el-table {
  border-radius: 8px;
  overflow: hidden;
}
.el-table th {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 600;
}
</style>