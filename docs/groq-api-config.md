# Groq API 配置說明

本文檔說明專案中 Groq API 的配置和使用方式。

## API 配置

### 模型資訊
- **模型名稱**: `openai/gpt-oss-120b`
- **API 端點**: `https://api.groq.com/openai/v1`
- **API Key**: 已配置在環境變數中

### 參數設定

```yaml
groq:
  model: openai/gpt-oss-120b
  max-completion-tokens: 8192
  temperature: 1
  top-p: 1
  reasoning-effort: medium
  stream: true
```

### 參數說明

| 參數 | 值 | 說明 |
|------|-----|------|
| `model` | `openai/gpt-oss-120b` | 使用的 AI 模型 |
| `max-completion-tokens` | `8192` | 最大生成 token 數量 |
| `temperature` | `1` | 控制輸出的隨機性（0-2） |
| `top-p` | `1` | 核採樣參數 |
| `reasoning-effort` | `medium` | 推理努力程度 |
| `stream` | `true` | 啟用串流模式 |

### 摘要長度對應

| 摘要長度 | Max Tokens | 說明 |
|----------|------------|------|
| SHORT | 1024 | 簡短摘要（約 2-3 句話） |
| MEDIUM | 2048 | 中等摘要（約 1-2 段落） |
| LONG | 4096 | 詳細摘要（約 3-4 段落） |

## Python SDK 範例

```python
from groq import Groq

client = Groq()
completion = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {
            "role": "user",
            "content": "請為以下內容生成摘要：..."
        }
    ],
    temperature=1,
    max_completion_tokens=8192,
    top_p=1,
    reasoning_effort="medium",
    stream=True,
    stop=None
)

for chunk in completion:
    print(chunk.choices[0].delta.content or "", end="")
```

## Java 實作方式

### 使用 WebClient（Spring WebFlux）

```java
@Service
public class GroqApiServiceImpl implements GroqApiService {
    
    @Value("${groq.api-key}")
    private String apiKey;
    
    @Value("${groq.base-url}")
    private String baseUrl;
    
    @Value("${groq.model}")
    private String model;
    
    private final WebClient webClient;
    
    public GroqApiServiceImpl(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl(baseUrl)
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
    }
    
    @Override
    public String generateSummary(String content, SummaryLength length) {
        GroqRequest request = GroqRequest.builder()
            .model(model)
            .messages(List.of(
                new Message("user", buildPrompt(content, length))
            ))
            .temperature(1.0)
            .maxCompletionTokens(getMaxTokens(length))
            .topP(1.0)
            .reasoningEffort("medium")
            .stream(false) // 非串流模式
            .build();
        
        GroqResponse response = webClient.post()
            .uri("/chat/completions")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(GroqResponse.class)
            .block();
        
        return response.getChoices().get(0).getMessage().getContent();
    }
    
    private int getMaxTokens(SummaryLength length) {
        return switch (length) {
            case SHORT -> 1024;
            case MEDIUM -> 2048;
            case LONG -> 4096;
        };
    }
    
    private String buildPrompt(String content, SummaryLength length) {
        String lengthDesc = switch (length) {
            case SHORT -> "簡短的";
            case MEDIUM -> "中等長度的";
            case LONG -> "詳細的";
        };
        
        return String.format(
            "請為以下內容生成一個%s摘要，使用繁體中文：\n\n%s\n\n" +
            "摘要要求：\n" +
            "1. 保留關鍵資訊和重點\n" +
            "2. 語句通順、邏輯清晰\n" +
            "3. 客觀中立的語氣",
            lengthDesc, content
        );
    }
}
```

### 串流模式實作

```java
@Override
public Flux<String> generateSummaryStream(String content, SummaryLength length) {
    GroqRequest request = GroqRequest.builder()
        .model(model)
        .messages(List.of(new Message("user", buildPrompt(content, length))))
        .temperature(1.0)
        .maxCompletionTokens(getMaxTokens(length))
        .topP(1.0)
        .reasoningEffort("medium")
        .stream(true) // 啟用串流
        .build();
    
    return webClient.post()
        .uri("/chat/completions")
        .bodyValue(request)
        .accept(MediaType.TEXT_EVENT_STREAM)
        .retrieve()
        .bodyToFlux(String.class)
        .map(this::extractContent);
}

private String extractContent(String chunk) {
    // 解析 SSE 格式的串流資料
    if (chunk.startsWith("data: ")) {
        String json = chunk.substring(6);
        if (!"[DONE]".equals(json)) {
            // 解析 JSON 並提取 content
            return parseStreamChunk(json);
        }
    }
    return "";
}
```

