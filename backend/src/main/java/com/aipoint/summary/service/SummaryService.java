package com.aipoint.summary.service;

import com.aipoint.summary.model.dto.GroqRequest;
import com.aipoint.summary.model.dto.GroqResponse;
import com.aipoint.summary.model.entity.SummaryRecord;
import com.aipoint.summary.repository.SummaryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Service
public class SummaryService {

    private final SummaryRepository summaryRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${groq.api-key:}")
    private String apiKey;

    @Value("${groq.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${groq.model:openai/gpt-oss-120b}")
    private String model;

    public SummaryService(SummaryRepository summaryRepository) {
        this.summaryRepository = summaryRepository;
    }

    /**
     * 獲取所有歷史紀錄
     */
    public List<SummaryRecord> getAllHistory() {
        return summaryRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * 刪除特定紀錄
     */
    public void deleteHistory(Long id) {
        summaryRepository.deleteById(id);
    }

    public String summarize(String content) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "錯誤: Groq API Key 未設定。請在 application.yml 中配置 groq.api-key 或使用啟動參數 --groq.api-key=YOUR_KEY";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        GroqRequest.Message message = new GroqRequest.Message();
        message.setRole("user");
        message.setContent("請幫我摘要以下內容，使用繁體中文：\n\n" + content);

        GroqRequest request = new GroqRequest();
        request.setModel(model);
        request.setMessages(Collections.singletonList(message));
        request.setTemperature(1.0);
        request.setMax_completion_tokens(8192);
        request.setTop_p(1.0);
        request.setReasoning_effort("medium");
        request.setStream(false);

        HttpEntity<GroqRequest> entity = new HttpEntity<>(request, headers);

        try {
            GroqResponse response = restTemplate.postForObject(baseUrl + "/chat/completions", entity, GroqResponse.class);
            
            if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                String summaryText = response.getChoices().get(0).getMessage().getContent();
                
                // 儲存到資料庫
                SummaryRecord record = new SummaryRecord();
                record.setSourceType("TEXT");
                record.setSourceContent(content);
                record.setSummaryText(summaryText);
                summaryRepository.save(record);

                return summaryText;
            }
            return "錯誤: Groq API 回傳為空。請檢查 API Key 是否有效。";
        } catch (Exception e) {
            return "呼叫 Groq API 失敗: " + e.getMessage();
        }
    }
}
