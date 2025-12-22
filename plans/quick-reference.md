# 快速參考指南

本文檔提供 AI 內容摘要工具的快速參考資訊，方便開發過程中查閱。

## 專案資訊

- **專案名稱**: AI 內容摘要工具
- **技術棧**: React + Vite + Spring Boot + MySQL + Groq API
- **開發語言**: JavaScript (前端) + Java 17 (後端)
- **資料庫**: MySQL 8.0

## 快速命令

### 環境啟動

```bash
# 啟動 MySQL (Docker)
docker-compose up -d mysql

# 啟動後端
cd backend && mvn spring-boot:run

# 啟動前端
cd frontend && npm run dev

# 使用 Docker Compose 啟動所有服務
docker-compose up -d
```

### 開發命令

**後端**：
```bash
# 清理並建置
mvn clean install

# 執行測試
mvn test

# 跳過測試建置
mvn clean package -DskipTests

# 執行特定測試
mvn test -Dtest=SummaryServiceTest
```

**前端**：
```bash
# 安裝依賴
npm install

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

### 資料庫命令

```bash
# 連接資料庫
mysql -u root -p ai_summary

# 匯出資料庫
mysqldump -u root -p ai_summary > backup.sql

# 匯入資料庫
mysql -u root -p ai_summary < backup.sql

# 查看資料表
SHOW TABLES;

# 查看資料表結構
DESCRIBE summary_records;
```

## 重要端點

### 後端 API

| 端點 | 方法 | 說明 |
|------|------|------|
| `/api/summary/text` | POST | 文字摘要 |
| `/api/summary/file` | POST | 文件摘要 |
| `/api/summary/url` | POST | 網址摘要 |
| `/api/summary/history` | GET | 歷史記錄 |
| `/api/summary/{id}` | GET | 獲取單一記錄 |
| `/api/summary/{id}` | DELETE | 刪除記錄 |
| `/actuator/health` | GET | 健康檢查 |
| `/swagger-ui.html` | GET | API 文檔 |

### 前端路由

| 路由 | 組件 | 說明 |
|------|------|------|
| `/` | Home | 首頁/摘要生成 |
| `/summary` | SummaryPage | 摘要生成頁面 |
| `/history` | HistoryPage | 歷史記錄 |

## 環境變數

### 後端 (.env)

```env
GROQ_API_KEY=your_api_key
DB_URL=jdbc:mysql://localhost:3306/ai_summary
DB_USERNAME=root
DB_PASSWORD=your_password
SERVER_PORT=8080
```

### 前端 (.env)

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=AI 內容摘要工具
```

## 常用配置

### application.yml 關鍵配置

```yaml
# 資料庫連接
spring.datasource.url: jdbc:mysql://localhost:3306/ai_summary

# 文件上傳大小
spring.servlet.multipart.max-file-size: 10MB

# Groq API
groq.api-key: ${GROQ_API_KEY}
groq.model: mixtral-8x7b-32768
```

### vite.config.js 關鍵配置

```javascript
// API 代理
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

## 資料庫 Schema

### summary_records 表

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | BIGINT | 主鍵 |
| source_type | VARCHAR(20) | TEXT/FILE/URL |
| source_content | TEXT | 原始內容 |
| source_url | VARCHAR(500) | 網址 |
| file_name | VARCHAR(255) | 文件名稱 |
| summary_text | TEXT | 摘要內容 |
| summary_length | VARCHAR(20) | SHORT/MEDIUM/LONG |
| model_used | VARCHAR(50) | Groq 模型 |
| tokens_used | INT | Token 數量 |
| created_at | TIMESTAMP | 建立時間 |

## 常用 SQL 查詢

```sql
-- 查看所有摘要記錄
SELECT * FROM summary_records ORDER BY created_at DESC LIMIT 10;

-- 按來源類型統計
SELECT source_type, COUNT(*) as count 
FROM summary_records 
GROUP BY source_type;

-- 查看今天的記錄
SELECT * FROM summary_records 
WHERE DATE(created_at) = CURDATE();

-- 計算總 Token 使用量
SELECT SUM(tokens_used) as total_tokens 
FROM summary_records;

-- 刪除舊記錄（30天前）
DELETE FROM summary_records 
WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## API 請求範例

### 文字摘要

```bash
curl -X POST http://localhost:8080/api/summary/text \
  -H "Content-Type: application/json" \
  -d '{
    "content": "要摘要的文字內容",
    "summaryLength": "MEDIUM",
    "language": "zh-TW"
  }'
```

### 文件上傳

```bash
curl -X POST http://localhost:8080/api/summary/file \
  -F "file=@document.pdf" \
  -F "summaryLength=MEDIUM"
```

### 網址摘要

```bash
curl -X POST http://localhost:8080/api/summary/url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "summaryLength": "MEDIUM"
  }'
```

### 獲取歷史記錄

```bash
curl -X GET "http://localhost:8080/api/summary/history?page=0&size=10"
```

## 專案結構速查

```
AIpoint/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/  # 組件
│   │   ├── pages/       # 頁面
│   │   ├── services/    # API 服務
│   │   └── hooks/       # 自定義 Hooks
│   └── package.json
│
├── backend/           # Spring Boot 後端
│   ├── src/main/java/com/aipoint/summary/
│   │   ├── controller/  # 控制器
│   │   ├── service/     # 服務層
│   │   ├── model/       # 資料模型
│   │   └── repository/  # 資料存取
│   └── pom.xml
│
├── plans/             # 規劃文檔
└── docker-compose.yml # Docker 配置
```

