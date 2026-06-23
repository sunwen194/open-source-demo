package com.dormitory.repair.util;

import cn.hutool.crypto.SecureUtil;
import org.springframework.stereotype.Component;

@Component
public class PasswordUtil {

    public String encrypt(String password) {
        return SecureUtil.md5(password);
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        return SecureUtil.md5(rawPassword).equals(encodedPassword);
    }
}
