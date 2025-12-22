# AI 內容摘要工具

一個功能完整的 AI 內容摘要工具，支援文字輸入、文件上傳（PDF、Word）和網址爬取，使用 Groq API 生成智能摘要。

## 專案特色

✨ **多種輸入方式**
- 📝 直接輸入文字
- 📄 上傳 PDF、Word 文件
- 🌐 貼上網址自動爬取內容

🎯 **智能摘要**
- 使用 Groq API 生成高品質摘要
- 支援三種摘要長度（短、中、長）
- 繁體中文優化

💾 **歷史記錄**
- 自動儲存所有摘要記錄
- 支援篩選和搜尋
- 查看詳細資訊

🎨 **現代化介面**
- 響應式設計
- 深色/淺色主題
- 流暢的使用者體驗

## 技術棧

### 前端
- **React 18** - UI 框架
- **Vite** - 建置工具
- **Ant Design / Material-UI** - UI 組件庫
- **Axios** - HTTP 客戶端
- **React Router** - 路由管理

### 後端
- **Spring Boot 3.x** - 後端框架
- **Java 17+** - 程式語言
- **MySQL 8.0** - 資料庫
- **Spring Data JPA** - ORM
- **SpringDoc OpenAPI** - API 文檔

### 第三方服務
- **Groq API** - AI 摘要生成
- **Apache POI** - Word 文件處理
- **Apache PDFBox** - PDF 文件處理
- **Jsoup** - 網頁爬取

## 系統需求

- **Node.js**: >= 18.0.0
- **Java**: >= 17
- **MySQL**: >= 8.0
- **Maven**: >= 3.8.0
- **Docker** (可選): >= 20.10

## 快速開始

### 1. 克隆專案

```bash
git clone <repository-url>
cd AIpoint
```

### 2. 設定資料庫

#### 使用 Docker (推薦)

```bash
docker-compose up mysql -d
```

#### 手動安裝 MySQL

```bash
# 建立資料庫
mysql -u root -p
CREATE DATABASE ai_summary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

執行初始化腳本：

```bash
mysql -u root -p ai_summary < scripts/init-db.sql
```

### 3. 設定後端

```bash
cd backend

# 複製環境變數範例
cp .env.example .env

# 編輯 .env 文件，填入必要資訊
# GROQ_API_KEY=your_groq_api_key
# DB_URL=jdbc:mysql://localhost:3306/ai_summary
# DB_USERNAME=root
# DB_PASSWORD=your_password

# 安裝依賴並啟動
mvn clean install
mvn spring-boot:run
```

後端將在 `http://localhost:8080` 啟動

### 4. 設定前端

```bash
cd frontend

# 安裝依賴
npm install

# 複製環境變數範例
cp .env.example .env

# 編輯 .env 文件
# VITE_API_BASE_URL=http://localhost:8080/api

# 啟動開發伺服器
npm run dev
```

前端將在 `http://localhost:5173` 啟動

### 5. 訪問應用

開啟瀏覽器訪問 `http://localhost:5173`

## 環境變數配置

### 後端環境變數 (.env)

```env
# Groq API 配置
GROQ_API_KEY=your_groq_api_key_here

# 資料庫配置
DB_URL=jdbc:mysql://localhost:3306/ai_summary
DB_USERNAME=root
DB_PASSWORD=your_password

# 應用配置
SERVER_PORT=8080
MAX_FILE_SIZE=10MB
```

### 前端環境變數 (.env)

```env
# API 基礎 URL
VITE_API_BASE_URL=http://localhost:8080/api

# 應用標題
VITE_APP_TITLE=AI 內容摘要工具
```

## 專案結構

```
AIpoint/
├── frontend/          # React + Vite 前端
├── backend/           # Spring Boot 後端
├── docs/              # 專案文檔
├── plans/             # 架構規劃
├── scripts/           # 工具腳本
├── docker-compose.yml # Docker 配置
└── README.md          # 專案說明
```

詳細結構請參考 [`plans/project-structure.md`](plans/project-structure.md)

## API 文檔

啟動後端後，可以訪問以下 URL 查看 API 文檔：

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

## 主要功能

### 1. 文字摘要

