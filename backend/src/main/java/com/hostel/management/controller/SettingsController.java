package com.hostel.management.controller;

import com.hostel.management.dto.RolloverSettingsDTO;
import com.hostel.management.service.RolloverSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private RolloverSettingsService rolloverSettingsService;

    @Value("${hostel.rollover.cron:0 0 0 1 6 *}")
    private String rolloverCron;

    @GetMapping("/rollover")
    public RolloverSettingsDTO getRolloverSettings() {
        RolloverSettingsDTO dto = new RolloverSettingsDTO();
        dto.setEnabled(rolloverSettingsService.isAutoRolloverEnabled());
        dto.setSchedule("1 June at midnight (cron: " + rolloverCron + ")");
        return dto;
    }

    @PutMapping("/rollover")
    public ResponseEntity<RolloverSettingsDTO> updateRolloverSettings(@RequestBody RolloverSettingsDTO request) {
        rolloverSettingsService.setAutoRolloverEnabled(request.isEnabled());
        return ResponseEntity.ok(getRolloverSettings());
    }
}
