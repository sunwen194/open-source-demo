package com.dormitory.repair;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.dormitory.repair.mapper")
public class DormitoryRepairApplication {

    public static void main(String[] args) {
        SpringApplication.run(DormitoryRepairApplication.class, args);
        System.out.println("====================================");
        System.out.println("宿舍报修系统启动成功！");
        System.out.println("访问地址: http://localhost:8080");
        System.out.println("====================================");
    }
}
