package com.dormitory.repair.enums;

public enum OrderStatusEnum {

    PENDING(1, "待处理"),
    ASSIGNED(2, "已分配"),
    PROCESSING(3, "维修中"),
    COMPLETED(4, "已完成"),
    CANCELLED(5, "已取消"),
    EVALUATED(6, "已评价");

    private final Integer code;
    private final String desc;

    OrderStatusEnum(Integer code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public Integer getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }
}
