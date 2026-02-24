# 打包成可执行文件详细指南

本文档详细说明如何将项目打包成Windows、macOS、Linux可执行文件。

## 前置要求

1. **Node.js环境**
   - 版本要求：Node.js v16.0.0 或更高
   - 检查版本：`node --version`
   - 下载地址：https://nodejs.org/

2. **操作系统**
   - 推荐在Windows系统上打包Windows应用
   - 也可以在Mac/Linux上交叉编译（需要额外配置）

## 步骤一：安装依赖

在项目根目录下打开终端，运行：

```bash
npm install
```

这将安装以下依赖：
- `electron` - Electron框架
- `electron-builder` - 打包工具

**注意**：首次安装可能需要下载较大的文件（Electron二进制文件约100MB），请确保网络连接稳定。

## 步骤二：测试运行

在打包前，建议先测试应用是否正常运行：

```bash
npm start
```

这将启动Electron应用。如果一切正常，你应该能看到游戏界面。

测试以下功能：
- [ ] 游戏是否正常启动
- [ ] 代码片段是否正常下落
- [ ] 点击代码片段是否能加分
- [ ] 按ESC键是否能切换Boss模式
- [ ] 游戏结束后排行榜是否正常显示

## 步骤三：打包成可执行文件

### Windows平台

#### 默认打包（x64架构）
```bash
npm run build:win
```

#### 指定架构打包
```bash
npm run build:win:x64      # 64位 Intel/AMD处理器（推荐）
npm run build:win:ia32     # 32位 Intel/AMD处理器（兼容老系统）
npm run build:win:arm64    # ARM64架构（Windows on ARM设备）
```

**生成文件：**
- `System Diagnostic Tool Setup 1.0.0.exe` - NSIS安装程序

**特点：**
- 用户可以选择安装路径
- 自动创建桌面快捷方式
- 自动创建开始菜单项
- 支持卸载功能

**架构说明：**
- **x64**：适用于大多数现代Windows电脑（64位）
- **ia32**：适用于老旧的32位Windows系统
- **arm64**：适用于Surface Pro X等ARM设备

### macOS平台

#### 默认打包（x64 + arm64）
```bash
npm run build:mac
```

#### 指定架构打包
```bash
npm run build:mac:x64        # Intel芯片Mac
npm run build:mac:arm64      # Apple Silicon (M1/M2/M3)
npm run build:mac:universal  # 通用版本（推荐，同时支持两种芯片）
```

**生成文件：**
- `System Diagnostic Tool-1.0.0.dmg` - DMG镜像文件

**特点：**
- 拖拽安装到Applications文件夹
- 原生macOS应用体验
- 支持macOS 10.13+

**架构说明：**
- **x64**：适用于2020年之前的Intel Mac
- **arm64**：适用于2020年后的Apple Silicon Mac（M1/M2/M3）
- **universal**：通用版本，文件较大但兼容所有Mac（推荐）

**注意：** 在非Mac系统上打包Mac应用可能需要额外配置

### Linux平台

#### 默认打包（x64架构）
```bash
npm run build:linux
```

#### 指定架构打包
```bash
npm run build:linux:x64    # x64架构（标准PC）
npm run build:linux:arm64  # ARM64架构（树莓派4/5等）
```

**生成文件：**
- `System Diagnostic Tool-1.0.0.AppImage` - 通用格式，无需安装
- `system-diagnostic-tool_1.0.0_amd64.deb` - Debian/Ubuntu安装包

**特点：**
- AppImage可在任何Linux发行版上运行
- deb包适用于Debian、Ubuntu等系统
- 原生Linux应用体验

**架构说明：**
- **x64**：适用于标准PC和服务器
- **arm64**：适用于树莓派4/5、ARM服务器等

### 多平台同时打包

打包所有平台的所有架构：

```bash
npm run build
```

这将生成：
- Windows: x64, ia32, arm64
- macOS: x64, arm64
- Linux: x64, arm64

**注意：** 完整打包可能需要较长时间和较大磁盘空间

## 步骤四：查找生成的文件

打包完成后，文件位于 `dist/` 目录：

**Windows：**
```
dist/
├── System Diagnostic Tool Setup 1.0.0.exe  (安装程序，约60-80MB)
└── win-unpacked/                           (未打包的文件夹)
```

