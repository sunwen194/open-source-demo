package com.dormitory.repair.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dormitory.repair.dto.LoginRequest;
import com.dormitory.repair.dto.LoginResponse;
import com.dormitory.repair.dto.RegisterRequest;
import com.dormitory.repair.entity.User;
import com.dormitory.repair.enums.RoleEnum;
import com.dormitory.repair.mapper.UserMapper;
import com.dormitory.repair.service.UserService;
import com.dormitory.repair.util.JwtUtil;
import com.dormitory.repair.util.PasswordUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordUtil passwordUtil;
    private final JwtUtil jwtUtil;

    @Override
    public LoginResponse login(LoginRequest request) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername());
        User user = userMapper.selectOne(wrapper);

        if (user == null) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (!passwordUtil.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        if (user.getStatus() == 0) {
            throw new RuntimeException("账号已被禁用");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRealName(user.getRealName());
        response.setRole(user.getRole());
        response.setRoleName(getRoleName(user.getRole()));
        response.setToken(token);
        response.setDormitoryBuilding(user.getDormitoryBuilding());
        response.setDormitoryRoom(user.getDormitoryRoom());

        return response;
    }

    @Override
    public LoginResponse register(RegisterRequest request) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUsername, request.getUsername());
        User existUser = userMapper.selectOne(wrapper);

        if (existUser != null) {
            throw new RuntimeException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordUtil.encrypt(request.getPassword()));
        user.setRealName(request.getRealName());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setRole(RoleEnum.STUDENT.getCode());
        user.setStatus(1);
        user.setDormitoryBuilding(request.getDormitoryBuilding());
        user.setDormitoryRoom(request.getDormitoryRoom());

        userMapper.insert(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getId());
        response.setUsername(user.getUsername());
        response.setRealName(user.getRealName());
        response.setRole(user.getRole());
        response.setRoleName(getRoleName(user.getRole()));
        response.setToken(token);
        response.setDormitoryBuilding(user.getDormitoryBuilding());
        response.setDormitoryRoom(user.getDormitoryRoom());

        return response;
    }

    @Override
    public User getUserById(Long userId) {
        return userMapper.selectById(userId);
    }

    @Override
    public List<User> getAllWorkers() {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getRole, RoleEnum.WORKER.getCode());
        wrapper.eq(User::getStatus, 1);
        return userMapper.selectList(wrapper);
    }

    @Override
    public Page<User> getWorkersPage(Integer pageNum, Integer pageSize, String keyword) {
        Page<User> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getRole, RoleEnum.WORKER.getCode());

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(User::getRealName, keyword)
                    .or()
                    .like(User::getPhone, keyword));
        }

        wrapper.orderByDesc(User::getCreateTime);
        return userMapper.selectPage(page, wrapper);
    }

    @Override
    public User updateUserInfo(User user) {
        userMapper.updateById(user);
        return userMapper.selectById(user.getId());
    }

    private String getRoleName(Integer role) {
        for (RoleEnum roleEnum : RoleEnum.values()) {
            if (roleEnum.getCode().equals(role)) {
                return roleEnum.getDesc();
            }
        }
        return "未知";
    }
}
