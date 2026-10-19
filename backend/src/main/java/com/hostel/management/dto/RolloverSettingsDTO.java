package com.hostel.management.dto;

public class RolloverSettingsDTO {
    private boolean enabled;
    private String schedule;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getSchedule() { return schedule; }
    public void setSchedule(String schedule) { this.schedule = schedule; }
}
