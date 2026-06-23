<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>报修单管理</span>
          <el-input v-model="keyword" placeholder="搜索订单号/宿舍" style="width: 200px" @keyup.enter="fetchData" clearable />
        </div>
      </template>

      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="150" />
        <el-table-column prop="studentName" label="学生姓名" width="100" />
        <el-table-column prop="dormitoryBuilding" label="宿舍楼" width="100" />
        <el-table-column prop="dormitoryRoom" label="房间号" width="100" />
        <el-table-column prop="repairTypeName" label="类型" width="100" />
        <el-table-column prop="statusName" label="状态" width="100">
           <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workerName" label="维修人员" width="120">
          <template #default="scope">
            {{ scope.row.workerName || '未分配' }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button 
              v-if="scope.row.status === 1" 
              size="small" 
              type="primary" 
              @click="openAssignDialog(scope.row)"
            >分配人员</el-button>
            <el-button size="small" @click="viewDetail(scope.row)">详情</el-button>
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

    <!-- 分配人员对话框 -->
    <el-dialog v-model="assignDialogVisible" title="分配维修人员" width="30%">
      <el-select v-model="selectedWorkerId" placeholder="请选择维修人员" style="width: 100%">
        <el-option
          v-for="worker in workers"
          :key="worker.id"
          :label="worker.realName"
          :value="worker.id"
        />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAssign">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllOrders, assignWorker } from '@/api/order'
import { getAllWorkers } from '@/api/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const keyword = ref('')
const workers = ref([])
const assignDialogVisible = ref(false)
const currentOrderId = ref(null)
const selectedWorkerId = ref(null)

const fetchData = async () => {
  try {
    const res = await getAllOrders({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    tableData.value = res.data.records
    total.value = res.data.total
  } catch (error) {
    console.error(error)
  }
}

const fetchWorkers = async () => {
  try {
    const res = await getAllWorkers()
    workers.value = res.data
  } catch (error) {
    console.error(error)
  }
}

const openAssignDialog = (row) => {
  currentOrderId.value = row.id
  selectedWorkerId.value = null
  assignDialogVisible.value = true
}

const confirmAssign = async () => {
  if (!selectedWorkerId.value) {
    ElMessage.warning('请选择维修人员')
    return
  }
  try {
    await assignWorker(currentOrderId.value, selectedWorkerId.value)
    ElMessage.success('分配成功')
    assignDialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const getStatusType = (status) => {
  const map = { 1: 'info', 2: 'warning', 3: 'primary', 4: 'success', 5: 'danger', 6: 'success' }
  return map[status] || ''
}

const viewDetail = (row) => {
   ElMessageBox.alert(`
    <p><strong>订单号:</strong> ${row.orderNo}</p>
    <p><strong>描述:</strong> ${row.description}</p>
    <p><strong>联系人:</strong> ${row.contactPhone}</p>
  `, '订单详情', {
    dangerouslyUseHTMLString: true
  })
}

onMounted(() => {
  fetchData()
  fetchWorkers()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>