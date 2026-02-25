# Outil de diagnostic système / AWDMS

[简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [English](./README.md) | [Русский](./README.ru.md) | [Français](./README.fr.md)

Un outil professionnel de pratique de frappe simulant un flux de travail de développement agile.  
Intégré avec **AWDMS (Agile Workflow & Dependency Management System)** pour simuler un environnement de développement réel.  
Prend en charge l'empaquetage pour Windows, macOS et Linux.

## ✨ Fonctionnalités principales

### 🎮 Modes de jeu
- **Mode Normal** - Jeu de rythme classique
- **Attaque chronométrée** - Sprint de 60 secondes, vitesse ×2
- **Mode Survie** - 5 erreurs = game over, défi extrême
- **Mode Zen** - Pratique sans pression, vitesse ajustable (1.0x-5.0x)

### 🎯 Mécaniques de jeu
- Fragments de code multilingues (JS, C++, Java, Go, Python + Personnalisés)
- Système de niveaux + Classement mondial
- Système de combo (effets combo 3/5/10/20/50/100)
- Système de succès (certifications à 18 niveaux)

### 🔊 Système sonore
- 15 effets sonores procéduraux (clic/combo/raté/montée de niveau/succès, etc.)
- Contrôle du volume + Sourdine rapide
- Paramètres persistants

### 🎨 Système de thèmes
- 6 thèmes prédéfinis (VS Code Dark, GitHub, Monokai, Dracula, Nord, Solarized)
- Éditeur de thème personnalisé (personnalisation 4 couleurs)
- Support des variables CSS

### 📋 Système AWDMS (Projet "Moyu")
- **Tâches quotidiennes**: Missions à 4 niveaux (Junior → Principal)
- **Système d'objets**: 6 dépendances principales (Stable → Legacy)
- **Compilation Gacha**: Tirage de paquets de code source (succès 2%-100% + pitié)
- **$COMMITS** Système de crédits
- **UI déguisé professionnel** (style TODO.md / package.json / console AWS)

### 🔐 Fonctionnalités de sécurité
- Chiffrement AES-256-GCM + HMAC-SHA256
- Stockage local, pas de synchronisation cloud
- Changement rapide par touche Boss (`ESC`)

## Structure du projet (Modulaire + 100% TypeScript)

```text
sys_diagnostic_tool/
├── package.json          # Configuration du projet
├── main.ts               # Processus principal Electron
├── src/
│   ├── index.html        # Interface principale
│   ├── app.ts            # Logique de jeu principale (490 lignes)
│   ├── app.css           # Système de style à variables CSS
│   ├── storage.ts        # Chiffrement AES-256-GCM et persistance
│   ├── achievements.ts   # Définitions de succès à 18 niveaux
│   ├── achievementTracker.ts  # Moteur de suivi des succès (194 lignes)
│   ├── achievementUI.ts  # Rendu du panneau de succès
│   ├── analytics.ts      # Statistiques de graphiques Canvas
│   ├── soundEffects.ts   # Moteur sonore Web Audio API (187 lignes)
│   ├── combo.ts          # Système de combo
│   ├── gameState.ts      # Sauvegarde/restauration de progression
│   ├── practiceMode.ts   # Mode pratique
│   ├── challengeModes.ts # Système de modes de défi (374 lignes)
│   ├── gameConfig.ts     # Configuration du jeu (35 lignes)
│   ├── cheats.ts         # Système de triche (106 lignes)
│   ├── leaderboard.ts    # Système de classement (93 lignes)
│   ├── terminal.ts       # Système de terminal (128 lignes)
│   ├── uiHandlers.ts     # Gestionnaires d'événements UI (145 lignes)
│   ├── themeSystem.ts    # Système de thèmes (320 lignes)
│   ├── dailyTasks.ts     # Missions quotidiennes AWDMS (240 lignes)
│   ├── itemSystem.ts     # Système d'objets AWDMS (259 lignes)
│   ├── gachaSystem.ts    # Compilation/gacha AWDMS (219 lignes)
│   ├── awdmsUI.ts        # UI professionnel AWDMS (428 lignes)
│   ├── itemEffects.ts    # Effets d'objets AWDMS (119 lignes)
│   └── icon.svg          # Icône de l'application
└── dist/                 # Sortie de compilation TypeScript
```

## Installation

Assurez-vous d'avoir `Node.js` (recommandé `v16+`), puis exécutez :

```bash
npm install
```

## Développement

Démarrez l'application en mode développement :

```bash
npm start
```

## Compilation des exécutables

### Compilation mono-plateforme (architecture par défaut)

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

### Compilation pour une architecture spécifique

**Windows**
```bash
npm run build:win:x64      # 64-bit Intel/AMD
npm run build:win:ia32     # 32-bit Intel/AMD
npm run build:win:arm64    # ARM64 (Windows on ARM)
```

**macOS**
```bash
npm run build:mac:x64        # Puces Intel
npm run build:mac:arm64      # Apple Silicon (M1/M2)
npm run build:mac:universal  # Build universel (double architecture)
```

**Linux**
```bash
npm run build:linux:x64    # x64
npm run build:linux:arm64  # ARM64 (Raspberry Pi, etc.)
```

### Compiler toutes les plateformes

```bash
npm run build
```

## Notes de compilation

- La première compilation téléchargera les binaires Electron (dépend du réseau)
- Les applications compilées sont autonomes, Node.js n'est pas requis sur la machine cible
- **Windows** : Installateur NSIS avec chemin personnalisé et support des raccourcis
- **macOS** : Sortie DMG compatible avec Intel / Apple Silicon
- **Linux** : Fournit des paquets AppImage et deb

## Comment utiliser

1. Cliquez sur les fragments de code qui tombent pour marquer des points
2. Différentes langues ont des scores et vitesses différents, nécessitant concentration et réactions rapides
3. Survolez avec la souris pour mettre en pause les fragments pour un timing stratégique
4. Appuyez sur `ESC` pour activer le mode de minimisation rapide
5. Soumettez votre score après l'achèvement pour suivre votre progression

## Stack technologique

- **Electron** - Application de bureau multiplateforme
- **TypeScript** - Sécurité de type à 100%
- **Web Audio API** - Génération sonore procédurale
- **Variables CSS** - Système de thème dynamique
- **localStorage** - Persistance des données locales
- **electron-builder** - Empaquetage et construction

## Remarques

- Données du classement stockées dans un fichier chiffré `~/.sys_diagnostic_data`
- Données protégées par chiffrement AES-256-GCM + HMAC-SHA256
- Les fragments personnalisés et les succès sont également chiffrés et stockés localement
- Recommandé de tester localement avant la distribution
- Utilise `src/icon.svg` pour la génération d'icônes multiplateforme

## Conseils

Le code de ce projet est entièrement généré par des outils IA.  
S'il y a des bugs, ne me blâmez pas 😁  
Les suggestions et retours sont les bienvenus !

## Licence

MIT