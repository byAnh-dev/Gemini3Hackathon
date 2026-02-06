package com.example.api;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GeminiController {

  @GetMapping("/gemini/ping")
  public String ping(@RequestParam(defaultValue = "What would be the best way to finish my Calc 3 homework") String text) {
    Client client = new Client(); // reads GEMINI_API_KEY
    GenerateContentResponse resp =
        client.models.generateContent("gemini-3-flash-preview", text, null);
    return resp.text();
  }
}

