package com.dormitory.repair.dto;

import lombok.Data;
import java.io.Serializable;

@Data
public class LoginResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long userId;

    private String username;

    private String realName;

    private Integer role;

    private String roleName;

    private String token;

    private String dormitoryBuilding;

    private String dormitoryRoom;
}
