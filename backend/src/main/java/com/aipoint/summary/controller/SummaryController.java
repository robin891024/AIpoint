package com.aipoint.summary.controller;

import com.aipoint.summary.service.SummaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 摘要生成控制器
 */
@RestController
@RequestMapping("/api/summary")
public class SummaryController {

    private final SummaryService summaryService;

    public SummaryController(SummaryService summaryService) {
        this.summaryService = summaryService;
    }

    /**
     * 文字摘要 API
     */
    @PostMapping("/text")
    public ResponseEntity<Map<String, String>> summarizeText(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "內容不能為空"));
        }

        String result = summaryService.summarize(content);
        return ResponseEntity.ok(Map.of("summary", result));
    }

    /**
     * 獲取歷史紀錄 API
     */
    @GetMapping("/history")
    public ResponseEntity<java.util.List<com.aipoint.summary.model.entity.SummaryRecord>> getHistory() {
        return ResponseEntity.ok(summaryService.getAllHistory());
    }

    /**
     * 刪除歷史紀錄 API
     */
    @DeleteMapping("/history/{id}")
    public ResponseEntity<Map<String, String>> deleteHistory(@PathVariable Long id) {
        summaryService.deleteHistory(id);
        return ResponseEntity.ok(Map.of("message", "紀錄已刪除"));
    }
}
