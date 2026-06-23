package com.dormitory.repair.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dormitory.repair.dto.CreateRepairOrderRequest;
import com.dormitory.repair.dto.EvaluateOrderRequest;
import com.dormitory.repair.entity.RepairOrder;
import com.dormitory.repair.entity.RepairType;
import com.dormitory.repair.entity.User;
import com.dormitory.repair.enums.OrderStatusEnum;
import com.dormitory.repair.enums.RoleEnum;
import com.dormitory.repair.mapper.RepairOrderMapper;
import com.dormitory.repair.mapper.RepairTypeMapper;
import com.dormitory.repair.mapper.UserMapper;
import com.dormitory.repair.service.RepairOrderService;
import com.dormitory.repair.vo.RepairOrderVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class RepairOrderServiceImpl implements RepairOrderService {

    private final RepairOrderMapper repairOrderMapper;
    private final UserMapper userMapper;
    private final RepairTypeMapper repairTypeMapper;
    private final AtomicInteger sequenceGenerator = new AtomicInteger(0);

    @Override
    @Transactional
    public Long createOrder(CreateRepairOrderRequest request, Long studentId) {
        RepairOrder order = new RepairOrder();
        order.setOrderNo(generateOrderNo());
        order.setStudentId(studentId);
        order.setDormitoryBuilding(request.getDormitoryBuilding());
        order.setDormitoryRoom(request.getDormitoryRoom());
        order.setContactPhone(request.getContactPhone());
        order.setRepairType(request.getRepairType());
        order.setDescription(request.getDescription());
        order.setImages(request.getImages());
        order.setStatus(OrderStatusEnum.PENDING.getCode());

        repairOrderMapper.insert(order);
        return order.getId();
    }

    @Override
    public RepairOrderVO getOrderById(Long orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("报修单不存在");
        }
        return convertToVO(order);
    }

    @Override
    public Page<RepairOrderVO> getStudentOrders(Long studentId, Integer pageNum, Integer pageSize, Integer status) {
        Page<RepairOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RepairOrder::getStudentId, studentId);

        if (status != null) {
            wrapper.eq(RepairOrder::getStatus, status);
        }

        wrapper.orderByDesc(RepairOrder::getCreateTime);
        Page<RepairOrder> orderPage = repairOrderMapper.selectPage(page, wrapper);

        return convertToVOPage(orderPage);
    }

    @Override
    public Page<RepairOrderVO> getWorkerOrders(Long workerId, Integer pageNum, Integer pageSize, Integer status) {
        Page<RepairOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(RepairOrder::getWorkerId, workerId);

        if (status != null) {
            wrapper.eq(RepairOrder::getStatus, status);
        }

        wrapper.orderByDesc(RepairOrder::getCreateTime);
        Page<RepairOrder> orderPage = repairOrderMapper.selectPage(page, wrapper);

        return convertToVOPage(orderPage);
    }

    @Override
    public Page<RepairOrderVO> getAllOrders(Integer pageNum, Integer pageSize, Integer status, String keyword) {
        Page<RepairOrder> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<RepairOrder> wrapper = new LambdaQueryWrapper<>();

        if (status != null) {
            wrapper.eq(RepairOrder::getStatus, status);
        }

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(RepairOrder::getOrderNo, keyword)
                    .or()
                    .like(RepairOrder::getDormitoryBuilding, keyword)
                    .or()
                    .like(RepairOrder::getDormitoryRoom, keyword));
        }

        wrapper.orderByDesc(RepairOrder::getCreateTime);
        Page<RepairOrder> orderPage = repairOrderMapper.selectPage(page, wrapper);

        return convertToVOPage(orderPage);
    }

    @Override
    @Transactional
    public boolean assignWorker(Long orderId, Long workerId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("报修单不存在");
        }

        if (!order.getStatus().equals(OrderStatusEnum.PENDING.getCode())) {
            throw new RuntimeException("报修单状态不正确");
        }

        User worker = userMapper.selectById(workerId);
        if (worker == null || !worker.getRole().equals(RoleEnum.WORKER.getCode())) {
            throw new RuntimeException("维修人员不存在");
        }

        order.setWorkerId(workerId);
        order.setStatus(OrderStatusEnum.ASSIGNED.getCode());
        order.setAssignTime(LocalDateTime.now());

        return repairOrderMapper.updateById(order) > 0;
    }

    @Override
    @Transactional
    public boolean startRepair(Long orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("报修单不存在");
        }

        if (!order.getStatus().equals(OrderStatusEnum.ASSIGNED.getCode())) {
            throw new RuntimeException("报修单状态不正确");
        }

        order.setStatus(OrderStatusEnum.PROCESSING.getCode());
        return repairOrderMapper.updateById(order) > 0;
    }

    @Override
    @Transactional
    public boolean completeRepair(Long orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("报修单不存在");
        }

        if (!order.getStatus().equals(OrderStatusEnum.PROCESSING.getCode())) {
            throw new RuntimeException("报修单状态不正确");
        }

        order.setStatus(OrderStatusEnum.COMPLETED.getCode());
        order.setCompleteTime(LocalDateTime.now());
        return repairOrderMapper.updateById(order) > 0;
    }

    @Override
    @Transactional
    public boolean evaluateOrder(EvaluateOrderRequest request) {
        RepairOrder order = repairOrderMapper.selectById(request.getOrderId());
        if (order == null) {
            throw new RuntimeException("报修单不存在");
        }

        if (!order.getStatus().equals(OrderStatusEnum.COMPLETED.getCode())) {
            throw new RuntimeException("报修单状态不正确，无法评价");
        }

        order.setRating(request.getRating());
        order.setComment(request.getComment());
        order.setStatus(OrderStatusEnum.EVALUATED.getCode());

        return repairOrderMapper.updateById(order) > 0;
    }

    @Override
    @Transactional
    public boolean cancelOrder(Long orderId) {
        RepairOrder order = repairOrderMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("报修单不存在");
        }

        if (!order.getStatus().equals(OrderStatusEnum.PENDING.getCode())) {
            throw new RuntimeException("只有待处理的报修单可以取消");
        }

        order.setStatus(OrderStatusEnum.CANCELLED.getCode());
        return repairOrderMapper.updateById(order) > 0;
    }

    @Override
    public String generateOrderNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int sequence = sequenceGenerator.incrementAndGet();
        String seqStr = String.format("%04d", sequence);
        return "BX" + dateStr + seqStr;
    }

    private RepairOrderVO convertToVO(RepairOrder order) {
        RepairOrderVO vo = new RepairOrderVO();
        vo.setId(order.getId());
        vo.setOrderNo(order.getOrderNo());
        vo.setStudentId(order.getStudentId());
        vo.setDormitoryBuilding(order.getDormitoryBuilding());
        vo.setDormitoryRoom(order.getDormitoryRoom());
        vo.setContactPhone(order.getContactPhone());
        vo.setRepairType(order.getRepairType());
        vo.setDescription(order.getDescription());
        vo.setImages(order.getImages());
        vo.setStatus(order.getStatus());
        vo.setStatusName(getStatusName(order.getStatus()));
        vo.setWorkerId(order.getWorkerId());
        vo.setAssignTime(order.getAssignTime());
        vo.setCompleteTime(order.getCompleteTime());
        vo.setRating(order.getRating());
        vo.setComment(order.getComment());
        vo.setCreateTime(order.getCreateTime());
        vo.setUpdateTime(order.getUpdateTime());

        if (order.getStudentId() != null) {
            User student = userMapper.selectById(order.getStudentId());
            if (student != null) {
                vo.setStudentName(student.getRealName());
            }
        }

        if (order.getWorkerId() != null) {
            User worker = userMapper.selectById(order.getWorkerId());
            if (worker != null) {
                vo.setWorkerName(worker.getRealName());
            }
        }

        if (order.getRepairType() != null) {
            RepairType repairType = repairTypeMapper.selectById(order.getRepairType());
            if (repairType != null) {
                vo.setRepairTypeName(repairType.getTypeName());
            }
        }

        return vo;
    }

    private Page<RepairOrderVO> convertToVOPage(Page<RepairOrder> orderPage) {
        Page<RepairOrderVO> voPage = new Page<>();
        voPage.setCurrent(orderPage.getCurrent());
        voPage.setSize(orderPage.getSize());
        voPage.setTotal(orderPage.getTotal());
        voPage.setPages(orderPage.getPages());

        voPage.setRecords(orderPage.getRecords().stream()
                .map(this::convertToVO)
                .toList());

        return voPage;
    }

    private String getStatusName(Integer status) {
        for (OrderStatusEnum statusEnum : OrderStatusEnum.values()) {
            if (statusEnum.getCode().equals(status)) {
                return statusEnum.getDesc();
            }
        }
        return "未知";
    }
}
