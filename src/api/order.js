import request from '@/utils/request'

export function createOrder(data) { return request.post('/order', data) }
export function getMyOrders(params) { return request.get('/order/student/my', { params }) }
export function getAllOrders(params) { return request.get('/order/all', { params }) }
export function getWorkerOrders(params) { return request.get('/order/worker/my', { params }) }
export function assignWorker(orderId, workerId) { return request.post('/order/assign', null, { params: { orderId, workerId } }) }
export function startRepair(id) { return request.post(`/order/start/${id}`) }
export function completeRepair(id) { return request.post(`/order/complete/${id}`) }
export function evaluateOrder(data) { return request.post('/order/evaluate', data) }
export function cancelOrder(id) { return request.post(`/order/cancel/${id}`) }