package com.example.api.pairing;

import java.security.SecureRandom;
import java.util.Base64;

public class TokenUtil {
	private static final SecureRandom RNG = new SecureRandom();

	public static String generateDeviceToken() {
		byte[] bytes = new byte[32];
		RNG.nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	public static String generatePairCode(){
		final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
	  int len = 10;
	  StringBuilder sb = new StringBuilder(len);

	  for (int i = 0; i < len; i++) {
	    int idx = RNG.nextInt(ALPHABET.length());
	    sb.append(ALPHABET.charAt(idx));
	  }
	  return sb.toString();
	}
}
