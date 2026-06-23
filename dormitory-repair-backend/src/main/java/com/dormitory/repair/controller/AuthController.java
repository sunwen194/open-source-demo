package com.dormitory.repair.controller;

import com.dormitory.repair.common.Result;
import com.dormitory.repair.dto.LoginRequest;
import com.dormitory.repair.dto.LoginResponse;
import com.dormitory.repair.dto.RegisterRequest;
import com.dormitory.repair.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            LoginResponse response = userService.login(request);
            return Result.success(response);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PostMapping("/register")
    public Result<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            LoginResponse response = userService.register(request);
            return Result.success("注册成功", response);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
