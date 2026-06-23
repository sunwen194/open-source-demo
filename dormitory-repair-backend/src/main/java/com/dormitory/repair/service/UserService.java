package com.dormitory.repair.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dormitory.repair.dto.LoginRequest;
import com.dormitory.repair.dto.LoginResponse;
import com.dormitory.repair.dto.RegisterRequest;
import com.dormitory.repair.entity.User;

import java.util.List;

public interface UserService {

    LoginResponse login(LoginRequest request);

    LoginResponse register(RegisterRequest request);

    User getUserById(Long userId);

    List<User> getAllWorkers();

    Page<User> getWorkersPage(Integer pageNum, Integer pageSize, String keyword);

    User updateUserInfo(User user);
}
