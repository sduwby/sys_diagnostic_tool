# 系统诊断工具 / AWDMS

[简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [English](./README.md) | [Русский](./README.ru.md) | [Français](./README.fr.md)

一个模拟敏捷开发工作流的专业打字练习工具。  
集成 **AWDMS (Agile Workflow & Dependency Management System)** 模拟真实开发环境。  
支持 Windows、macOS 和 Linux 平台打包。

## ✨ 核心特性

### 🎮 游戏模式
- **普通模式** - 经典节奏游戏
- **限时模式** - 60秒速战速决，2倍速度
- **生存模式** - 5次Miss即失败，极限挑战
- **禅意模式** - 无压力练习，速度可调(1.0x-5.0x)

### 🎯 游戏机制
- 多语言代码片段（JS、C++、Java、Go、Python + 自定义）
- 等级系统 + 全球排行榜
- 连击系统（3/5/10/20/50/100连击特效）
- 成就系统（18层认证）

### 🔊 音效系统
- 15种程序化音效（点击/连击/Miss/升级/成就等）
- 音量控制 + 一键静音
- 音效设置持久化

### 🎨 主题系统
- 6个预设主题（VS Code Dark、GitHub、Monokai、Dracula、Nord、Solarized）
- 自定义主题编辑器（4色调自由搭配）
- CSS 变量支持

### 📋 AWDMS 系统（Project "Moyu"）
- **每日任务**：4级工单（Junior → Principal）
- **道具系统**：6个核心依赖包（Stable → Legacy）
- **Gacha编译**：源码包编译抽卡（2%-100%成功率 + 保底）
- **$COMMITS** 算力积分系统
- **专业伪装UI**（TODO.md / package.json / AWS控制台风格）

### 🔐 安全特性
- AES-256-GCM + HMAC-SHA256 加密
- 本地数据存储无云同步
- Boss键快速切换（`ESC`）

## 项目结构（模块化 + 100% TypeScript）

```text
sys_diagnostic_tool/
├── package.json          # 项目配置
├── main.ts               # Electron 主进程
├── src/
│   ├── index.html        # 主界面
│   ├── app.ts            # 核心游戏逻辑 (490行)
│   ├── app.css           # CSS 变量样式系统
│   ├── storage.ts        # AES-256-GCM 加密持久化
│   ├── achievements.ts   # 18层成就定义
│   ├── achievementTracker.ts  # 成就追踪引擎 (194行)
│   ├── achievementUI.ts  # 成就面板渲染
│   ├── analytics.ts      # Canvas 图表统计
│   ├── soundEffects.ts   # Web Audio API 音效引擎 (187行)
│   ├── combo.ts          # 连击系统
│   ├── gameState.ts      # 进度保存/恢复
│   ├── practiceMode.ts   # 练习模式
│   ├── challengeModes.ts # 挑战模式系统 (374行)
│   ├── gameConfig.ts     # 游戏配置 (35行)
│   ├── cheats.ts         # 作弊系统 (106行)
│   ├── leaderboard.ts    # 排行榜系统 (93行)
│   ├── terminal.ts       # 终端系统 (128行)
│   ├── uiHandlers.ts     # UI事件处理 (145行)
│   ├── themeSystem.ts    # 主题系统 (320行)
│   ├── dailyTasks.ts     # AWDMS 每日任务 (240行)
│   ├── itemSystem.ts     # AWDMS 道具系统 (259行)
│   ├── gachaSystem.ts    # AWDMS 编译/抽卡 (219行)
│   ├── awdmsUI.ts        # AWDMS 专业UI (428行)
│   ├── itemEffects.ts    # AWDMS 道具效果 (119行)
│   └── icon.svg          # 应用图标
└── dist/                 # TypeScript 编译输出
```

## 安装

确保已安装 `Node.js`（推荐 `v16+`），然后运行：

```bash
npm install
```

## 开发

以开发模式启动应用：

```bash
npm start
```

## 构建可执行文件

### 单平台构建（默认架构）

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

### 特定架构构建

**Windows**
```bash
npm run build:win:x64      # 64位 Intel/AMD
npm run build:win:ia32     # 32位 Intel/AMD
npm run build:win:arm64    # ARM64 (Windows on ARM)
```

**macOS**
```bash
npm run build:mac:x64        # Intel 芯片
npm run build:mac:arm64      # Apple Silicon (M1/M2)
npm run build:mac:universal  # 通用构建（双架构）
```

**Linux**
```bash
npm run build:linux:x64    # x64
npm run build:linux:arm64  # ARM64 (树莓派等)
```

### 构建所有平台

```bash
npm run build
```

## 构建说明

- 首次构建会下载 Electron 二进制文件（需要网络连接）
- 构建的应用程序是独立的，目标机器上无需安装 Node.js
- **Windows**：NSIS 安装程序，支持自定义路径和快捷方式
- **macOS**：DMG 输出，兼容 Intel / Apple Silicon
- **Linux**：提供 AppImage 和 deb 包

## 使用方法

1. 点击下落的代码片段得分
2. 不同语言有不同的分数和速度，需要专注和快速反应
3. 鼠标悬停可暂停片段以便策略性时机选择
4. 按 `ESC` 激活快速最小化模式
5. 完成后提交分数以追踪进度

## 技术栈

- **Electron** - 跨平台桌面应用
- **TypeScript** - 100% 类型安全
- **Web Audio API** - 程序化音效生成
- **CSS 变量** - 动态主题系统
- **localStorage** - 本地数据持久化
- **electron-builder** - 打包构建

## 说明

- 排行榜数据存储在加密文件 `~/.sys_diagnostic_data`
- 数据受 AES-256-GCM + HMAC-SHA256 加密保护
- 自定义代码片段和成就也加密存储在本地
- 建议先在本地测试后再分发
- 使用 `src/icon.svg` 进行跨平台图标生成

## 提示

本项目代码完全由 AI 工具生成。  
如有 Bug，别怪我 😁  
欢迎提供建议和反馈！

## 许可证

MIT
