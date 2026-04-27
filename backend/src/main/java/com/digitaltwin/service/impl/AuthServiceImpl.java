package com.digitaltwin.service.impl;

import com.digitaltwin.common.BusinessException;
import com.digitaltwin.dto.UserInfoVO;
import com.digitaltwin.entity.User;
import com.digitaltwin.mapper.UserMapper;
import com.digitaltwin.security.JwtTokenProvider;
import com.digitaltwin.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public UserInfoVO login(String username, String password) {
        // 查询用户
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new BusinessException("用户名或密码错误");
        }

        // 验证密码
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        // 检查用户状态
        if (user.getStatus() != null && user.getStatus() != 0) {
            throw new BusinessException("用户已被禁用");
        }

        // 生成 JWT token
        String token = jwtTokenProvider.generateToken(username);

        // 返回 UserInfoVO
        UserInfoVO vo = new UserInfoVO();
        vo.setToken(token);
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setRole(user.getRole());
        return vo;
    }

    @Override
    public UserInfoVO register(String username, String password, String nickname) {
        // 检查用户名是否已存在
        User existingUser = userMapper.selectByUsername(username);
        if (existingUser != null) {
            throw new BusinessException("用户名已存在");
        }

        // BCrypt 加密密码
        String encodedPassword = passwordEncoder.encode(password);

        // 保存用户
        User user = new User();
        user.setUsername(username);
        user.setPassword(encodedPassword);
        user.setNickname(nickname != null ? nickname : username);
        user.setRole("user");
        user.setStatus(0);
        user.setIsDeleted(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);

        // 生成 token
        String token = jwtTokenProvider.generateToken(username);

        // 返回 UserInfoVO
        UserInfoVO vo = new UserInfoVO();
        vo.setToken(token);
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setRole(user.getRole());
        return vo;
    }

    @Override
    public UserInfoVO getUserInfo(String username) {
        // 查询用户信息
        User user = userMapper.selectByUsername(username);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 生成新 token
        String token = jwtTokenProvider.generateToken(username);

        // 返回 UserInfoVO
        UserInfoVO vo = new UserInfoVO();
        vo.setToken(token);
        vo.setUsername(user.getUsername());
        vo.setNickname(user.getNickname());
        vo.setRole(user.getRole());
        return vo;
    }
}
