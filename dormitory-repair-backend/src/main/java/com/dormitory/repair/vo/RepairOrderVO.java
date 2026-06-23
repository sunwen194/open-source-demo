package com.dormitory.repair.vo;

import lombok.Data;
import java.io.Serializable;
import java.time.LocalDateTime;

@Data
public class RepairOrderVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private String orderNo;

    private Long studentId;

    private String studentName;

    private String dormitoryBuilding;

    private String dormitoryRoom;

    private String contactPhone;

    private Integer repairType;

    private String repairTypeName;

    private String description;

    private String images;

    private Integer status;

    private String statusName;

    private Long workerId;

    private String workerName;

    private LocalDateTime assignTime;

    private LocalDateTime completeTime;

    private Integer rating;

    private String comment;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;
}
