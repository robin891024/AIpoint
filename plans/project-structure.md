# AI 內容摘要工具 - 專案目錄結構

## 完整目錄結構

```
AIpoint/
├── frontend/                          # React + Vite 前端專案
│   ├── public/                        # 靜態資源
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                    # 圖片、字體等資源
│   │   │   ├── images/
│   │   │   └── styles/
│   │   │       └── global.css
│   │   ├── components/                # React 組件
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── Summary/
│   │   │   │   ├── TextInput.jsx
│   │   │   │   ├── FileUpload.jsx
│   │   │   │   ├── UrlInput.jsx
│   │   │   │   ├── SummaryDisplay.jsx
│   │   │   │   ├── SummaryOptions.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── History/
│   │   │   │   ├── HistoryList.jsx
│   │   │   │   ├── HistoryItem.jsx
│   │   │   │   ├── HistoryFilter.jsx
│   │   │   │   └── HistoryDetail.jsx
│   │   │   └── Common/
│   │   │       ├── Button.jsx
│   │   │       ├── Card.jsx
│   │   │       ├── Modal.jsx
│   │   │       └── Toast.jsx
│   │   ├── pages/                     # 頁面組件
│   │   │   ├── Home.jsx
│   │   │   ├── SummaryPage.jsx
│   │   │   ├── HistoryPage.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/                  # API 服務
│   │   │   ├── api.js
│   │   │   ├── summaryService.js
│   │   │   └── historyService.js
│   │   ├── hooks/                     # 自定義 Hooks
│   │   │   ├── useSummary.js
│   │   │   ├── useHistory.js
│   │   │   └── useToast.js
│   │   ├── context/                   # Context API
│   │   │   ├── AppContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/                     # 工具函數
│   │   │   ├── constants.js
│   │   │   ├── helpers.js
│   │   │   └── validators.js
│   │   ├── App.jsx                    # 主應用組件
│   │   ├── main.jsx                   # 入口文件
│   │   └── router.jsx                 # 路由配置
│   ├── .env.example                   # 環境變數範例
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/                           # Spring Boot 後端專案
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/aipoint/summary/
│   │   │   │   ├── controller/
│   │   │   │   │   ├── SummaryController.java
│   │   │   │   │   └── HealthController.java
│   │   │   │   ├── service/
│   │   │   │   │   ├── SummaryService.java
│   │   │   │   │   ├── SummaryServiceImpl.java
│   │   │   │   │   ├── GroqApiService.java
│   │   │   │   │   ├── GroqApiServiceImpl.java
│   │   │   │   │   ├── FileProcessorService.java
│   │   │   │   │   ├── FileProcessorServiceImpl.java
│   │   │   │   │   ├── WebScraperService.java
│   │   │   │   │   └── WebScraperServiceImpl.java
│   │   │   │   ├── model/
│   │   │   │   │   ├── entity/
│   │   │   │   │   │   └── SummaryRecord.java
│   │   │   │   │   ├── dto/
│   │   │   │   │   │   ├── TextSummaryRequest.java
│   │   │   │   │   │   ├── UrlSummaryRequest.java
│   │   │   │   │   │   ├── SummaryResponse.java
│   │   │   │   │   │   └── HistoryResponse.java
│   │   │   │   │   └── enums/
│   │   │   │   │       ├── SourceType.java
│   │   │   │   │       └── SummaryLength.java
│   │   │   │   ├── repository/
│   │   │   │   │   └── SummaryRepository.java
│   │   │   │   ├── config/
│   │   │   │   │   ├── WebConfig.java
│   │   │   │   │   ├── DatabaseConfig.java
│   │   │   │   │   ├── GroqConfig.java
│   │   │   │   │   └── SwaggerConfig.java
│   │   │   │   ├── exception/
│   │   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   │   ├── FileProcessingException.java
│   │   │   │   │   └── ApiException.java
│   │   │   │   └── SummaryApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       ├── application-dev.yml
│   │   │       ├── application-prod.yml
│   │   │       └── db/
│   │   │           └── migration/
│   │   │               └── V1__init_schema.sql
│   │   └── test/
│   │       └── java/com/aipoint/summary/
│   │           ├── controller/
│   │           │   └── SummaryControllerTest.java
│   │           ├── service/
│   │           │   ├── SummaryServiceTest.java
│   │           │   └── GroqApiServiceTest.java
│   │           └── SummaryApplicationTests.java
│   ├── .env.example
│   ├── .gitignore
│   ├── pom.xml
│   └── README.md
│
├── docs/                              # 專案文檔
│   ├── api/
│   │   └── api-specification.md       # API 規格文檔
│   ├── database/
│   │   ├── schema.sql                 # 資料庫 Schema
│   │   └── er-diagram.md              # ER 圖
│   ├── deployment/
│   │   ├── docker-guide.md            # Docker 部署指南
│   │   └── local-setup.md             # 本地環境設定
│   └── development/
│       ├── coding-standards.md        # 編碼規範
│       └── git-workflow.md            # Git 工作流程
│
├── plans/                             # 架構規劃文檔
│   ├── architecture.md                # 系統架構文檔
│   └── project-structure.md           # 專案結構說明
│
├── scripts/                           # 腳本工具
│   ├── setup-dev.sh                   # 開發環境設定腳本
│   ├── start-services.sh              # 啟動所有服務
│   └── init-db.sql                    # 資料庫初始化腳本
│
├── docker-compose.yml                 # Docker Compose 配置
├── .gitignore                         # Git 忽略文件
└── README.md                          # 專案主要說明文檔
```

