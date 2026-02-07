package com.example.api.pairing;

public class PairConfirmDevResponse {
	public boolean ok;
	public String deviceToken;
	public String error;

	public static PairConfirmDevResponse success(String deviceToken){
		PairConfirmDevResponse r = new PairConfirmDevResponse();
		r.ok = true;
		r.deviceToken = deviceToken;
		return r;
	}

	public static PairConfirmDevResponse fail(String msg){
		PairConfirmDevResponse r = new PairConfirmDevResponse();
		r.ok = false;
		r.error = msg;
		return r;
	}
}
