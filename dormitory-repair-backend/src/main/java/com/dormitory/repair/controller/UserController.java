package com.dormitory.repair.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dormitory.repair.common.Result;
import com.dormitory.repair.entity.User;
import com.dormitory.repair.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public Result<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return Result.success(user);
    }

    @GetMapping("/workers")
    public Result<List<User>> getAllWorkers() {
        List<User> workers = userService.getAllWorkers();
        return Result.success(workers);
    }

    @GetMapping("/workers/page")
    public Result<Page<User>> getWorkersPage(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        Page<User> workerPage = userService.getWorkersPage(pageNum, pageSize, keyword);
        return Result.success(workerPage);
    }

    @PutMapping
    public Result<User> updateUserInfo(@RequestBody User user) {
        User updatedUser = userService.updateUserInfo(user);
        return Result.success(updatedUser);
    }
}
