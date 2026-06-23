package com.dormitory.repair.common;

import lombok.Data;
import java.io.Serializable;

@Data
public class PageRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer pageNum = 1;

    private Integer pageSize = 10;

    private String sortBy;

    private String sortOrder = "desc";
}
