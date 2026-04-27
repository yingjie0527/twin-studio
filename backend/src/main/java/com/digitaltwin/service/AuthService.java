package com.digitaltwin.service;

import com.digitaltwin.dto.UserInfoVO;

public interface AuthService {

    /**
     * 用户登录
     *
     * @param username 用户名
     * @param password 密码
     * @return 用户信息VO（含token）
     */
    UserInfoVO login(String username, String password);

    /**
     * 用户注册
     *
     * @param username 用户名
     * @param password 密码
     * @param nickname 昵称
     * @return 用户信息VO（含token）
     */
    UserInfoVO register(String username, String password, String nickname);

    /**
     * 获取用户信息
     *
     * @param username 用户名
     * @return 用户信息VO（含新token）
     */
    UserInfoVO getUserInfo(String username);
}
