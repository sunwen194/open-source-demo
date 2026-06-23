package com.dormitory.repair.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("repair_order")
public class RepairOrder implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    private String orderNo;

    private Long studentId;

    private String dormitoryBuilding;

    private String dormitoryRoom;

    private String contactPhone;

    private Integer repairType;

    private String description;

    private String images;

    private Integer status;

    private Long workerId;

    private LocalDateTime assignTime;

    private LocalDateTime completeTime;

    private Integer rating;

    private String comment;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    @TableLogic
    private Integer deleted;
}
