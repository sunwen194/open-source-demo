package com.dormitory.repair.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dormitory.repair.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
