package com.digitaltwin.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.digitaltwin.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    /**
     * 根据用户名查询用户
     */
    @Select("SELECT * FROM dt_user WHERE username = #{username} AND is_deleted = 0")
    User selectByUsername(String username);
}
