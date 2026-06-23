<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的维修任务</span>
        </div>
      </template>
      
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="dormitoryBuilding" label="宿舍楼" width="100" />
        <el-table-column prop="dormitoryRoom" label="房间号" width="100" />
        <el-table-column prop="repairTypeName" label="类型" width="120" />
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 2" 
              size="small" 
              type="primary" 
              @click="startRepair(scope.row.id)"
            >开始维修</el-button>
            <el-button 
              v-if="scope.row.status === 3" 
              size="small" 
              type="success" 
              @click="completeRepair(scope.row.id)"
            >完成维修</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="fetchData"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWorkerOrders, startRepair as apiStartRepair, completeRepair as apiCompleteRepair } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const fetchData = async () => {
  try {
    const res = await getWorkerOrders({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'warning', 3: 'primary', 4: 'success', 5: 'danger', 6: 'success' }
  return map[status] || ''
}

const startRepair = (id) => {
  ElMessageBox.confirm('确定开始维修该订单吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(async () => {
    try {
      await apiStartRepair(id)
      ElMessage.success('已开始维修')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const completeRepair = (id) => {
  ElMessageBox.confirm('确定完成维修吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      await apiCompleteRepair(id)
      ElMessage.success('维修已完成')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { font-weight: bold; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>