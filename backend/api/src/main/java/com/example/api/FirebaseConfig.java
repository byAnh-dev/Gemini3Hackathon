package com.example.api.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;

@Configuration
public class FirebaseConfig {

  @Value("${firebase.serviceAccountPath}")
  private String serviceAccountPath;

  @PostConstruct
  public void init() throws Exception {
    // Avoid re-initializing if Spring reloads
    if (!FirebaseApp.getApps().isEmpty()) return;

    try (FileInputStream serviceAccount = new FileInputStream(serviceAccountPath)) {
      FirebaseOptions options = FirebaseOptions.builder()
          .setCredentials(GoogleCredentials.fromStream(serviceAccount))
          .build();

      FirebaseApp.initializeApp(options);
    }
  }
}

