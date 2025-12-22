# AI 內容摘要工具 - 後端

Spring Boot 後端 API 服務

## 技術棧

- **Spring Boot 3.2.0** - 後端框架
- **Java 17** - 程式語言
- **MySQL 8.0** - 資料庫
- **Spring Data JPA** - ORM
- **SpringDoc OpenAPI** - API 文檔
- **Apache POI** - Word 文件處理
- **Apache PDFBox** - PDF 文件處理
- **Jsoup** - 網頁爬取

## 快速開始

### 前置需求

- Java 17 或更高版本
- Maven 3.8 或更高版本
- MySQL 8.0 或更高版本

### 設定資料庫

```bash
# 建立資料庫
mysql -u root -p
CREATE DATABASE ai_summary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 或使用 Docker
docker-compose up -d mysql
```

### 設定環境變數

```bash
cp .env.example .env
# 編輯 .env 文件，填入必要資訊
```

### 安裝依賴並啟動

```bash
# 安裝依賴
mvn clean install

# 啟動應用
mvn spring-boot:run
```

應用將在 `http://localhost:8080` 啟動

## 專案結構

```
src/main/java/com/aipoint/summary/
├── controller/      # REST API 控制器
├── service/         # 業務邏輯層
├── model/           # 資料模型
│   ├── entity/      # JPA 實體
│   ├── dto/         # 資料傳輸物件
│   └── enums/       # 枚舉類型
├── repository/      # 資料存取層
├── config/          # 配置類
└── exception/       # 異常處理
```

## API 端點

### 摘要相關

- `POST /api/summary/text` - 文字摘要
- `POST /api/summary/file` - 文件摘要
- `POST /api/summary/url` - 網址摘要
- `GET /api/summary/history` - 歷史記錄
- `GET /api/summary/{id}` - 獲取單一記錄
- `DELETE /api/summary/{id}` - 刪除記錄

### 系統相關

- `GET /actuator/health` - 健康檢查
- `GET /swagger-ui.html` - API 文檔

## 可用命令

```bash
# 清理並建置
mvn clean install

# 執行測試
mvn test

# 跳過測試建置
mvn clean package -DskipTests

# 執行特定測試
mvn test -Dtest=SummaryServiceTest

# 生成測試覆蓋率報告
mvn jacoco:report
```

## 配置文件

- `application.yml` - 主配置文件
- `application-dev.yml` - 開發環境配置
- `application-prod.yml` - 生產環境配置

## 環境變數

查看 [`.env.example`](.env.example) 了解所有可用的環境變數。

## 開發指南

### 程式碼規範

- 遵循 Java 命名規範
- 使用 Lombok 減少樣板程式碼
- 適當使用設計模式
- 編寫清晰的註解

### 測試

- 單元測試：測試 Service 層邏輯
- 整合測試：測試 Controller 和完整流程
- 使用 Mockito 模擬依賴

### 日誌

- 使用 SLF4J 進行日誌記錄
- 日誌文件位置：`logs/application.log`
- 開發環境：DEBUG 級別
- 生產環境：INFO 級別

## API 文檔

啟動應用後訪問：
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 資料庫遷移

使用 Hibernate 自動更新 Schema（開發環境）：
```yaml
spring.jpa.hibernate.ddl-auto: update
```

生產環境建議使用 Flyway 或 Liquibase 進行版本控制。

## 故障排除

### 無法連接資料庫

1. 檢查 MySQL 是否運行
2. 驗證資料庫連接字串
3. 檢查使用者名稱和密碼

### Groq API 錯誤

1. 確認 API Key 是否正確
2. 檢查 API 配額
3. 查看日誌獲取詳細錯誤

## 授權

MIT
