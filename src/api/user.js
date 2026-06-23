import request from '@/utils/request'

export function getAllWorkers() { return request.get('/user/workers') }