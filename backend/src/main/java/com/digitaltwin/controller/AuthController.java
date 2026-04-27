package com.digitaltwin.controller;

import com.digitaltwin.common.Result;
import com.digitaltwin.dto.LoginDTO;
import com.digitaltwin.dto.RegisterDTO;
import com.digitaltwin.dto.UserInfoVO;
import com.digitaltwin.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * 用户登录
     */
    @PostMapping("/login")
    public Result<UserInfoVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        UserInfoVO userInfo = authService.login(loginDTO.getUsername(), loginDTO.getPassword());
        return Result.success(userInfo);
    }

    /**
     * 用户注册
     */
    @PostMapping("/register")
    public Result<UserInfoVO> register(@Valid @RequestBody RegisterDTO registerDTO) {
        UserInfoVO userInfo = authService.register(
                registerDTO.getUsername(),
                registerDTO.getPassword(),
                registerDTO.getNickname()
        );
        return Result.success(userInfo);
    }

    /**
     * 获取当前用户信息
     */
    @GetMapping("/userinfo")
    public Result<UserInfoVO> getUserInfo() {
        // 从 SecurityContext 获取当前认证用户名
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        UserInfoVO userInfo = authService.getUserInfo(username);
        return Result.success(userInfo);
    }
}
