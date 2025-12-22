package com.aipoint.summary.model.dto;

import java.util.List;

public class GroqRequest {
    private String model;
    private List<Message> messages;
    private Double temperature;
    private Integer max_completion_tokens;
    private Double top_p;
    private String reasoning_effort;
    private Boolean stream;

    public static class Message {
        private String role;
        private String content;

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    // Getters and Setters
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
    public List<Message> getMessages() { return messages; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }
    public Integer getMax_completion_tokens() { return max_completion_tokens; }
    public void setMax_completion_tokens(Integer max_completion_tokens) { this.max_completion_tokens = max_completion_tokens; }
    public Double getTop_p() { return top_p; }
    public void setTop_p(Double top_p) { this.top_p = top_p; }
    public String getReasoning_effort() { return reasoning_effort; }
    public void setReasoning_effort(String reasoning_effort) { this.reasoning_effort = reasoning_effort; }
    public Boolean getStream() { return stream; }
    public void setStream(Boolean stream) { this.stream = stream; }
}
