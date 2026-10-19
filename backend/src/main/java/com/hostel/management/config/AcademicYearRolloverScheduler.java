package com.hostel.management.config;

import com.hostel.management.service.AcademicYearRolloverService;
import com.hostel.management.service.RolloverSettingsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AcademicYearRolloverScheduler {

    private static final Logger log = LoggerFactory.getLogger(AcademicYearRolloverScheduler.class);

    @Autowired
    private AcademicYearRolloverService rolloverService;

    @Autowired
    private RolloverSettingsService rolloverSettingsService;

    @Scheduled(cron = "${hostel.rollover.cron:0 0 0 1 6 *}")
    public void runScheduledRollover() {
        if (!rolloverSettingsService.isAutoRolloverEnabled()) {
            return;
        }
        log.info("Running scheduled academic year rollover");
        rolloverService.performRollover();
        log.info("Scheduled academic year rollover completed");
    }
}
