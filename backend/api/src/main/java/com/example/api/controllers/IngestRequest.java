package com.example.api.controllers;

import java.util.List;
import java.util.Map;

public class IngestRequest {
  private String deviceToken;
  private String source;
  private String capturedAt;
  private List<Map<String, Object>> courses;

  public String getDeviceToken() { return deviceToken; }
  public void setDeviceToken(String deviceToken) { this.deviceToken = deviceToken; }

  public String getSource() { return source; }
  public void setSource(String source) { this.source = source; }

  public String getCapturedAt() { return capturedAt; }
  public void setCapturedAt(String capturedAt) { this.capturedAt = capturedAt; }

  public List<Map<String, Object>> getCourses() { return courses; }
  public void setCourses(List<Map<String, Object>> courses) { this.courses = courses; }
}

