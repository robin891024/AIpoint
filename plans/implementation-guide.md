# 實作指南

本文檔提供 AI 內容摘要工具的詳細實作步驟，供開發團隊參考。

## 實作階段劃分

### 階段一：基礎架構建立

#### 1.1 專案初始化
- [ ] 建立專案根目錄結構
- [ ] 初始化 Git 倉庫
- [ ] 建立所有配置文件（參考 [`configuration-files.md`](configuration-files.md)）
- [ ] 設定環境變數

#### 1.2 資料庫設定
- [ ] 啟動 MySQL 容器或安裝 MySQL
- [ ] 執行資料庫初始化腳本
- [ ] 驗證資料庫連接
- [ ] 建立測試資料

#### 1.3 後端專案初始化
- [ ] 使用 Spring Initializr 建立專案或手動建立
- [ ] 配置 [`pom.xml`](configuration-files.md#5-後端-maven-配置)
- [ ] 建立基本專案結構
- [ ] 配置 [`application.yml`](configuration-files.md#31-主配置文件)
- [ ] 測試應用啟動

#### 1.4 前端專案初始化
- [ ] 使用 Vite 建立 React 專案
- [ ] 安裝必要依賴
- [ ] 配置 [`vite.config.js`](configuration-files.md#41-vite-配置)
- [ ] 建立基本專案結構
- [ ] 測試開發伺服器啟動

### 階段二：後端核心功能開發

#### 2.1 資料模型層

**實作順序**：

1. **枚舉類型**
   - `SourceType.java` - 來源類型枚舉
   - `SummaryLength.java` - 摘要長度枚舉

2. **實體類**
   - `SummaryRecord.java` - 摘要記錄實體
   - 使用 JPA 註解配置
   - 加入 Lombok 註解簡化程式碼

3. **DTO 類**
   - `TextSummaryRequest.java` - 文字摘要請求
   - `UrlSummaryRequest.java` - 網址摘要請求
   - `FileSummaryRequest.java` - 文件摘要請求
   - `SummaryResponse.java` - 摘要回應
   - `HistoryResponse.java` - 歷史記錄回應
   - 加入驗證註解（`@NotNull`, `@Size` 等）

#### 2.2 資料存取層

**實作 `SummaryRepository.java`**：

```java
public interface SummaryRepository extends JpaRepository<SummaryRecord, Long> {
    // 按來源類型查詢
    Page<SummaryRecord> findBySourceType(SourceType sourceType, Pageable pageable);
    
    // 按日期範圍查詢
    Page<SummaryRecord> findByCreatedAtBetween(
        LocalDateTime start, 
        LocalDateTime end, 
        Pageable pageable
    );
    
    // 按摘要長度查詢
    List<SummaryRecord> findBySummaryLength(SummaryLength length);
    
    // 統計查詢
    long countBySourceType(SourceType sourceType);
}
```

#### 2.3 配置層

1. **WebConfig.java** - CORS 配置
2. **GroqConfig.java** - Groq API 配置
3. **SwaggerConfig.java** - API 文檔配置

#### 2.4 服務層

**實作順序**：

1. **GroqApiService** - Groq API 整合
   ```java
   public interface GroqApiService {
       String generateSummary(String content, SummaryLength length);
       int estimateTokens(String content);
   }
   ```

2. **FileProcessorService** - 文件處理
   ```java
   public interface FileProcessorService {
       String extractTextFromPdf(MultipartFile file);
       String extractTextFromWord(MultipartFile file);
       boolean isValidFileType(String filename);
   }
   ```

3. **WebScraperService** - 網頁爬取
   ```java
   public interface WebScraperService {
       String scrapeWebContent(String url);
       String extractTitle(String url);
       boolean isValidUrl(String url);
   }
   ```

4. **SummaryService** - 主要業務邏輯
   ```java
   public interface SummaryService {
       SummaryResponse summarizeText(TextSummaryRequest request);
       SummaryResponse summarizeFile(MultipartFile file, SummaryLength length);
       SummaryResponse summarizeUrl(UrlSummaryRequest request);
       Page<SummaryResponse> getHistory(Pageable pageable);
       SummaryResponse getById(Long id);
       void deleteById(Long id);
   }
   ```

#### 2.5 控制器層

**實作 `SummaryController.java`**：

```java
@RestController
@RequestMapping("/api/summary")
@Tag(name = "Summary", description = "摘要生成 API")
public class SummaryController {
    
    @PostMapping("/text")
    public ResponseEntity<SummaryResponse> summarizeText(
        @Valid @RequestBody TextSummaryRequest request
    );
    
    @PostMapping("/file")
    public ResponseEntity<SummaryResponse> summarizeFile(
        @RequestParam("file") MultipartFile file,
        @RequestParam("summaryLength") SummaryLength length
    );
    
    @PostMapping("/url")
    public ResponseEntity<SummaryResponse> summarizeUrl(
        @Valid @RequestBody UrlSummaryRequest request
    );
    
    @GetMapping("/history")
    public ResponseEntity<Page<SummaryResponse>> getHistory(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/{id}")
    public ResponseEntity<SummaryResponse> getById(@PathVariable Long id);
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id);
}
```

#### 2.6 異常處理

**實作 `GlobalExceptionHandler.java`**：

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
        ResourceNotFoundException ex
    );
    
    @ExceptionHandler(FileProcessingException.class)
    public ResponseEntity<ErrorResponse> handleFileProcessing(
        FileProcessingException ex
    );
    
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ErrorResponse> handleApiException(
        ApiException ex
    );
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
        MethodArgumentNotValidException ex
    );
}
```

### 階段三：前端核心功能開發

#### 3.1 基礎設定

1. **建立全域樣式** - `src/assets/styles/global.css`
2. **配置路由** - `src/router.jsx`
3. **建立 Context** - `src/context/AppContext.jsx`
4. **配置 API 服務** - `src/services/api.js`

#### 3.2 通用組件

**實作順序**：

1. **Layout 組件**
   - `Header.jsx` - 頂部導航
   - `Footer.jsx` - 底部資訊
   - `Sidebar.jsx` - 側邊欄（可選）
   - `MainLayout.jsx` - 主佈局

2. **Common 組件**
   - `Button.jsx` - 按鈕組件
   - `Card.jsx` - 卡片組件
   - `Modal.jsx` - 彈窗組件
   - `Toast.jsx` - 提示訊息
   - `LoadingSpinner.jsx` - 載入動畫

#### 3.3 功能組件

**Summary 組件**：

1. **TextInput.jsx** - 文字輸入
   ```jsx
   - 多行文字輸入框
   - 字數統計
   - 清除按鈕
   ```

2. **FileUpload.jsx** - 文件上傳
   ```jsx
   - 拖放上傳
   - 文件類型驗證
   - 文件大小檢查
   - 上傳進度顯示
   ```

3. **UrlInput.jsx** - 網址輸入
   ```jsx
   - URL 格式驗證
   - 快速貼上按鈕
   ```

4. **SummaryOptions.jsx** - 摘要選項
   ```jsx
   - 摘要長度選擇（短/中/長）
   - 語言選擇（未來擴展）
   ```

5. **SummaryDisplay.jsx** - 摘要顯示
   ```jsx
   - 摘要內容顯示
   - 複製按鈕
   - 儲存按鈕
   - Token 使用量顯示
   ```

**History 組件**：

1. **HistoryList.jsx** - 歷史記錄列表
2. **HistoryItem.jsx** - 單一記錄項目
3. **HistoryFilter.jsx** - 篩選器
4. **HistoryDetail.jsx** - 記錄詳情

#### 3.4 頁面組件

1. **Home.jsx** / **SummaryPage.jsx** - 主頁面
   ```jsx
   - Tab 切換（文字/文件/網址）
   - 整合所有 Summary 組件
   - 處理表單提交
   - 顯示結果
   ```

2. **HistoryPage.jsx** - 歷史記錄頁面
   ```jsx
   - 整合 History 組件
   - 分頁功能
   - 篩選和搜尋
   ```

#### 3.5 服務層

**實作 API 服務**：

1. **api.js** - Axios 配置
   ```javascript
   import axios from 'axios';
   
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL,
     timeout: 30000,
   });
   
   // 請求攔截器
   api.interceptors.request.use(config => {
     // 加入 token 等
     return config;
   });
   
   // 回應攔截器
   api.interceptors.response.use(
     response => response.data,
     error => {
       // 錯誤處理
       return Promise.reject(error);
     }
   );
   
   export default api;
   ```

2. **summaryService.js** - 摘要 API
   ```javascript
   export const summarizeText = (data) => 
     api.post('/summary/text', data);
   
   export const summarizeFile = (file, length) => {
     const formData = new FormData();
     formData.append('file', file);
     formData.append('summaryLength', length);
     return api.post('/summary/file', formData);
   };
   
   export const summarizeUrl = (data) => 
     api.post('/summary/url', data);
   ```

3. **historyService.js** - 歷史記錄 API
   ```javascript
   export const getHistory = (page, size) => 
     api.get('/summary/history', { params: { page, size } });
   
   export const getById = (id) => 
     api.get(`/summary/${id}`);
   
   export const deleteById = (id) => 
     api.delete(`/summary/${id}`);
   ```

#### 3.6 自定義 Hooks

1. **useSummary.js**
   ```javascript
   export const useSummary = () => {
     const [loading, setLoading] = useState(false);
     const [result, setResult] = useState(null);
     const [error, setError] = useState(null);
     
     const summarize = async (type, data) => {
       // 實作邏輯
     };
     
     return { loading, result, error, summarize };
   };
   ```

2. **useHistory.js**
   ```javascript
   export const useHistory = () => {
     const [history, setHistory] = useState([]);
     const [loading, setLoading] = useState(false);
     const [pagination, setPagination] = useState({});
     
     const fetchHistory = async (page, size) => {
       // 實作邏輯
     };
     
     return { history, loading, pagination, fetchHistory };
   };
   ```

### 階段四：整合與測試

#### 4.1 後端測試

1. **單元測試**
   - Service 層測試
   - Repository 層測試
   - 使用 Mockito 模擬依賴

2. **整合測試**
   - Controller 測試
   - 使用 MockMvc
   - 測試完整的請求-回應流程

3. **API 測試**
   - 使用 Postman 或 Swagger UI
   - 測試所有端點
   - 驗證錯誤處理

#### 4.2 前端測試

1. **組件測試**
   - 使用 React Testing Library
   - 測試使用者互動
   - 測試條件渲染

2. **整合測試**
   - 測試頁面流程
   - 測試 API 整合

3. **E2E 測試**
   - 使用 Playwright
   - 測試完整使用者流程

#### 4.3 整合測試

1. **前後端整合**
   - 啟動完整環境
   - 測試所有功能
   - 驗證資料流

2. **效能測試**
   - 測試大文件處理
   - 測試並發請求
   - 優化瓶頸

### 階段五：優化與部署

#### 5.1 效能優化

**後端優化**：
- [ ] 加入資料庫索引
- [ ] 實作查詢結果快取
- [ ] 優化大文件處理（非同步）
- [ ] 配置連接池

**前端優化**：
- [ ] 程式碼分割
- [ ] 懶載入
- [ ] 圖片優化
- [ ] 快取策略

#### 5.2 安全性加固

- [ ] 輸入驗證和清理
- [ ] SQL Injection 防護
- [ ] XSS 防護
- [ ] CSRF 防護
- [ ] 檔案上傳安全檢查
- [ ] API 限流

#### 5.3 Docker 化

1. **建立 Dockerfile**
   - 後端 Dockerfile
   - 前端 Dockerfile

2. **配置 Docker Compose**
   - 整合所有服務
   - 配置網路和卷

3. **測試容器化部署**
   - 建置映像
   - 啟動服務
   - 驗證功能

#### 5.4 文檔完善

- [ ] API 文檔（Swagger）
- [ ] 使用者手冊
- [ ] 開發者文檔
- [ ] 部署指南

## 開發最佳實踐

### 程式碼規範

**後端**：
- 遵循 Java 命名規範
- 使用 Lombok 減少樣板程式碼
- 適當使用設計模式
- 編寫清晰的註解

**前端**：
- 遵循 React 最佳實踐
- 使用函數式組件和 Hooks
- 保持組件單一職責
- 適當拆分組件

### Git 工作流程

1. **分支策略**
   ```
   main (穩定版本)
   └── develop (開發分支)
       ├── feature/text-summary
       ├── feature/file-upload
       ├── feature/url-scraper
       └── feature/history-page
   ```

2. **提交訊息規範**
   ```
   feat: 新增文字摘要功能
   fix: 修復文件上傳錯誤
   docs: 更新 API 文檔
   style: 調整程式碼格式
   refactor: 重構 Groq API 服務
   test: 新增單元測試
   chore: 更新依賴版本
   ```

3. **Pull Request 流程**
   - 建立功能分支
   - 完成開發和測試
   - 提交 PR 到 develop
   - Code Review
   - 合併到 develop

### 測試策略

1. **測試金字塔**
   ```
   E2E 測試 (少量)
   整合測試 (適量)
   單元測試 (大量)
   ```

2. **測試覆蓋率目標**
   - 後端：>= 80%
   - 前端：>= 70%

3. **持續整合**
   - 自動執行測試
   - 程式碼品質檢查
   - 建置驗證

## 常見問題與解決方案

### 問題 1: Groq API 超時

**解決方案**：
- 增加超時時間配置
- 實作重試機制
- 加入錯誤處理和使用者提示

### 問題 2: 大文件處理緩慢

**解決方案**：
- 使用非同步處理
- 加入進度回饋
- 限制文件大小
- 分段處理大文件

### 問題 3: 網頁爬取失敗

**解決方案**：
- 處理不同網頁結構
- 加入多種選擇器策略
- 處理 JavaScript 渲染的頁面（使用 Selenium）
- 提供友善的錯誤訊息

### 問題 4: CORS 錯誤

**解決方案**：
- 正確配置後端 CORS
- 使用代理（開發環境）
- 檢查請求標頭

### 問題 5: 資料庫連接失敗

**解決方案**：
- 檢查資料庫是否運行
- 驗證連接字串
- 檢查防火牆設定
- 查看資料庫日誌

## 效能基準

### 目標效能指標

**後端**：
- API 回應時間：< 2 秒（文字摘要）
- 文件處理時間：< 5 秒（10MB 文件）
- 並發處理能力：> 100 請求/秒

**前端**：
- 首次載入時間：< 3 秒
- 互動回應時間：< 100ms
- Lighthouse 分數：> 90

**資料庫**：
- 查詢回應時間：< 100ms
- 寫入回應時間：< 50ms

## 監控與維護

### 日誌監控

1. **應用日誌**
   - 記錄所有 API 請求
   - 記錄錯誤和異常
   - 記錄效能指標

2. **資料庫日誌**
   - 慢查詢日誌
   - 錯誤日誌

3. **系統日誌**
   - CPU 使用率
   - 記憶體使用率
   - 磁碟空間

### 備份策略

1. **資料庫備份**
   - 每日自動備份
   - 保留 30 天備份
   - 定期測試還原

2. **文件備份**
   - 上傳文件定期備份
   - 使用雲端儲存

### 更新維護

1. **依賴更新**
   - 定期檢查安全更新
   - 測試後更新依賴

2. **功能迭代**
   - 收集使用者回饋
   - 規劃新功能
   - 持續優化

## 下一步行動

完成規劃後，建議按以下順序進行：

1. **立即行動**
   - 切換到 Code 模式
   - 開始階段一：基礎架構建立
   - 建立所有配置文件

2. **第一週目標**
   - 完成專案初始化
   - 完成資料庫設定
   - 完成基本的後端 API

3. **第二週目標**
   - 完成 Groq API 整合
   - 完成文件處理功能
   - 開始前端開發

4. **第三週目標**
   - 完成前端主要功能
   - 整合前後端
   - 開始測試

5. **第四週目標**
   - 完成所有測試
   - 優化效能
   - 準備部署

---

**文檔版本**: 1.0  
**最後更新**: 2025-12-21  
**適用階段**: 實作階段