**macOS：**
```
dist/
├── System Diagnostic Tool-1.0.0.dmg        (DMG镜像，约70-90MB)
└── mac/                                    (未打包的应用)
```

**Linux：**
```
dist/
├── System Diagnostic Tool-1.0.0.AppImage   (AppImage，约80-100MB)
├── system-diagnostic-tool_1.0.0_amd64.deb (deb包，约60-80MB)
└── linux-unpacked/                         (未打包的文件夹)
```

## 常见问题

### 1. 打包速度慢

**原因**：首次打包需要下载Electron二进制文件

**解决方案**：
- 耐心等待，后续打包会快很多
- 使用国内镜像加速：
  ```bash
  npm config set electron_mirror https://npmmirror.com/mirrors/electron/
  ```

### 2. 打包失败：权限错误

**解决方案**：
- Windows：以管理员身份运行终端
- 检查杀毒软件是否拦截

### 3. 打包后文件很大

**原因**：Electron应用包含完整的Chromium浏览器和Node.js运行时

**说明**：这是正常的，通常在50-100MB之间，不同平台略有差异

### 4. 打包后无法运行

**检查项**：
- 确保`src/`目录下的所有文件都存在
- 检查`main.js`中的文件路径是否正确
- 查看是否有杀毒软件拦截

### 5. 想要自定义图标

**步骤**：
1. 准备 SVG 格式图标文件（推荐）或准备各平台格式：
   - 推荐: `icon.svg` (矢量格式，electron-builder 自动转换)
   - Windows: `icon.ico` (256x256像素)
   - macOS: `icon.icns` (512x512像素)
   - Linux: `icon.png` (512x512像素)
2. 将图标文件放在`src/`目录
3. 更新 `package.json` 中的图标路径（如使用 SVG，所有平台设为 `"icon": "src/icon.svg"`）
4. 重新打包

### 6. 在非Mac系统上打包Mac应用

**解决方案**：
- 需要安装额外的依赖
- 或者在Mac系统上进行打包
- 推荐使用CI/CD服务（如GitHub Actions）进行多平台打包

### 7. Linux上AppImage无法运行

**解决方案**：
```bash
chmod +x "System Diagnostic Tool-1.0.0.AppImage"
./"System Diagnostic Tool-1.0.0.AppImage"
```

## 高级配置

### 修改应用名称

编辑`package.json`：

```json
{
  "name": "your-app-name",
  "productName": "Your App Display Name",
  "version": "1.0.0"
}
```

### 修改窗口大小

编辑`main.js`：

```javascript
mainWindow = new BrowserWindow({
    width: 1200,  // 修改宽度
    height: 800,  // 修改高度
    // ...
});
```

### 添加应用图标

1. 准备 SVG 图标文件（推荐）：
   - 创建或下载 `icon.svg` 文件（矢量格式）
   - electron-builder 24.x+ 支持自动转换为各平台格式

2. 放置在`src/`目录

3. 更新`package.json`（如使用 SVG）：
   ```json
   "build": {
     "win": { "icon": "src/icon.svg" },
     "mac": { "icon": "src/icon.svg" },
     "linux": { "icon": "src/icon.svg" }
   }
   ```

**注意**: 也可以使用平台特定格式（.ico/.icns/.png），但 SVG 更简便

## 分发建议

### 给其他用户

1. 分发安装程序（`.exe`文件）
2. 提供简单的安装说明
3. 说明系统要求（Windows 7及以上）

### 文件大小优化

如果需要减小文件大小，可以：
1. 使用压缩工具（如7-Zip）压缩安装程序
2. 使用在线分发（不推荐，因为需要服务器）

## 打包清单

打包前检查：
- [ ] 所有功能测试通过
- [ ] 版本号已更新
- [ ] 应用名称正确
- [ ] 图标已准备（可选）
- [ ] README.md已更新

打包后检查：
- [ ] 安装程序能正常安装
- [ ] 应用能正常启动
- [ ] 所有功能正常工作
- [ ] 卸载功能正常

## 技术支持

如遇到问题，可以：
1. 查看Electron官方文档：https://www.electronjs.org/
2. 查看electron-builder文档：https://www.electron.build/
3. 检查控制台错误信息

## 更新日志

记录每次打包的版本变化：

- v1.0.0 (2024-02-24)
  - 初始版本
  - 基础游戏功能
  - 排行榜系统
  - Boss键功能
