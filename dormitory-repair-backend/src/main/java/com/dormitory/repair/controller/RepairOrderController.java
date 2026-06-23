package com.dormitory.repair.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dormitory.repair.common.Result;
import com.dormitory.repair.dto.CreateRepairOrderRequest;
import com.dormitory.repair.dto.EvaluateOrderRequest;
import com.dormitory.repair.service.RepairOrderService;
import com.dormitory.repair.vo.RepairOrderVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class RepairOrderController {

    private final RepairOrderService repairOrderService;

    @PostMapping
    public Result<Long> createOrder(@Valid @RequestBody CreateRepairOrderRequest request,
                                    @RequestHeader("userId") Long studentId) {
        try {
            Long orderId = repairOrderService.createOrder(request, studentId);
            return Result.success("报修单创建成功", orderId);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public Result<RepairOrderVO> getOrderById(@PathVariable Long id) {
        RepairOrderVO orderVO = repairOrderService.getOrderById(id);
        return Result.success(orderVO);
    }

    @GetMapping("/student/my")
    public Result<Page<RepairOrderVO>> getMyOrders(
            @RequestHeader("userId") Long studentId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status) {
        Page<RepairOrderVO> orderPage = repairOrderService.getStudentOrders(studentId, pageNum, pageSize, status);
        return Result.success(orderPage);
    }

    @GetMapping("/worker/my")
    public Result<Page<RepairOrderVO>> getWorkerOrders(
            @RequestHeader("userId") Long workerId,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status) {
        Page<RepairOrderVO> orderPage = repairOrderService.getWorkerOrders(workerId, pageNum, pageSize, status);
        return Result.success(orderPage);
    }

    @GetMapping("/all")
    public Result<Page<RepairOrderVO>> getAllOrders(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String keyword) {
        Page<RepairOrderVO> orderPage = repairOrderService.getAllOrders(pageNum, pageSize, status, keyword);
        return Result.success(orderPage);
    }

    @PostMapping("/assign")
    public Result<String> assignWorker(@RequestParam Long orderId,
                                       @RequestParam Long workerId) {
        try {
            boolean success = repairOrderService.assignWorker(orderId, workerId);
            return success ? Result.success("分配成功") : Result.error("分配失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/start/{id}")
    public Result<String> startRepair(@PathVariable Long id) {
        try {
            boolean success = repairOrderService.startRepair(id);
            return success ? Result.success("开始维修") : Result.error("操作失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/complete/{id}")
    public Result<String> completeRepair(@PathVariable Long id) {
        try {
            boolean success = repairOrderService.completeRepair(id);
            return success ? Result.success("维修完成") : Result.error("操作失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/evaluate")
    public Result<String> evaluateOrder(@Valid @RequestBody EvaluateOrderRequest request) {
        try {
            boolean success = repairOrderService.evaluateOrder(request);
            return success ? Result.success("评价成功") : Result.error("评价失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/cancel/{id}")
    public Result<String> cancelOrder(@PathVariable Long id) {
        try {
            boolean success = repairOrderService.cancelOrder(id);
            return success ? Result.success("取消成功") : Result.error("取消失败");
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
