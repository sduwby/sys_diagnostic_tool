# Outil de diagnostic système

[简体中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md) | [English](./README.md) | [Русский](./README.ru.md) | [Français](./README.fr.md)

Un analyseur professionnel de précision de frappe et application de diagnostic de performance.  
Prend en charge l'empaquetage pour les plateformes Windows, macOS et Linux.

## Caractéristiques

- 🎮 Pratique de fragments de code multilingues (JS, C++, Java, Go, Python)
- 🎯 Système de niveaux + Classement des scores pour suivre la compétence de frappe
- 🔐 Stockage de données local chiffré pour la confidentialité
- 🎭 Fonction de minimisation rapide (touche `ESC` pour changement de fenêtre instantané)

## Structure du projet

```text
sys_diagnostic_tool/
├── package.json          # Configuration du projet
├── main.js               # Processus principal Electron
├── src/
│   ├── index.html        # Interface principale
│   ├── app.js            # Logique de jeu principale (911 lignes)
│   ├── app.css           # Styles
│   ├── storage.js        # Chiffrement AES-256-GCM et persistance des données
│   ├── achievements.js   # Définitions de 18 niveaux de succès
│   ├── analytics.js      # Graphiques Canvas et analyse statistique
│   ├── achievementUI.js  # Rendu du panneau de succès
│   └── icon.svg          # Icône de l'application (multiplateforme)
└── dist/                 # Sortie de build (auto-généré)
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

- Electron
- Vanilla JavaScript
- HTML5 / CSS3
- electron-builder

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