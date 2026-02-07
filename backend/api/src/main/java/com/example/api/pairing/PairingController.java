package com.example.api.pairing;

import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/pair")
public class PairingController {

  @PostMapping("/confirm-dev")
  public PairConfirmDevResponse confirmDev(@RequestBody PairConfirmDevRequest req) throws Exception {

    // basic validation
    // - pairCode not null/empty
    // - uid not null/empty
    if (req.getPairCode() == null || req.getPairCode().isBlank()) {
      return PairConfirmDevResponse.fail("pairCode missing");
    }
    if (req.getUid() == null || req.getUid().isBlank()) {
      return PairConfirmDevResponse.fail("uid missing");
    }

    Firestore db = FirestoreClient.getFirestore();

    //  look up pairRequests/{pairCode}
    // - if not found -> fail
    // - if expired -> fail 
    var pairRef = db.collection("pairRequests").document(req.getPairCode());
    var snap = pairRef.get().get();
    if (!snap.exists()) {
      return PairConfirmDevResponse.fail("pairCode not found");
    }

    //  generate deviceToken securely
    // make a helper method generateToken(32) etc.
    String deviceToken = TokenUtil.generateDeviceToken();

    // 1) Write devices/{deviceToken} -> uid
    Map<String, Object> deviceDoc = new HashMap<>();
    deviceDoc.put("uid", req.getUid());
    deviceDoc.put("revoked", false);
    deviceDoc.put("createdAt", Instant.now().toString());
  

    db.collection("devices").document(deviceToken).set(deviceDoc).get();

    // 2) Update pairRequests/{pairCode} with status + uid + deviceToken
    Map<String, Object> pairUpdate = new HashMap<>();
    pairUpdate.put("status", "PAIRED");
    pairUpdate.put("uid", req.getUid());
    pairUpdate.put("deviceToken", deviceToken);
    pairUpdate.put("pairedAt", Instant.now().toString());

    pairRef.update(pairUpdate).get();

    return PairConfirmDevResponse.success(deviceToken);
  }


	@PostMapping("/request")
	public PairRequestResponse requestPair() throws Exception {
	  Firestore db = FirestoreClient.getFirestore();

	  String pairCode = null;
	  int attempts = 0;

	  while (attempts < 8) { // fill: e.g., 5
	    attempts++;
	    String candidate = TokenUtil.generatePairCode();

	    var ref = db.collection("pairRequests").document(candidate);
	    var snap = ref.get().get();
	 
	 
	   if (!snap.exists()) {
	      pairCode = candidate;
	      break;
	    }
	  }

	  if (pairCode == null) {
	    return PairRequestResponse.fail("Could not generate unique pair code");
	  }

	  Instant now = Instant.now();
	  Instant expires = now.plusSeconds(600); 

	  Map<String, Object> doc = new HashMap<>();
	  doc.put("status", "PENDING");
	  doc.put("createdAt", now.toString());
	  doc.put("expiresAt", expires.toString());

	  doc.put("pairedAt", null);

	  db.collection("pairRequests").document(pairCode).set(doc).get();

	  return PairRequestResponse.success(pairCode, expires.toString());

	}
	@GetMapping("/status")
public PairStatusResponse status(@RequestParam("code") String code) throws Exception {
  if (code == null || code.isBlank()) {
    return PairStatusResponse.fail("code missing");
  }

  Firestore db = FirestoreClient.getFirestore();
  var ref = db.collection("pairRequests").document(code);
  var snap = ref.get().get();

  if (!snap.exists()) {
    return PairStatusResponse.fail("pairCode not found");
  }

  String s = snap.getString("status");
  String deviceToken = snap.getString("deviceToken");

  if ("PAIRED".equals(s) && deviceToken != null && !deviceToken.isBlank()) {
    return PairStatusResponse.paired(deviceToken);
  }
  return PairStatusResponse.pending();
}

}
