package com.dormitory.repair.enums;

public enum RoleEnum {

    STUDENT(1, "学生"),
    ADMIN(2, "管理员"),
    WORKER(3, "维修人员");

    private final Integer code;
    private final String desc;

    RoleEnum(Integer code, String desc) {
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
