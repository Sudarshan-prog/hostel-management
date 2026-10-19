package com.hostel.management.service;

import com.hostel.management.model.AppSetting;
import com.hostel.management.repository.AppSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class RolloverSettingsService {

    public static final String AUTO_ROLLOVER_KEY = "auto_rollover_enabled";

    @Autowired
    private AppSettingRepository appSettingRepository;

    @Value("${hostel.rollover.enabled:false}")
    private boolean defaultEnabled;

    public boolean isAutoRolloverEnabled() {
        return appSettingRepository.findById(AUTO_ROLLOVER_KEY)
                .map(setting -> Boolean.parseBoolean(setting.getSettingValue()))
                .orElse(defaultEnabled);
    }

    public void setAutoRolloverEnabled(boolean enabled) {
        AppSetting setting = appSettingRepository.findById(AUTO_ROLLOVER_KEY).orElse(new AppSetting());
        setting.setSettingKey(AUTO_ROLLOVER_KEY);
        setting.setSettingValue(Boolean.toString(enabled));
        appSettingRepository.save(setting);
    }
}
