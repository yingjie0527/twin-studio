package com.digitaltwin.dto;

import lombok.Data;

@Data
public class UserInfoVO {

    private String token;
    private String username;
    private String nickname;
    private String role;
}
