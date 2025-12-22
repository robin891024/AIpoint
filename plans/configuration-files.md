# 配置文件規劃

本文檔包含專案所需的所有配置文件內容，在實作階段需要建立這些文件。

## 1. Docker Compose 配置

**檔案路徑**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # MySQL 資料庫
  mysql:
    image: mysql:8.0
    container_name: ai-summary-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD:-root123}
      MYSQL_DATABASE: ai_summary
      MYSQL_USER: ${DB_USERNAME:-aiuser}
      MYSQL_PASSWORD: ${DB_PASSWORD:-aipass123}
      TZ: Asia/Taipei
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    networks:
      - ai-summary-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p${DB_ROOT_PASSWORD:-root123}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Spring Boot 後端
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ai-summary-backend
    restart: unless-stopped
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILE:-dev}
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ai_summary?useSSL=false&serverTimezone=Asia/Taipei&characterEncoding=utf8
      SPRING_DATASOURCE_USERNAME: ${DB_USERNAME:-aiuser}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD:-aipass123}
      GROQ_API_KEY: ${GROQ_API_KEY}
      SERVER_PORT: 8080
      TZ: Asia/Taipei
    ports:
      - "8080:8080"
    depends_on:
      mysql:
        condition: service_healthy
    networks:
      - ai-summary-network
    volumes:
      - backend_logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # React + Vite 前端
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_BASE_URL: ${VITE_API_BASE_URL:-http://localhost:8080/api}
    container_name: ai-summary-frontend
    restart: unless-stopped
    environment:
      TZ: Asia/Taipei
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - ai-summary-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mysql_data:
    driver: local
  backend_logs:
    driver: local

networks:
  ai-summary-network:
    driver: bridge
```

## 2. 資料庫初始化腳本

**檔案路徑**: `scripts/init-db.sql`

```sql
-- 建立資料庫（如果不存在）
CREATE DATABASE IF NOT EXISTS ai_summary 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE ai_summary;

-- 摘要記錄表
CREATE TABLE IF NOT EXISTS summary_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_source_type (source_type),
    INDEX idx_created_at (created_at),
    INDEX idx_summary_length (summary_length)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 使用者表（可選，未來擴展用）
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入測試資料（開發環境）
INSERT INTO summary_records (source_type, source_content, summary_text, summary_length, tokens_used) 
VALUES 
('TEXT', '這是一段測試文字內容，用於驗證系統功能是否正常運作。', '測試摘要內容', 'SHORT', 50),
('URL', NULL, '網頁摘要測試', 'MEDIUM', 100);
```

## 3. 後端配置文件

### 3.1 主配置文件

**檔案路徑**: `backend/src/main/resources/application.yml`

```yaml
spring:
  application:
    name: ai-summary-service
  
  # 資料庫配置
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/ai_summary?useSSL=false&serverTimezone=Asia/Taipei&characterEncoding=utf8}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:root123}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
  
  # JPA 配置
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
        use_sql_comments: true
    open-in-view: false
  
  # 文件上傳配置
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB
      file-size-threshold: 2KB
  
  # Jackson 配置
  jackson:
    time-zone: Asia/Taipei
    date-format: yyyy-MM-dd HH:mm:ss
    default-property-inclusion: non_null

# 伺服器配置
server:
  port: ${SERVER_PORT:8080}
  compression:
    enabled: true
  error:
    include-message: always
    include-binding-errors: always

# Groq API 配置
groq:
  api-key: ${GROQ_API_KEY}
  base-url: https://api.groq.com/openai/v1
  model: mixtral-8x7b-32768
  max-tokens:
    short: 150
    medium: 300
    long: 500
  temperature: 0.7
  timeout: 30000

# 文件處理配置
file:
  upload-dir: ${user.home}/ai-summary/uploads
  max-size: 10485760  # 10MB in bytes
  allowed-extensions: pdf,doc,docx

# 網頁爬取配置
web-scraper:
  timeout: 10000
  user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
  max-content-length: 50000

# 日誌配置
logging:
  level:
    root: INFO
    com.aipoint.summary: DEBUG
    org.springframework.web: INFO
    org.hibernate.SQL: DEBUG
  file:
    name: logs/application.log
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"

# Actuator 配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized

