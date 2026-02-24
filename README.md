# System Diagnostic Tool - 摸鱼打字游戏

一个伪装成系统诊断工具的打字游戏，支持打包成Windows、macOS、Linux可执行文件。

## 功能特性

- 🎮 多语言代码片段打字游戏（JS、C++、Java、Go、Python）
- 🎯 等级系统和分数排行榜
- 🔐 本地加密存储排行榜数据
- 🎭 Boss键（按ESC切换伪装界面）
- 🎁 隐藏作弊码：
  - `black sheep wall` - 2分钟无敌模式
  - `show me money` - 1分钟自动加分

## 项目结构

```
moyu/
├── package.json          # 项目配置文件
├── main.js              # Electron主进程
├── src/                 # 源文件目录
│   ├── index.html       # 主游戏页面
│   ├── moyu.js          # 游戏逻辑
│   ├── moyu.css         # 样式文件
│   ├── Compiler.html    # 代码加密工具
│   └── Loader.html      # 加密代码加载器
└── dist/                # 打包输出目录（自动生成）
```

## 安装依赖

首先确保已安装 Node.js（建议 v16 或更高版本），然后运行：

```bash
npm install
```

## 开发运行

在开发模式下运行应用：

```bash
npm start
```

## 打包成可执行文件

### 单平台打包（默认架构）

**Windows平台（x64）：**
```bash
npm run build:win
```

**macOS平台（x64 + arm64）：**
```bash
npm run build:mac
```

**Linux平台（x64）：**
```bash
npm run build:linux
```

### 指定架构打包

**Windows：**
```bash
npm run build:win:x64      # 64位 Intel/AMD
npm run build:win:ia32     # 32位 Intel/AMD
npm run build:win:arm64    # ARM64 (Windows on ARM)
```

**macOS：**
```bash
npm run build:mac:x64        # Intel芯片
npm run build:mac:arm64      # Apple Silicon (M1/M2)
npm run build:mac:universal  # 通用版本（同时支持Intel和Apple Silicon）
```

**Linux：**
```bash
npm run build:linux:x64    # x64架构
npm run build:linux:arm64  # ARM64架构（树莓派等）
```

### 多平台同时打包

打包所有平台的所有架构：

```bash
npm run build
```

## 打包说明

- 首次打包可能需要下载Electron二进制文件，请耐心等待
- 打包后的文件是完整的独立应用，无需额外安装依赖
- **Windows**：使用NSIS安装程序，支持自定义安装路径，自动创建快捷方式
- **macOS**：生成DMG镜像文件，支持Intel和Apple Silicon（M1/M2）芯片
- **Linux**：提供AppImage（通用）和deb（Debian系）两种格式

## 游戏玩法

1. 点击屏幕上下落的代码片段来获得分数
2. 不同语言的代码片段有不同的分值和速度
3. 鼠标悬停可以暂停代码片段的移动
4. 按ESC键可以切换到伪装界面（假装在工作）
5. 游戏结束后可以提交分数到排行榜

## 技术栈

- Electron - 桌面应用框架
- Vanilla JavaScript - 游戏逻辑
- HTML5/CSS3 - 界面设计
- electron-builder - 应用打包工具

## 注意事项

- 排行榜数据存储在本地localStorage中
- 数据经过简单加密处理
- 建议在打包前测试应用是否正常运行

## 许可证

MIT License