## 請求/回應格式

### 請求格式

```json
{
  "model": "openai/gpt-oss-120b",
  "messages": [
    {
      "role": "user",
      "content": "請為以下內容生成摘要：..."
    }
  ],
  "temperature": 1,
  "max_completion_tokens": 8192,
  "top_p": 1,
  "reasoning_effort": "medium",
  "stream": false
}
```

### 回應格式（非串流）

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "openai/gpt-oss-120b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "這是生成的摘要內容..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 150,
    "total_tokens": 250
  }
}
```

### 回應格式（串流）

```
data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1234567890,"model":"openai/gpt-oss-120b","choices":[{"index":0,"delta":{"content":"這"},"finish_reason":null}]}

data: {"id":"chatcmpl-xxx","object":"chat.completion.chunk","created":1234567890,"model":"openai/gpt-oss-120b","choices":[{"index":0,"delta":{"content":"是"},"finish_reason":null}]}

data: [DONE]
```

## 錯誤處理

### 常見錯誤

| 錯誤碼 | 說明 | 處理方式 |
|--------|------|----------|
| 401 | API Key 無效 | 檢查環境變數中的 API Key |
| 429 | 超過速率限制 | 實作重試機制，增加延遲 |
| 500 | 伺服器錯誤 | 記錄錯誤並通知使用者 |

### 錯誤處理範例

```java
@Override
public String generateSummary(String content, SummaryLength length) {
    try {
        return webClient.post()
            .uri("/chat/completions")
            .bodyValue(buildRequest(content, length))
            .retrieve()
            .onStatus(
                HttpStatus::is4xxClientError,
                response -> response.bodyToMono(String.class)
                    .map(body -> new ApiException("Client error: " + body))
            )
            .onStatus(
                HttpStatus::is5xxServerError,
                response -> Mono.error(new ApiException("Server error"))
            )
            .bodyToMono(GroqResponse.class)
            .map(response -> response.getChoices().get(0).getMessage().getContent())
            .block();
    } catch (Exception e) {
        log.error("Failed to generate summary", e);
        throw new SummaryGenerationException("無法生成摘要，請稍後再試", e);
    }
}
```

## 效能優化

### 1. 連接池配置

```yaml
spring:
  webflux:
    client:
      max-connections: 100
      max-idle-time: 30s
```

### 2. 超時設定

```java
private final WebClient webClient = webClientBuilder
    .baseUrl(baseUrl)
    .clientConnector(new ReactorClientHttpConnector(
        HttpClient.create()
            .responseTimeout(Duration.ofSeconds(60))
    ))
    .build();
```

### 3. 快取策略

```java
@Cacheable(value = "summaries", key = "#content.hashCode() + '-' + #length")
public String generateSummary(String content, SummaryLength length) {
    // 實作邏輯
}
```

## 監控與日誌

### 記錄 API 呼叫

```java
log.info("Calling Groq API - Model: {}, Length: {}, Content length: {}", 
    model, length, content.length());

long startTime = System.currentTimeMillis();
String summary = generateSummary(content, length);
long duration = System.currentTimeMillis() - startTime;

log.info("Groq API call completed - Duration: {}ms, Summary length: {}", 
    duration, summary.length());
```

### 統計資訊

- 記錄每次 API 呼叫的時間
- 追蹤 token 使用量
- 監控錯誤率

## 成本控制

### Token 使用估算

- 輸入文字：約 1 token = 4 個字元（英文）或 1-2 個字（中文）
- 輸出摘要：根據 `max_completion_tokens` 設定

### 建議

1. 限制輸入文字長度（如 50,000 字元）
2. 根據需求調整 `max_completion_tokens`
3. 實作使用者配額限制
4. 定期檢查 API 使用量

## 參考資源

- [Groq API 文檔](https://console.groq.com/docs)
- [Groq Python SDK](https://github.com/groq/groq-python)
- [OpenAI API 相容性](https://platform.openai.com/docs/api-reference)

---

**最後更新**: 2025-12-21  
**模型版本**: openai/gpt-oss-120b
