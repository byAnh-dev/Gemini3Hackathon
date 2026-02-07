package com.example.api.pairing;
public class PairRequestResponse{
	public boolean ok; 
	public String pairCode;
	public String error;
	public String expiresAt;

	public static PairRequestResponse success(String pairCode, String expiresAt) {
    PairRequestResponse r = new PairRequestResponse();
    r.ok = true;
    r.pairCode = pairCode;
    r.expiresAt = expiresAt;
    return r;
  }

  public static PairRequestResponse fail(String msg) {
    PairRequestResponse r = new PairRequestResponse();
    r.ok = false;
    r.error = msg;
    return r;
  }
}
