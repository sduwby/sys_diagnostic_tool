# 快速开始指南

## 三步打包成可执行文件

### 1️⃣ 安装依赖

```bash
npm install
```

等待安装完成（首次可能需要5-10分钟）

### 2️⃣ 测试运行

```bash
npm start
```

确认游戏能正常运行

### 3️⃣ 打包

**快速打包（默认架构）：**
```bash
npm run build:win      # Windows (x64)
npm run build:mac      # macOS (x64 + arm64)
npm run build:linux    # Linux (x64)
```

**指定架构打包：**
```bash
# Windows
npm run build:win:x64      # 64位
npm run build:win:ia32     # 32位
npm run build:win:arm64    # ARM64

# macOS
npm run build:mac:x64        # Intel芯片
npm run build:mac:arm64      # Apple Silicon
npm run build:mac:universal  # 通用版本

# Linux
npm run build:linux:x64    # x64架构
npm run build:linux:arm64  # ARM64架构
```

**所有平台所有架构：**
```bash
npm run build
```

等待打包完成，文件在 `dist/` 目录

---

## Complete Process Example

```bash
# Clone or enter project directory
cd sys-diagnostic-tool

# Install dependencies
npm install

# Test run (optional but recommended)
npm start

# Build executables
npm run build

# View generated files
ls dist/
```

---

## 生成的文件

打包完成后，根据平台不同会得到：

**Windows：**
```
dist/System Diagnostic Tool Setup 1.0.0.exe  (约60-80MB)
```

**macOS：**
```
dist/System Diagnostic Tool-1.0.0.dmg  (约70-90MB)
```

**Linux：**
```
dist/System Diagnostic Tool-1.0.0.AppImage  (约80-100MB)
dist/system-diagnostic-tool_1.0.0_amd64.deb  (约60-80MB)
```

这些文件可以：
- ✅ 直接运行或安装
- ✅ 分发给其他用户
- ✅ 在对应系统上运行（Windows 7+、macOS 10.13+、Linux）

---

## 常见问题速查

**Q: 安装很慢？**  
A: 首次需要下载Electron（约100MB），请耐心等待

**Q: 打包失败？**  
A: 检查Node.js版本（需要v16+）：`node --version`

**Q: 文件太大？**  
A: 这是正常的，Electron应用通常在50-100MB（包含完整的浏览器引擎）

**Q: 如何选择架构？**  
A: 
- Windows: 大多数用户选择x64
- macOS: 推荐universal（兼容所有Mac）
- Linux: 标准PC选择x64，树莓派选择arm64

**Q: 想修改窗口大小？**  
A: 编辑 `main.js` 中的 `width` 和 `height`

**Q: 想添加图标？**  
A: 将对应格式的图标放在 `src/` 目录，重新打包

---

## 下一步

- 📖 查看 [README.md](README.md) 了解项目详情
- 🔧 查看 [BUILD.md](BUILD.md) 了解详细打包说明
- 🎮 运行游戏，输入作弊码：
  - `black sheep wall` - 无敌模式
  - `show me money` - 自动加分

---

## 需要帮助？

1. 确保已安装 Node.js v16+
2. 确保网络连接正常
3. 查看 BUILD.md 中的常见问题章节
4. 检查终端的错误信息

---

**祝你打包顺利！🎉**
