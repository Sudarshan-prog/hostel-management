package com.hostel.management.dto;

import lombok.Data;

@Data
public class BedDTO {
    private Long id;
    private String identifier;
    private String status;
    private Long roomId;
    private Long bookedByStudentId;
    private String bookedByStudentName;
}