# SpringDoc OpenAPI 配置
springdoc:
  api-docs:
    path: /v3/api-docs
  swagger-ui:
    path: /swagger-ui.html
    tags-sorter: alpha
    operations-sorter: alpha
```

### 3.2 開發環境配置

**檔案路徑**: `backend/src/main/resources/application-dev.yml`

```yaml
spring:
  jpa:
    show-sql: true
    hibernate:
      ddl-auto: update
  
  devtools:
    restart:
      enabled: true
    livereload:
      enabled: true

logging:
  level:
    root: DEBUG
    com.aipoint.summary: DEBUG
    org.springframework.web: DEBUG
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE

groq:
  timeout: 60000  # 開發環境延長超時時間
```

### 3.3 生產環境配置

**檔案路徑**: `backend/src/main/resources/application-prod.yml`

```yaml
spring:
  jpa:
    show-sql: false
    hibernate:
      ddl-auto: validate
  
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 10

logging:
  level:
    root: WARN
    com.aipoint.summary: INFO
    org.springframework.web: WARN

server:
  compression:
    enabled: true
    mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json
```

### 3.4 後端環境變數範例

**檔案路徑**: `backend/.env.example`

```env
# Groq API 配置
GROQ_API_KEY=your_groq_api_key_here

# 資料庫配置
DB_URL=jdbc:mysql://localhost:3306/ai_summary
DB_USERNAME=root
DB_PASSWORD=your_password

# 伺服器配置
SERVER_PORT=8080
SPRING_PROFILE=dev

