package com.example.api.pairing;

public class PairStatusResponse {
  public boolean ok;
  public String status;      // "PENDING" or "PAIRED"
  public String deviceToken; // only set when PAIRED
  public String error;

  public static PairStatusResponse pending() {
    PairStatusResponse r = new PairStatusResponse();
    r.ok = true;
    r.status = "PENDING";
    return r;
  }

  public static PairStatusResponse paired(String token) {
    PairStatusResponse r = new PairStatusResponse();
    r.ok = true;
    r.status = "PAIRED";
    r.deviceToken = token;
    return r;
  }

  public static PairStatusResponse fail(String msg) {
    PairStatusResponse r = new PairStatusResponse();
    r.ok = false;
    r.error = msg;
    return r;
  }
}

