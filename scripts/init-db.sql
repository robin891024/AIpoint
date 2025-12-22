-- AI 內容摘要工具 - 資料庫初始化腳本
-- 建立日期: 2025-12-21

-- 建立資料庫（如果不存在）
CREATE DATABASE IF NOT EXISTS ai_summary 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ai_summary;

-- 摘要記錄表
CREATE TABLE IF NOT EXISTS summary_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主鍵ID',
    source_type VARCHAR(20) NOT NULL COMMENT '來源類型: TEXT, FILE, URL',
    source_content TEXT COMMENT '原始內容',
    source_url VARCHAR(500) COMMENT '網址來源',
    file_name VARCHAR(255) COMMENT '文件名稱',
    file_path VARCHAR(500) COMMENT '文件儲存路徑',
    summary_text TEXT NOT NULL COMMENT '摘要內容',
    summary_length VARCHAR(20) COMMENT '摘要長度: SHORT, MEDIUM, LONG',
    model_used VARCHAR(50) DEFAULT 'mixtral-8x7b-32768' COMMENT '使用的 Groq 模型',
    tokens_used INT COMMENT '使用的 token 數量',
    processing_time_ms INT COMMENT '處理時間（毫秒）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    INDEX idx_source_type (source_type),
    INDEX idx_created_at (created_at),
    INDEX idx_summary_length (summary_length)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='摘要記錄表';

-- 使用者表（可選，未來擴展用）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主鍵ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '使用者名稱',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT '電子郵件',
    password_hash VARCHAR(255) COMMENT '密碼雜湊',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用者表';

-- 插入測試資料（開發環境）
INSERT INTO summary_records (source_type, source_content, summary_text, summary_length, tokens_used, processing_time_ms) 
VALUES 
('TEXT', '人工智慧（Artificial Intelligence, AI）是電腦科學的一個分支，致力於創建能夠執行通常需要人類智慧的任務的系統。這些任務包括視覺感知、語音識別、決策制定和語言翻譯等。近年來，隨著深度學習和神經網路技術的發展，AI 在各個領域都取得了顯著的進展。', 
 'AI 是電腦科學分支，專注於創建智能系統，近年來在深度學習推動下取得重大進展。', 
 'SHORT', 50, 1200),
 
('TEXT', '機器學習是人工智慧的一個子領域，它使電腦系統能夠從經驗中學習並改進，而無需明確編程。機器學習演算法使用統計技術來讓電腦在數據中「學習」，即逐步改善特定任務的性能。常見的機器學習類型包括監督式學習、非監督式學習和強化學習。', 
 '機器學習是 AI 子領域，讓系統從數據中自動學習改進，主要包括監督式、非監督式和強化學習三種類型。', 
 'MEDIUM', 100, 1500),
 
('URL', NULL, '深度學習是機器學習的一個分支，使用多層神經網路來處理複雜的數據模式。它在圖像識別、自然語言處理等領域表現出色。', 
 'MEDIUM', 80, 2000);

-- 建立視圖：統計資訊
CREATE OR REPLACE VIEW summary_statistics AS
SELECT 
    source_type,
    COUNT(*) as total_count,
    AVG(tokens_used) as avg_tokens,
    AVG(processing_time_ms) as avg_processing_time,
    MAX(created_at) as last_created
FROM summary_records
GROUP BY source_type;

-- 顯示初始化完成訊息
SELECT '資料庫初始化完成！' as message;
SELECT COUNT(*) as total_records FROM summary_records;
