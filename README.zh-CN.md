# 系统诊断工具

[简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [English](./README.md) | [Русский](./README.ru.md) | [Français](./README.fr.md)

一个专业的打字准确率分析器和性能诊断应用程序。  
支持 Windows、macOS 和 Linux 平台打包。

## 特性

- 🎮 多语言代码片段练习（JS、C++、Java、Go、Python）
- 🎯 等级系统 + 分数排行榜追踪打字熟练度
- 🔐 本地加密数据存储保护隐私
- 🎭 快速最小化功能（`ESC` 键即时切换窗口）

## 项目结构

```text
sys_diagnostic_tool/
├── package.json          # 项目配置
├── main.js               # Electron 主进程
├── src/
│   ├── index.html        # 主界面
│   ├── app.js            # 核心游戏逻辑 (911行)
│   ├── app.css           # 样式
│   ├── storage.js        # AES-256-GCM 加密与数据持久化
│   ├── achievements.js   # 18层成就定义
│   ├── analytics.js      # Canvas 图表与统计分析
│   ├── achievementUI.js  # 成就面板渲染
│   └── icon.svg          # 应用图标（跨平台）
└── dist/                 # 构建输出（自动生成）
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

- Electron
- Vanilla JavaScript
- HTML5 / CSS3
- electron-builder

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
