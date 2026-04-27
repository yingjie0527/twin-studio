package com.digitaltwin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.digitaltwin.mapper")
public class DigitalTwinApplication {

    public static void main(String[] args) {
        SpringApplication.run(DigitalTwinApplication.class, args);
    }
}