# 文件上傳配置
FILE_UPLOAD_DIR=/path/to/upload/directory
MAX_FILE_SIZE=10485760
```

## 4. 前端配置文件

### 4.1 Vite 配置

**檔案路徑**: `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['antd'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
```

### 4.2 前端環境變數範例

**檔案路徑**: `frontend/.env.example`

```env
# API 基礎 URL
VITE_API_BASE_URL=http://localhost:8080/api

# 應用配置
VITE_APP_TITLE=AI 內容摘要工具
VITE_APP_VERSION=1.0.0

# 功能開關
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_HISTORY=true

# 文件上傳限制
VITE_MAX_FILE_SIZE=10485760
VITE_ALLOWED_FILE_TYPES=.pdf,.doc,.docx
```

### 4.3 開發環境變數

**檔案路徑**: `frontend/.env.development`

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=AI 內容摘要工具 (開發)
VITE_ENABLE_DEBUG=true
```

### 4.4 生產環境變數

**檔案路徑**: `frontend/.env.production`

```env
VITE_API_BASE_URL=/api
VITE_APP_TITLE=AI 內容摘要工具
VITE_ENABLE_DEBUG=false
```

### 4.5 Package.json

**檔案路徑**: `frontend/package.json`

```json
{
  "name": "ai-summary-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.0",
    "antd": "^5.12.0",
    "@ant-design/icons": "^5.2.6",
    "zustand": "^4.4.7",
    "dayjs": "^1.11.10"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "eslint": "^8.55.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "vitest": "^1.0.4",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5"
  }
}
```

## 5. 後端 Maven 配置

**檔案路徑**: `backend/pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
    </parent>
    
    <groupId>com.aipoint</groupId>
    <artifactId>summary</artifactId>
    <version>1.0.0</version>
    <name>AI Summary Service</name>
    <description>AI Content Summary Tool Backend</description>
    
    <properties>
        <java.version>17</java.version>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>
        
        <!-- MySQL Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- SpringDoc OpenAPI (Swagger) -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>
        
        <!-- Apache POI for Word processing -->
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi</artifactId>
            <version>5.2.5</version>
        </dependency>
        
        <dependency>
            <groupId>org.apache.poi</groupId>
            <artifactId>poi-ooxml</artifactId>
            <version>5.2.5</version>
        </dependency>
        
        <!-- Apache PDFBox for PDF processing -->
        <dependency>
            <groupId>org.apache.pdfbox</groupId>
            <artifactId>pdfbox</artifactId>
            <version>3.0.1</version>
        </dependency>
        
        <!-- Jsoup for web scraping -->
        <dependency>
            <groupId>org.jsoup</groupId>
            <artifactId>jsoup</artifactId>
            <version>1.17.1</version>
        </dependency>
        
        <!-- HTTP Client for Groq API -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>
        
        <!-- Test Dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## 6. Dockerfile 配置

### 6.1 後端 Dockerfile

**檔案路徑**: `backend/Dockerfile`

```dockerfile
# 多階段建置
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# 複製 pom.xml 並下載依賴
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 複製源碼並建置
COPY src ./src
RUN mvn clean package -DskipTests

# 運行階段
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 建立非 root 使用者
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 複製建置產物
COPY --from=build /app/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# 啟動應用
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### 6.2 前端 Dockerfile

**檔案路徑**: `frontend/Dockerfile`

```dockerfile
# 建置階段
FROM node:18-alpine AS build
WORKDIR /app

# 複製 package.json 並安裝依賴
COPY package*.json ./
RUN npm ci

# 複製源碼並建置
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# 運行階段
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 移除預設 nginx 靜態資源
RUN rm -rf ./*

# 複製建置產物
COPY --from=build /app/dist .

# 複製 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 6.3 Nginx 配置

**檔案路徑**: `frontend/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip 壓縮
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml+rss 
               application/javascript application/json;

    # SPA 路由支援
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://backend:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 快取靜態資源
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全標頭
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 7. Git 配置

### 7.1 根目錄 .gitignore

**檔案路徑**: `.gitignore`

```gitignore
# 環境變數
.env
.env.local
.env.*.local

# 日誌
logs/
*.log

# 作業系統
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo
*~

# 臨時文件
tmp/
temp/
```

### 7.2 前端 .gitignore

**檔案路徑**: `frontend/.gitignore`

```gitignore
# 依賴
node_modules/
package-lock.json
yarn.lock

# 建置輸出
dist/
build/

# 環境變數
.env
.env.local
.env.*.local

# 日誌
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# 測試覆蓋率
coverage/
```

### 7.3 後端 .gitignore

**檔案路徑**: `backend/.gitignore`

```gitignore
# Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
pom.xml.next
release.properties

# Eclipse
.classpath
.project
.settings/

# IntelliJ IDEA
.idea/
*.iml
*.iws
*.ipr

# 環境變數
.env

# 日誌
logs/
*.log

# 上傳文件
uploads/
```

## 8. 啟動腳本

### 8.1 開發環境啟動腳本 (Windows)

**檔案路徑**: `scripts/start-dev.bat`

```batch
@echo off
echo Starting AI Summary Tool Development Environment...

echo.
echo [1/4] Starting MySQL...
docker-compose up -d mysql
timeout /t 10

echo.
echo [2/4] Starting Backend...
start cmd /k "cd backend && mvn spring-boot:run"
timeout /t 20

echo.
echo [3/4] Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo [4/4] All services started!
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8080
echo Swagger: http://localhost:8080/swagger-ui.html
echo.
pause
```

### 8.2 開發環境啟動腳本 (Linux/Mac)

**檔案路徑**: `scripts/start-dev.sh`

```bash
#!/bin/bash

echo "Starting AI Summary Tool Development Environment..."

echo ""
echo "[1/4] Starting MySQL..."
docker-compose up -d mysql
sleep 10

echo ""
echo "[2/4] Starting Backend..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..
sleep 20

echo ""
echo "[3/4] Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "[4/4] All services started!"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8080"
echo "Swagger: http://localhost:8080/swagger-ui.html"
echo ""
echo "Press Ctrl+C to stop all services"

# 等待中斷信號
trap "kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
```

## 9. 環境變數範本

**檔案路徑**: `.env.example`

```env
# 資料庫配置
DB_ROOT_PASSWORD=root123
DB_USERNAME=aiuser
DB_PASSWORD=aipass123
DB_URL=jdbc:mysql://localhost:3306/ai_summary

# Groq API
GROQ_API_KEY=your_groq_api_key_here

# 後端配置
SERVER_PORT=8080
SPRING_PROFILE=dev

# 前端配置
VITE_API_BASE_URL=http://localhost:8080/api

# Docker 配置
COMPOSE_PROJECT_NAME=ai-summary
```

---

**說明**: 以上所有配置文件需要在實作階段由 Code 模式建立。這些配置已經過優化，適合開發和生產環境使用。
