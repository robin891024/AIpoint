package com.aipoint.summary.model.dto;

import java.util.List;

public class GroqResponse {
    private List<Choice> choices;
    private Usage usage;

    public static class Choice {
        private Message message;
        public Message getMessage() { return message; }
        public void setMessage(Message message) { this.message = message; }
    }

    public static class Message {
        private String content;
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class Usage {
        private Integer total_tokens;
        public Integer getTotal_tokens() { return total_tokens; }
        public void setTotal_tokens(Integer total_tokens) { this.total_tokens = total_tokens; }
    }

    // Getters and Setters
    public List<Choice> getChoices() { return choices; }
    public void setChoices(List<Choice> choices) { this.choices = choices; }
    public Usage getUsage() { return usage; }
    public void setUsage(Usage usage) { this.usage = usage; }
}
