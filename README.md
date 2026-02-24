# System Diagnostic Tool

> 表面上：系统诊断工具  
> 实际上：高端摸鱼模拟器

一个披着“我在认真排查线上问题”外衣的点击小游戏。  
支持打包成 Windows、macOS、Linux 可执行文件，工位、家里、咖啡店三端摸鱼无缝衔接。

## 功能特性

- 🎮 多语言代码雨（JS、C++、Java、Go、Python）
- 🎯 等级系统 + 分数排行榜，卷王可以卷到本地第一
- 🔐 本地加密存储记录，摸鱼也要讲究基本安全感
- 🎭 Boss Key（`ESC` 一键切回“我在工作”界面）

## 项目结构

```text
moyu/
├── package.json          # 项目配置
├── main.js               # Electron 主进程
├── src/
│   ├── index.html        # 主页面
│   ├── moyu.js           # 游戏逻辑
│   ├── moyu.css          # 样式
│   ├── Compiler.html     # 代码加密工具
│   └── Loader.html       # 加密代码加载器
└── dist/                 # 打包产物（自动生成）
```

## 安装依赖

先确认你有 `Node.js`（建议 `v16+`），然后：

```bash
npm install
```

## 开发运行

本地启动，进入摸鱼调试模式：

```bash
npm start
```

## 打包成可执行文件

### 单平台打包（默认架构）

**Windows（x64）**
```bash
npm run build:win
```

**macOS（x64 + arm64）**
```bash
npm run build:mac
```

**Linux（x64）**
```bash
npm run build:linux
```

### 指定架构打包

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
npm run build:mac:universal  # 通用版（双架构）
```

**Linux**
```bash
npm run build:linux:x64    # x64
npm run build:linux:arm64  # ARM64（树莓派等）
```

### 全平台一把梭

```bash
npm run build
```

## 打包说明

- 首次打包会下载 Electron 二进制，速度取决于你的网络和玄学
- 打包后是独立应用，不需要目标机器再装 Node.js
- **Windows**：NSIS 安装包，支持自定义路径和快捷方式
- **macOS**：输出 DMG，兼容 Intel / Apple Silicon
- **Linux**：提供 AppImage 和 deb

## 游戏玩法

1. 点击下落的代码片段得分
2. 不同语言分值和速度不同，眼神与手速缺一不可
3. 鼠标悬停可暂停片段，属于正经“战术停顿”
4. 按 `ESC` 启用伪装界面，遇到老板时建议肌肉记忆
5. 结束后可提交成绩，争当工区摸鱼榜一

## 技术栈

- Electron
- Vanilla JavaScript
- HTML5 / CSS3
- electron-builder

## 注意事项

- 排行榜存储在本地 `localStorage`
- 数据做了简单加密（防君子不防同事）
- 建议打包前先本地跑一遍，避免把 bug 一起发给朋友

## Tips

本项目代码完全由 AI 工具生成。  
如果有bug，不要怪我，嘿嘿😁（手动狗头）。

## License

MIT
