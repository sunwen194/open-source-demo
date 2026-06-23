package com.dormitory.repair.common;

import lombok.Data;
import java.io.Serializable;
import java.util.List;

@Data
public class PageResponse<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<T> records;

    private Long total;

    private Integer pageNum;

    private Integer pageSize;

    private Integer pages;

    public PageResponse() {
    }

    public PageResponse(List<T> records, Long total, Integer pageNum, Integer pageSize) {
        this.records = records;
        this.total = total;
        this.pageNum = pageNum;
        this.pageSize = pageSize;
        this.pages = (int) Math.ceil((double) total / pageSize);
    }
}
