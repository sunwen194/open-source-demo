package com.dormitory.repair.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class CreateRepairOrderRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "宿舍楼不能为空")
    private String dormitoryBuilding;

    @NotBlank(message = "宿舍房间不能为空")
    private String dormitoryRoom;

    @NotBlank(message = "联系电话不能为空")
    private String contactPhone;

    @NotNull(message = "维修类型不能为空")
    private Integer repairType;

    @NotBlank(message = "问题描述不能为空")
    private String description;

    private String images;
}
