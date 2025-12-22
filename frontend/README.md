# AI 內容摘要工具 - 前端

React + Vite 前端應用程式

## 技術棧

- **React 18** - UI 框架
- **Vite** - 建置工具
- **Ant Design** - UI 組件庫
- **Axios** - HTTP 客戶端
- **React Router** - 路由管理
- **Zustand** - 狀態管理

## 快速開始

### 安裝依賴

```bash
npm install
```

### 設定環境變數

```bash
cp .env.example .env
# 編輯 .env 文件，填入 API URL
```

### 開發模式

```bash
npm run dev
```

應用將在 `http://localhost:5173` 啟動

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 專案結構

```
src/
├── components/     # React 組件
│   ├── Layout/     # 佈局組件
│   ├── Summary/    # 摘要功能組件
│   ├── History/    # 歷史記錄組件
│   └── Common/     # 通用組件
├── pages/          # 頁面組件
├── services/       # API 服務
├── hooks/          # 自定義 Hooks
├── context/        # Context API
├── utils/          # 工具函數
└── assets/         # 靜態資源
```

## 可用腳本

- `npm run dev` - 啟動開發伺服器
- `npm run build` - 建置生產版本
- `npm run preview` - 預覽生產版本
- `npm run lint` - 執行 ESLint 檢查
- `npm run lint:fix` - 自動修復 ESLint 問題
- `npm run test` - 執行測試
- `npm run test:coverage` - 生成測試覆蓋率報告

## 環境變數

查看 [`.env.example`](.env.example) 了解所有可用的環境變數。

## 開發指南

### 組件開發

- 使用函數式組件和 Hooks
- 遵循單一職責原則
- 適當拆分組件
- 使用 PropTypes 或 TypeScript 進行類型檢查

### 樣式規範

- 使用 Ant Design 組件
- 自定義樣式使用 CSS Modules
- 遵循 BEM 命名規範

### API 呼叫

- 所有 API 呼叫統一在 `services/` 目錄
- 使用 Axios 攔截器處理錯誤
- 使用自定義 Hooks 封裝 API 邏輯

## 瀏覽器支援

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 授權

MIT
