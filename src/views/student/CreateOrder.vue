<template>
  <div class="page-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>提交新报修</span>
        </div>
      </template>
      <el-form :model="form" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="宿舍楼" prop="dormitoryBuilding">
          <el-input v-model="form.dormitoryBuilding" placeholder="例如：A栋" />
        </el-form-item>
        <el-form-item label="房间号" prop="dormitoryRoom">
          <el-input v-model="form.dormitoryRoom" placeholder="例如：302" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="维修类型" prop="repairType">
          <el-select v-model="form.repairType" placeholder="请选择" style="width: 100%">
            <el-option label="水电维修" :value="1" />
            <el-option label="家具维修" :value="2" />
            <el-option label="门窗维修" :value="3" />
            <el-option label="网络问题" :value="4" />
            <el-option label="空调维修" :value="5" />
            <el-option label="其他" :value="6" />
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请详细描述故障情况" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitOrder">提交报修</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { createOrder } from '@/api/order'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const formRef = ref(null)

const form = reactive({
  dormitoryBuilding: '',
  dormitoryRoom: '',
  contactPhone: '',
  repairType: null,
  description: '',
  images: '' // 暂时留空，后续可扩展图片上传
})

const rules = {
  dormitoryBuilding: [{ required: true, message: '请输入宿舍楼', trigger: 'blur' }],
  dormitoryRoom: [{ required: true, message: '请输入房间号', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  repairType: [{ required: true, message: '请选择维修类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入问题描述', trigger: 'blur' }]
}

const submitOrder = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        await createOrder(form)
        ElMessage.success('报修单提交成功')
        router.push('/student/orders')
      } catch (error) {
        console.error(error)
      }
    }
  })
}
</script>

<style scoped>
.page-container { padding: 20px; }
.card-header { font-weight: bold; }
</style>