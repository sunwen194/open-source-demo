package com.dormitory.repair.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dormitory.repair.dto.CreateRepairOrderRequest;
import com.dormitory.repair.dto.EvaluateOrderRequest;
import com.dormitory.repair.vo.RepairOrderVO;

public interface RepairOrderService {

    Long createOrder(CreateRepairOrderRequest request, Long studentId);

    RepairOrderVO getOrderById(Long orderId);

    Page<RepairOrderVO> getStudentOrders(Long studentId, Integer pageNum, Integer pageSize, Integer status);

    Page<RepairOrderVO> getWorkerOrders(Long workerId, Integer pageNum, Integer pageSize, Integer status);

    Page<RepairOrderVO> getAllOrders(Integer pageNum, Integer pageSize, Integer status, String keyword);

    boolean assignWorker(Long orderId, Long workerId);

    boolean startRepair(Long orderId);

    boolean completeRepair(Long orderId);

    boolean evaluateOrder(EvaluateOrderRequest request);

    boolean cancelOrder(Long orderId);

    String generateOrderNo();
}
