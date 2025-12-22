# 快速啟動指南

本指南將幫助你快速啟動 AI 內容摘要工具。

## 前置需求

✅ Java 17 或更高版本  
✅ Maven 3.8 或更高版本  
✅ Node.js 18 或更高版本  
✅ MySQL 8.0（已安裝並運行）  
✅ Groq API Key（已配置）

## 步驟 1: 建立資料庫

在你的 MySQL 中執行以下命令：

```sql
CREATE DATABASE ai_summary CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

或者直接執行初始化腳本：

```bash
mysql -u root -p < scripts/init-db.sql
```

輸入密碼：`root`

## 步驟 2: 驗證配置

確認以下配置文件已正確設定：

### 後端配置 (backend/.env)
```
GROQ_API_KEY=your_groq_api_key_here
DB_URL=jdbc:mysql://localhost:3306/aipoint?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Taipei&characterEncoding=UTF-8
DB_USERNAME=root
DB_PASSWORD=root
```

### 前端配置 (frontend/.env)
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## 步驟 3: 啟動後端

開啟終端機，執行：

```bash
cd backend
mvn spring-boot:run
```

等待後端啟動完成，你會看到類似以下訊息：
```
Started SummaryApplication in X.XXX seconds
```

後端將在 `http://localhost:8080` 運行

## 步驟 4: 啟動前端

開啟**新的**終端機，執行：

```bash
cd frontend
npm install
npm run dev
```

前端將在 `http://localhost:5173` 運行

## 步驟 5: 訪問應用

開啟瀏覽器訪問：

- **前端應用**: http://localhost:5173
- **API 文檔**: http://localhost:8080/swagger-ui.html
- **健康檢查**: http://localhost:8080/actuator/health

## 驗證安裝

### 1. 檢查後端

訪問 http://localhost:8080/actuator/health

應該看到：
```json
{
  "status": "UP"
}
```

### 2. 檢查資料庫連接

訪問 http://localhost:8080/swagger-ui.html

應該能看到完整的 API 文檔

### 3. 測試摘要功能

在前端應用中：
1. 輸入一段文字
2. 選擇摘要長度
3. 點擊「生成摘要」
4. 查看生成的摘要結果

## 常見問題

### 問題 1: 後端無法啟動 - 資料庫連接失敗

**解決方案**：
```bash
# 檢查 MySQL 是否運行
mysql -u root -p

# 確認資料庫存在
SHOW DATABASES;

# 確認 ai_summary 資料庫存在
USE ai_summary;
SHOW TABLES;
```

### 問題 2: 前端無法連接後端

**解決方案**：
1. 確認後端已啟動（http://localhost:8080/actuator/health）
2. 檢查 `frontend/.env` 中的 `VITE_API_BASE_URL`
3. 清除瀏覽器快取並重新載入

### 問題 3: Groq API 錯誤

**解決方案**：
1. 確認 API Key 是否正確
2. 檢查 API 配額是否用完
3. 查看後端日誌：`backend/logs/application.log`

### 問題 4: Maven 建置失敗

**解決方案**：
```bash
# 清理並重新建置
cd backend
mvn clean install -U

# 如果還是失敗，刪除本地倉庫快取
rm -rf ~/.m2/repository
mvn clean install
```

### 問題 5: npm 安裝失敗

**解決方案**：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 停止服務

### 停止後端
在後端終端機按 `Ctrl + C`

### 停止前端
在前端終端機按 `Ctrl + C`

## 重新啟動

如果需要重新啟動，只需重複步驟 3 和步驟 4。

## 開發模式特性

### 後端
- 自動重載（使用 Spring DevTools）
- 詳細的日誌輸出
- SQL 查詢顯示

### 前端
- 熱模組替換（HMR）
- 即時錯誤顯示
- React DevTools 支援

## 下一步

- 查看 [`README.md`](README.md) 了解完整功能
- 查看 [`plans/implementation-guide.md`](plans/implementation-guide.md) 了解開發指南
- 查看 [`plans/quick-reference.md`](plans/quick-reference.md) 了解常用命令

## 需要幫助？

- 查看 [`backend/README.md`](backend/README.md) - 後端詳細說明
- 查看 [`frontend/README.md`](frontend/README.md) - 前端詳細說明
- 查看 [`plans/architecture.md`](plans/architecture.md) - 系統架構

---

**提示**: 第一次啟動可能需要較長時間下載依賴，請耐心等待。
