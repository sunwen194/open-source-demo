package com.dormitory.repair.vo;

import lombok.Data;
import java.io.Serializable;

@Data
public class WorkerVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long userId;

    private String username;

    private String realName;

    private String phone;

    private String email;

    private Integer status;

    private Integer completedOrders;

    private Double averageRating;
}
