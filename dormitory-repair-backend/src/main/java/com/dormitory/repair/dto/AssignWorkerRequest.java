package com.dormitory.repair.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.io.Serializable;

@Data
public class AssignWorkerRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "报修单ID不能为空")
    private Long orderId;

    @NotNull(message = "维修人员ID不能为空")
    private Long workerId;
}