## 依賴版本

### 後端主要依賴

```xml
<spring-boot.version>3.2.0</spring-boot.version>
<java.version>17</java.version>
<mysql-connector.version>8.0.33</mysql-connector.version>
<poi.version>5.2.5</poi.version>
<pdfbox.version>3.0.1</pdfbox.version>
<jsoup.version>1.17.1</jsoup.version>
```

### 前端主要依賴

```json
{
  "react": "^18.2.0",
  "vite": "^5.0.8",
  "axios": "^1.6.0",
  "antd": "^5.12.0",
  "react-router-dom": "^6.20.0"
}
```

## 常見錯誤處理

### 錯誤 1: 無法連接資料庫

**檢查**：
```bash
# 檢查 MySQL 是否運行
docker ps | grep mysql

# 測試連接
mysql -h localhost -u root -p
```

### 錯誤 2: Groq API 錯誤

**檢查**：
- 確認 API Key 是否正確
- 檢查 API 配額
- 查看後端日誌：`tail -f backend/logs/application.log`

### 錯誤 3: 前端無法連接後端

**檢查**：
```bash
# 檢查後端是否運行
curl http://localhost:8080/actuator/health

# 檢查 CORS 配置
# 查看瀏覽器 Console
```

### 錯誤 4: 文件上傳失敗

**檢查**：
- 文件大小是否超過 10MB
- 文件格式是否支援（PDF、Word）
- 查看後端錯誤日誌

## 測試資料

### 測試文字

```
人工智慧（Artificial Intelligence, AI）是電腦科學的一個分支，
致力於創建能夠執行通常需要人類智慧的任務的系統。這些任務包括
視覺感知、語音識別、決策制定和語言翻譯等。近年來，隨著深度學習
和神經網路技術的發展，AI 在各個領域都取得了顯著的進展。
```

### 測試 URL

```
https://zh.wikipedia.org/wiki/人工智慧
https://www.bbc.com/zhongwen/trad
```

## 效能指標

### 目標效能

| 指標 | 目標值 |
|------|--------|
| API 回應時間 | < 2 秒 |
| 文件處理時間 | < 5 秒 |
| 首頁載入時間 | < 3 秒 |
| 資料庫查詢 | < 100ms |

### 監控命令

```bash
# 查看 CPU 使用率
top

# 查看記憶體使用
free -h

# 查看磁碟空間
df -h

# 查看 Docker 容器狀態
docker stats
```

## 日誌位置

| 服務 | 日誌位置 |
|------|----------|
| 後端應用 | `backend/logs/application.log` |
| MySQL | Docker logs: `docker logs ai-summary-mysql` |
| 前端 | 瀏覽器 Console |

## 有用的連結

- **Groq API 文檔**: https://console.groq.com/docs
- **Spring Boot 文檔**: https://spring.io/projects/spring-boot
- **React 文檔**: https://react.dev/
- **Vite 文檔**: https://vitejs.dev/
- **Ant Design**: https://ant.design/
- **MySQL 文檔**: https://dev.mysql.com/doc/

## 開發工具推薦

### IDE
- **後端**: IntelliJ IDEA / Eclipse
- **前端**: VS Code
- **資料庫**: MySQL Workbench / DBeaver

### 瀏覽器擴充
- React Developer Tools
- Redux DevTools (如果使用 Redux)
- JSON Viewer

### API 測試
- Postman
- Swagger UI (內建)
- curl

## Git 提交規範

```bash
# 功能開發
git commit -m "feat: 新增文字摘要功能"

# 錯誤修復
git commit -m "fix: 修復文件上傳錯誤"

# 文檔更新
git commit -m "docs: 更新 API 文檔"

# 程式碼重構
git commit -m "refactor: 重構 Groq API 服務"

# 測試相關
git commit -m "test: 新增單元測試"
```

## 快速故障排除

### 問題：後端啟動失敗

```bash
# 1. 檢查 Java 版本
java -version  # 應該是 17+

# 2. 檢查 Maven
mvn -version

# 3. 清理並重新建置
mvn clean install

# 4. 查看詳細錯誤
mvn spring-boot:run -X
```

### 問題：前端啟動失敗

```bash
# 1. 檢查 Node 版本
node -v  # 應該是 18+

# 2. 清理並重新安裝
rm -rf node_modules package-lock.json
npm install

# 3. 清理快取
npm cache clean --force

# 4. 重新啟動
npm run dev
```

### 問題：Docker 容器無法啟動

```bash
# 1. 查看容器狀態
docker ps -a

# 2. 查看容器日誌
docker logs ai-summary-mysql
docker logs ai-summary-backend

# 3. 重新建置
docker-compose down
docker-compose up -d --build

# 4. 清理並重啟
docker-compose down -v
docker-compose up -d
```

## 備份與還原

### 資料庫備份

```bash
# 備份
docker exec ai-summary-mysql mysqldump -u root -proot123 ai_summary > backup_$(date +%Y%m%d).sql

# 還原
docker exec -i ai-summary-mysql mysql -u root -proot123 ai_summary < backup_20251221.sql
```

### 程式碼備份

```bash
# 建立 Git 標籤
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 匯出專案
git archive --format=zip --output=aipoint_backup.zip HEAD
```

## 聯絡資訊

- **技術支援**: 查看 GitHub Issues
- **文檔問題**: 提交 Pull Request
- **功能建議**: 建立 Feature Request

---

**提示**: 將此文檔加入書籤，開發過程中隨時查閱！

**最後更新**: 2025-12-21
