# 系統診斷工具 / AWDMS

[简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [English](./README.md) | [Русский](./README.ru.md) | [Français](./README.fr.md)

一個模擬敏捷開發工作流的專業打字練習工具。  
集成 **AWDMS (Agile Workflow & Dependency Management System)** 模擬真實開發環境。  
支援 Windows、macOS 和 Linux 平台打包。

## ✨ 核心特性

### 🎮 遊戲模式
- **普通模式** - 經典節奏遊戲
- **限時模式** - 60秒速戰速決，2倍速度
- **生存模式** - 5次Miss即失敗，極限挑戰
- **禪意模式** - 無壓力練習，速度可調(1.0x-5.0x)

### 🎯 遊戲機制
- 多語言代碼片段（JS、C++、Java、Go、Python + 自訂）
- 等級系統 + 全球排行榜
- 連擊系統（3/5/10/20/50/100連擊特效）
- 成就系統（18層認證）

### 🔊 音效系統
- 15種程式化音效（點擊/連擊/Miss/升級/成就等）
- 音量控制 + 一鍵靜音
- 音效設定持久化

### 🎨 主題系統
- 6個預設主題（VS Code Dark、GitHub、Monokai、Dracula、Nord、Solarized）
- 自訂主題編輯器（4色調自由搭配）
- CSS 變數支援

### 📋 AWDMS 系統（Project "Moyu"）
- **每日任務**：4級工單（Junior → Principal）
- **道具系統**：6個核心依賴包（Stable → Legacy）
- **Gacha編譯**：原始碼包編譯抽卡（2%-100%成功率 + 保底）
- **$COMMITS** 算力積分系統
- **專業偽裝UI**（TODO.md / package.json / AWS控制台風格）

### 🔐 安全特性
- AES-256-GCM + HMAC-SHA256 加密
- 本地資料儲存無雲端同步
- Boss鍵快速切換（`ESC`）

## 專案結構（模組化 + 100% TypeScript）

```text
sys_diagnostic_tool/
├── package.json          # 專案配置
├── main.ts               # Electron 主處理程序
├── src/
│   ├── index.html        # 主介面
│   ├── app.ts            # 核心遊戲邏輯 (490行)
│   ├── app.css           # CSS 變數樣式系統
│   ├── storage.ts        # AES-256-GCM 加密持久化
│   ├── achievements.ts   # 18層成就定義
│   ├── achievementTracker.ts  # 成就追蹤引擎 (194行)
│   ├── achievementUI.ts  # 成就面板渲染
│   ├── analytics.ts      # Canvas 圖表統計
│   ├── soundEffects.ts   # Web Audio API 音效引擎 (187行)
│   ├── combo.ts          # 連擊系統
│   ├── gameState.ts      # 進度儲存/恢復
│   ├── practiceMode.ts   # 練習模式
│   ├── challengeModes.ts # 挑戰模式系統 (374行)
│   ├── gameConfig.ts     # 遊戲配置 (35行)
│   ├── cheats.ts         # 作弊系統 (106行)
│   ├── leaderboard.ts    # 排行榜系統 (93行)
│   ├── terminal.ts       # 終端系統 (128行)
│   ├── uiHandlers.ts     # UI事件處理 (145行)
│   ├── themeSystem.ts    # 主題系統 (320行)
│   ├── dailyTasks.ts     # AWDMS 每日任務 (240行)
│   ├── itemSystem.ts     # AWDMS 道具系統 (259行)
│   ├── gachaSystem.ts    # AWDMS 編譯/抽卡 (219行)
│   ├── awdmsUI.ts        # AWDMS 專業UI (428行)
│   ├── itemEffects.ts    # AWDMS 道具效果 (119行)
│   └── icon.svg          # 應用圖示
└── dist/                 # TypeScript 編譯輸出
```

## 安裝

確保已安裝 `Node.js`（推薦 `v16+`），然後執行：

```bash
npm install
```

## 開發

以開發模式啟動應用：

```bash
npm start
```

## 構建可執行檔

### 單平台構建（預設架構）

**Windows (x64)**
```bash
npm run build:win
```

**macOS (x64 + arm64)**
```bash
npm run build:mac
```

**Linux (x64)**
```bash
npm run build:linux
```

### 特定架構構建

**Windows**
```bash
npm run build:win:x64      # 64位元 Intel/AMD
npm run build:win:ia32     # 32位元 Intel/AMD
npm run build:win:arm64    # ARM64 (Windows on ARM)
```

**macOS**
```bash
npm run build:mac:x64        # Intel 晶片
npm run build:mac:arm64      # Apple Silicon (M1/M2)
npm run build:mac:universal  # 通用構建（雙架構）
```

**Linux**
```bash
npm run build:linux:x64    # x64
npm run build:linux:arm64  # ARM64 (樹莓派等)
```

### 構建所有平台

```bash
npm run build
```

## 構建說明

- 首次構建會下載 Electron 二進位檔案（需要網路連接）
- 構建的應用程式是獨立的，目標機器上無需安裝 Node.js
- **Windows**：NSIS 安裝程式，支援自訂路徑和快捷方式
- **macOS**：DMG 輸出，相容 Intel / Apple Silicon
- **Linux**：提供 AppImage 和 deb 套件

## 使用方法

1. 點擊下落的代碼片段得分
2. 不同語言有不同的分數和速度，需要專注和快速反應
3. 滑鼠懸停可暫停片段以便策略性時機選擇
4. 按 `ESC` 啟動快速最小化模式
5. 完成後提交分數以追蹤進度

## 技術棧

- **Electron** - 跨平台桌面應用
- **TypeScript** - 100% 型別安全
- **Web Audio API** - 程式化音效生成
- **CSS 變數** - 動態主題系統
- **localStorage** - 本地資料持久化
- **electron-builder** - 打包構建

## 說明

- 排行榜資料儲存在加密檔案 `~/.sys_diagnostic_data`
- 資料受 AES-256-GCM + HMAC-SHA256 加密保護
- 自訂代碼片段和成就也加密儲存在本地
- 建議先在本地測試後再分發
- 使用 `src/icon.svg` 進行跨平台圖示生成

## 提示

本專案代碼完全由 AI 工具生成。  
如有 Bug，別怪我 😁  
歡迎提供建議和反饋！

## 許可證

MIT
