package edu.whut.bear.panda.pojo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * @author Spring-_-Bear
 * @datetime 2022/5/2 17:12
 */
@Data
@Component
public class Upload {
    public static final int TYPE_BOOK = 0;
    public static final int TYPE_COVER = 1;
    public static final int TYPE_PORTRAIT = 2;
    public static final int TYPE_BACKGROUND = 3;
    public static final int STATUS_PROCESSED = 0;
    public static final int STATUS_UNPROCESSED = 1;

    private Integer id;
    private Integer userId;
    private Integer userType;
    private String username;
    private Integer type;
    private Integer status = STATUS_UNPROCESSED;
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd", timezone = "GMT+8")
    private Date uploadTime = new Date();
    private String domain;
    private String key;
    private String bucket;

    public Upload() {
    }

    // TODO
    public Upload(Integer id, Integer userId, Integer userType, String username, Integer type, Integer status, Date uploadTime, String domain, String key, String bucket) {
        this.id = id;
        this.userId = userId;
        this.userType = userType;
        this.username = username;
        this.type = type;
        this.status = status;
        this.uploadTime = uploadTime;
        this.domain = domain;
        this.key = key;
        this.bucket = bucket;
    }
}