## 目錄說明

### 前端目錄 (frontend/)

#### `/src/components/`
存放所有可重用的 React 組件，按功能分類：
- **Layout**: 頁面佈局相關組件
- **Summary**: 摘要功能相關組件
- **History**: 歷史記錄相關組件
- **Common**: 通用 UI 組件

#### `/src/pages/`
存放頁面級別的組件，每個文件對應一個路由

#### `/src/services/`
封裝所有 API 呼叫邏輯，與後端通訊

#### `/src/hooks/`
自定義 React Hooks，封裝可重用的狀態邏輯

#### `/src/context/`
React Context API，用於全域狀態管理

#### `/src/utils/`
工具函數、常數定義、驗證器等

### 後端目錄 (backend/)

#### `/controller/`
REST API 控制器，處理 HTTP 請求

#### `/service/`
業務邏輯層，包含介面和實作類

#### `/model/`
資料模型，包含：
- **entity**: JPA 實體類
- **dto**: 資料傳輸物件
- **enums**: 枚舉類型

#### `/repository/`
資料存取層，使用 Spring Data JPA

#### `/config/`
應用配置類，包含 Web、資料庫、第三方服務配置

#### `/exception/`
異常處理類，統一錯誤處理

#### `/resources/`
配置文件和資料庫遷移腳本

### 文檔目錄 (docs/)

#### `/api/`
API 規格文檔，詳細說明所有端點

#### `/database/`
資料庫相關文檔，包含 Schema 和 ER 圖

#### `/deployment/`
部署相關指南

#### `/development/`
開發規範和流程文檔

### 腳本目錄 (scripts/)
存放自動化腳本，簡化開發流程

## 檔案命名規範

### 前端
- **組件**: PascalCase (例如: `TextInput.jsx`)
- **工具函數**: camelCase (例如: `helpers.js`)
- **常數**: UPPER_SNAKE_CASE (例如: `API_BASE_URL`)

### 後端
- **類別**: PascalCase (例如: `SummaryController.java`)
- **方法**: camelCase (例如: `generateSummary()`)
- **常數**: UPPER_SNAKE_CASE (例如: `MAX_FILE_SIZE`)

## Git 分支策略

```
main                    # 主分支，穩定版本
├── develop             # 開發分支
│   ├── feature/xxx     # 功能分支
│   ├── bugfix/xxx      # 錯誤修復分支
│   └── hotfix/xxx      # 緊急修復分支
```

## 環境變數管理

### 前端 (.env)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=AI 內容摘要工具
```

### 後端 (application.yml)
```yaml
groq:
  api-key: ${GROQ_API_KEY}
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

## 開發工作流程

1. **初始化專案**: 執行 `scripts/setup-dev.sh`
2. **啟動資料庫**: `docker-compose up mysql -d`
3. **啟動後端**: `cd backend && mvn spring-boot:run`
4. **啟動前端**: `cd frontend && npm run dev`
5. **開發功能**: 在 `feature/` 分支開發
6. **提交代碼**: 遵循 Conventional Commits 規範
7. **合併代碼**: 通過 Pull Request 合併到 `develop`

## 測試目錄結構

### 前端測試
```
frontend/src/
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── setupTests.js
```

### 後端測試
```
backend/src/test/java/
└── com/aipoint/summary/
    ├── controller/
    ├── service/
    └── integration/
```

## 建置輸出

### 前端建置
```
frontend/dist/          # Vite 建置輸出
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── index.html
```

### 後端建置
```
backend/target/
└── summary-0.0.1-SNAPSHOT.jar
```

## 依賴管理

### 前端主要依賴
- react: ^18.2.0
- react-router-dom: ^6.20.0
- axios: ^1.6.0
- antd / @mui/material: ^5.14.0

### 後端主要依賴
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- mysql-connector-java
- lombok
- springdoc-openapi-starter-webmvc-ui
- apache-poi (Word 處理)
- pdfbox (PDF 處理)
- jsoup (網頁爬取)

## 日誌管理

### 前端日誌
使用瀏覽器 Console，開發環境顯示詳細日誌

### 後端日誌
```
backend/logs/
├── application.log     # 應用日誌
├── error.log          # 錯誤日誌
└── access.log         # 訪問日誌
```

## 資料備份

### 資料庫備份
```bash
# 備份
mysqldump -u root -p ai_summary > backup.sql

# 還原
mysql -u root -p ai_summary < backup.sql
```

## 效能監控

### 前端
- 使用 React DevTools
- Lighthouse 效能評分

### 後端
- Spring Boot Actuator
- 資料庫查詢效能監控

---

**文檔版本**: 1.0  
**最後更新**: 2025-12-21
