<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的报修单</span>
          <el-button type="primary" @click="$router.push('/student/create')">新建报修</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180" />
        <el-table-column prop="repairTypeName" label="维修类型" width="120" />
        <el-table-column prop="dormitoryBuilding" label="宿舍楼" width="100" />
        <el-table-column prop="dormitoryRoom" label="房间号" width="100" />
        <el-table-column prop="statusName" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.statusName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">查看</el-button>
            <el-button 
              v-if="scope.row.status === 1" 
              size="small" 
              type="danger" 
              @click="cancelOrder(scope.row.id)"
            >取消</el-button>
            <el-button 
              v-if="scope.row.status === 4" 
              size="small" 
              type="success" 
              @click="openEvaluate(scope.row)"
            >评价</el-button>
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

    <!-- 评价对话框 -->
    <el-dialog v-model="dialogVisible" title="评价服务" width="30%">
      <el-form :model="evaluateForm">
        <el-form-item label="评分">
          <el-rate v-model="evaluateForm.rating" />
        </el-form-item>
        <el-form-item label="评论">
          <el-input v-model="evaluateForm.comment" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEvaluate">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMyOrders, cancelOrder as apiCancelOrder, evaluateOrder } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const tableData = ref([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const dialogVisible = ref(false)
const evaluateForm = ref({ orderId: null, rating: 5, comment: '' })

const fetchData = async () => {
  try {
    const res = await getMyOrders({
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

const cancelOrder = (id) => {
  ElMessageBox.confirm('确定要取消该报修单吗?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiCancelOrder(id)
      ElMessage.success('取消成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const openEvaluate = (row) => {
  evaluateForm.value.orderId = row.id
  evaluateForm.value.rating = 5
  evaluateForm.value.comment = ''
  dialogVisible.value = true
}

const submitEvaluate = async () => {
  try {
    await evaluateOrder(evaluateForm.value)
    ElMessage.success('评价成功')
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const viewDetail = (row) => {
  ElMessageBox.alert(`
    <p><strong>订单号:</strong> ${row.orderNo}</p>
    <p><strong>描述:</strong> ${row.description}</p>
    <p><strong>维修人员:</strong> ${row.workerName || '未分配'}</p>
    <p><strong>完成时间:</strong> ${row.completeTime || '-'}</p>
  `, '订单详情', {
    dangerouslyUseHTMLString: true
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>