直接在文字框中輸入或貼上內容，選擇摘要長度，點擊「生成摘要」按鈕。

### 2. 文件上傳

支援上傳 PDF 和 Word 文件（最大 10MB），系統會自動提取文字並生成摘要。

### 3. 網址摘要

貼上網址，系統會自動爬取網頁內容並生成摘要。

### 4. 歷史記錄

所有生成的摘要都會自動儲存，可以在歷史記錄頁面查看、搜尋和管理。

## 開發指南

### 前端開發

```bash
cd frontend

# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview

# 執行測試
npm run test

# 程式碼檢查
npm run lint
```

### 後端開發

```bash
cd backend

# 開發模式（熱重載）
mvn spring-boot:run

# 建置
mvn clean package

# 執行測試
mvn test

# 執行特定測試
mvn test -Dtest=SummaryServiceTest
```

### 資料庫遷移

使用 Flyway 進行資料庫版本控制：

```bash
# 執行遷移
mvn flyway:migrate

# 查看遷移狀態
mvn flyway:info

# 清理資料庫（開發環境）
mvn flyway:clean
```

## Docker 部署

### 使用 Docker Compose

```bash
# 啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down

# 重建並啟動
docker-compose up -d --build
```

### 單獨建置 Docker 映像

```bash
# 建置後端
cd backend
docker build -t ai-summary-backend .

# 建置前端
cd frontend
docker build -t ai-summary-frontend .
```

## 測試

### 前端測試

```bash
cd frontend

# 單元測試
npm run test

# 測試覆蓋率
npm run test:coverage

# E2E 測試
npm run test:e2e
```

### 後端測試

```bash
cd backend

# 執行所有測試
mvn test

# 整合測試
mvn verify

# 測試覆蓋率報告
mvn jacoco:report
```

## 效能優化

### 前端優化
- 程式碼分割（Code Splitting）
- 懶載入（Lazy Loading）
- 圖片優化
- 快取策略

### 後端優化
- 資料庫索引優化
- 查詢結果快取
- 非同步處理大文件
- 連接池配置

## 故障排除

### 常見問題

#### 1. 無法連接到資料庫

```bash
# 檢查 MySQL 是否運行
docker ps | grep mysql

# 檢查資料庫連接
mysql -h localhost -u root -p
```

#### 2. Groq API 錯誤

- 確認 API Key 是否正確
- 檢查 API 配額是否用完
- 查看後端日誌獲取詳細錯誤

#### 3. 文件上傳失敗

- 檢查文件大小是否超過限制（10MB）
- 確認文件格式是否支援（PDF、Word）
- 查看後端日誌獲取錯誤詳情

#### 4. 前端無法連接後端

- 確認後端是否正常運行
- 檢查 `.env` 中的 API URL 是否正確
- 檢查 CORS 配置

## 安全性

### 生產環境建議

1. **環境變數**: 使用環境變數管理敏感資訊
2. **HTTPS**: 啟用 SSL/TLS 加密
3. **輸入驗證**: 嚴格驗證所有使用者輸入
4. **檔案上傳**: 限制文件類型和大小
5. **API 限流**: 防止 API 濫用
6. **日誌監控**: 記錄和監控異常活動

## 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### 提交訊息規範

使用 Conventional Commits 規範：

```
feat: 新增功能
fix: 修復錯誤
docs: 文檔更新
style: 程式碼格式調整
refactor: 重構
test: 測試相關
chore: 建置或輔助工具變動
```

## 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 文件

## 聯絡方式

- **專案維護者**: [Your Name]
- **Email**: [your.email@example.com]
- **問題回報**: [GitHub Issues](https://github.com/yourusername/AIpoint/issues)

## 致謝

- [Groq](https://groq.com/) - 提供強大的 AI API
- [React](https://react.dev/) - 前端框架
- [Spring Boot](https://spring.io/projects/spring-boot) - 後端框架
- 所有貢獻者和開源社群

## 更新日誌

### v1.0.0 (2025-12-21)
- 🎉 初始版本發布
- ✨ 支援文字、文件、網址三種輸入方式
- 💾 歷史記錄管理功能
- 🎨 現代化使用者介面

---

**建置狀態**: ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)  
**版本**: 1.0.0  
**最後更新**: 2025-12-21
