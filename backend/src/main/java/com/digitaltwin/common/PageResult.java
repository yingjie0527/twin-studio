package com.digitaltwin.common;

import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.Data;

import java.io.Serializable;
import java.util.List;

@Data
public class PageResult<T> implements Serializable {

    private long total;
    private List<T> records;
    private int page;
    private int size;

    private PageResult() {
    }

    private PageResult(long total, List<T> records, int page, int size) {
        this.total = total;
        this.records = records;
        this.page = page;
        this.size = size;
    }

    public static <T> PageResult<T> of(IPage<T> page) {
        PageResult<T> result = new PageResult<>();
        result.setTotal(page.getTotal());
        result.setRecords(page.getRecords());
        result.setPage((int) page.getCurrent());
        result.setSize((int) page.getSize());
        return result;
    }
}
