package com.example.api.controllers;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.SetOptions;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class IngestController {

  @PostMapping("/ingest")
  public ResponseEntity<Map<String, Object>> ingest(@RequestBody IngestRequest req) throws Exception {
    Firestore db = FirestoreClient.getFirestore();

    // 1) validate deviceToken
    String deviceToken = req.getDeviceToken();
    if (deviceToken == null || deviceToken.isBlank()) {
      return ResponseEntity.badRequest().body(Map.of("ok", false, "error", "deviceToken missing"));
    }

    // 2) deviceToken -> uid
    var deviceRef = db.collection("devices").document(deviceToken);
    var deviceSnap = deviceRef.get().get();

    if (!deviceSnap.exists()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("ok", false, "error", "Invalid deviceToken"));
    }

    Boolean revoked = deviceSnap.getBoolean("revoked");
    if (Boolean.TRUE.equals(revoked)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("ok", false, "error", "Device token revoked"));
    }

    String uid = deviceSnap.getString("uid");
    if (uid == null || uid.isBlank()) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("ok", false, "error", "Device has no uid"));
    }

    // 3) create ingest id
    String runId = db.collection("users").document(uid)
        .collection("ingests").document().getId();

    // 4) write ingest under user
    Map<String, Object> ingestDoc = new HashMap<>();
    ingestDoc.put("receivedAt", Instant.now().toString());
    ingestDoc.put("source", req.getSource());
    ingestDoc.put("capturedAt", req.getCapturedAt());
    ingestDoc.put("courses", req.getCourses());
    ingestDoc.put("schemaVersion", 1);

    db.collection("users").document(uid)
        .collection("ingests").document(runId)
        .set(ingestDoc).get();

    // 5) update user summary (for dashboard)
    db.collection("users").document(uid)
        .set(Map.of(
            "lastSyncAt", Instant.now().toString(),
            "lastIngestId", runId,
            "extensionPaired", true
        ), SetOptions.merge()).get();

    // 6) update device last seen
    deviceRef.set(Map.of("lastSeenAt", Instant.now().toString()), SetOptions.merge()).get();

    return ResponseEntity.ok(Map.of("ok", true, "uid", uid, "runId", runId));
  }
}

