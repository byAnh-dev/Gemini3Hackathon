package com.example.api.controllers;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class IngestController {

  @PostMapping("/ingest")
  public Map<String, Object> ingest(@RequestBody Map<String, Object> payload) throws Exception {
    Firestore db = FirestoreClient.getFirestore();

    Map<String, Object> doc = new HashMap<>();
    doc.put("receivedAt", Instant.now().toString());
    doc.put("payload", payload);

    var ref = db.collection("ingests").document(); // auto-id
    ref.set(doc).get();

    return Map.of(
        "ok", true,
        "docId", ref.getId()
    );
  }
}

