package com.hostel.management.dto;

import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String type;
    private Long floorId;
    private String floorName; // For display in frontend
}
