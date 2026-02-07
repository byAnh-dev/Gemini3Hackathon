package com.example.api.pairing;

public class PairConfirmDevRequest {
	private String pairCode;
	private String uid;

	public String getPairCode() {return pairCode;}
	public void setPairCode(String pairCode) {this.pairCode = pairCode;}

	public String getUid() { return uid; }
	public void setUid(String uid) { this.uid = uid;}
}
