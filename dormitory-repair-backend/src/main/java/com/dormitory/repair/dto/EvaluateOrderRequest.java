package com.dormitory.repair.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.io.Serializable;

@Data
public class EvaluateOrderRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotNull(message = "报修单ID不能为空")
    private Long orderId;

    @NotNull(message = "评分不能为空")
    @Min(value = 1, message = "最低评分为1")
    @Max(value = 5, message = "最高评分为5")
    private Integer rating;

    private String comment;
}
