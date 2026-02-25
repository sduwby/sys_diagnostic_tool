# System Diagnostic Tool / AWDMS

[简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [English](./README.md) | [Русский](./README.ru.md) | [Français](./README.fr.md)

A professional typing practice tool simulating agile development workflow.  
Integrated with **AWDMS (Agile Workflow & Dependency Management System)** for realistic dev environment simulation.  
Supports packaging for Windows, macOS, and Linux platforms.

## ✨ Core Features

### 🎮 Game Modes
- **Normal Mode** - Classic rhythm game
- **Time Attack** - 60-second sprint, 2x speed
- **Survival Mode** - 5 misses game over, extreme challenge
- **Zen Mode** - No pressure practice, adjustable speed (1.0x-5.0x)

### 🎯 Game Mechanics
- Multi-language code snippets (JS, C++, Java, Go, Python + Custom)
- Level system + Global leaderboard
- Combo system (3/5/10/20/50/100 combo effects)
- Achievement system (18-tier certifications)

### 🔊 Sound System
- 15 procedural sound effects (click/combo/miss/level-up/achievement, etc.)
- Volume control + Quick mute
- Persistent settings

### 🎨 Theme System
- 6 preset themes (VS Code Dark, GitHub, Monokai, Dracula, Nord, Solarized)
- Custom theme editor (4-color customization)
- CSS variable support

### 📋 AWDMS System (Project "Moyu")
- **Daily Tasks**: 4-tier missions (Junior → Principal)
- **Item System**: 6 core dependencies (Stable → Legacy)
- **Gacha Compilation**: Source package compilation draw (2%-100% success + pity)
- **$COMMITS** Credits system
- **Professional Disguise UI** (TODO.md / package.json / AWS console style)

### 🔐 Security Features
- AES-256-GCM + HMAC-SHA256 encryption
- Local storage, no cloud sync
- Boss key quick switch (`ESC`)

## Project Structure (Modularized + 100% TypeScript)

```text
sys_diagnostic_tool/
├── package.json          # Project configuration
├── main.ts               # Electron main process
├── src/
│   ├── index.html        # Main interface
│   ├── app.ts            # Core game logic (490 lines)
│   ├── app.css           # CSS variable styling system
│   ├── storage.ts        # AES-256-GCM encryption & persistence
│   ├── achievements.ts   # 18-tier achievement definitions
│   ├── achievementTracker.ts  # Achievement tracking engine (194 lines)
│   ├── achievementUI.ts  # Achievement panel rendering
│   ├── analytics.ts      # Canvas chart statistics
│   ├── soundEffects.ts   # Web Audio API sound engine (187 lines)
│   ├── combo.ts          # Combo system
│   ├── gameState.ts      # Progress save/restore
│   ├── practiceMode.ts   # Practice mode
│   ├── challengeModes.ts # Challenge mode system (374 lines)
│   ├── gameConfig.ts     # Game configuration (35 lines)
│   ├── cheats.ts         # Cheat system (106 lines)
│   ├── leaderboard.ts    # Leaderboard system (93 lines)
│   ├── terminal.ts       # Terminal system (128 lines)
│   ├── uiHandlers.ts     # UI event handlers (145 lines)
│   ├── themeSystem.ts    # Theme system (320 lines)
│   ├── dailyTasks.ts     # AWDMS daily missions (240 lines)
│   ├── itemSystem.ts     # AWDMS item system (259 lines)
│   ├── gachaSystem.ts    # AWDMS compilation/gacha (219 lines)
│   ├── awdmsUI.ts        # AWDMS professional UI (428 lines)
│   ├── itemEffects.ts    # AWDMS item effects (119 lines)
│   └── icon.svg          # Application icon
└── dist/                 # TypeScript compilation output
```

## Installation

Ensure you have `Node.js` (recommended `v16+`), then run:

```bash
npm install
```

## Development

Start the application in development mode:

```bash
npm start
```

## Build Executables

### Single Platform Build (Default Architecture)

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

### Specific Architecture Build

**Windows**
```bash
npm run build:win:x64      # 64-bit Intel/AMD
npm run build:win:ia32     # 32-bit Intel/AMD
npm run build:win:arm64    # ARM64 (Windows on ARM)
```

**macOS**
```bash
npm run build:mac:x64        # Intel chips
npm run build:mac:arm64      # Apple Silicon (M1/M2)
npm run build:mac:universal  # Universal build (dual architecture)
```

**Linux**
```bash
npm run build:linux:x64    # x64
npm run build:linux:arm64  # ARM64 (Raspberry Pi, etc.)
```

### Build All Platforms

```bash
npm run build
```

## Build Notes

- First build will download Electron binaries (network dependent)
- Built applications are standalone, no Node.js required on target machine
- **Windows**: NSIS installer with custom path and shortcuts support
- **macOS**: DMG output compatible with Intel / Apple Silicon
- **Linux**: Provides AppImage and deb packages

## How to Use

1. Click on falling code snippets to score points
2. Different languages have different scores and speeds, requiring focus and quick reactions
3. Hover mouse to pause snippets for strategic timing
4. Press `ESC` to activate quick minimize mode
5. Submit your score after completion to track your progress

## Tech Stack

- **Electron** - Cross-platform desktop app
- **TypeScript** - 100% type safety
- **Web Audio API** - Procedural sound generation
- **CSS Variables** - Dynamic theme system
- **localStorage** - Local data persistence
- **electron-builder** - Packaging & build

## Notes

- Leaderboard data stored in encrypted file `~/.sys_diagnostic_data`
- Data protected by AES-256-GCM + HMAC-SHA256 encryption
- Custom snippets and achievements also encrypted and stored locally
- Recommend testing locally before distribution
- Uses `src/icon.svg` for cross-platform icon generation

## Tips

This project code is fully generated by AI tools.  
If there are bugs, don't blame me 😁  
Suggestions and feedback are welcome!

## License

MIT
