# 📘 FlagMasters – Quiz des Drapeaux  
**Electron + Vite + Vue 3**

FlagMasters est une application moderne permettant d’apprendre les drapeaux du monde via un quiz interactif.  
Le projet utilise **Electron** pour le desktop, **Vite** pour le bundling rapide, et **Vue 3** pour l’interface front.

---

## 🎮 Fonctionnalités

### 🧠 Modes de jeu
- **Trouver le pays** : 1 drapeau → 4 noms
- **Trouver le drapeau** : 1 nom → 4 drapeaux
- Indicateur immédiat (correct / incorrect)
- Score en temps réel

### 🎚️ Niveaux de difficulté
- **Facile** (pays très connus)
- **Normal**
- **Difficile** (pays moins connus)
- **Mixte** (tous pays confondus)

### 🌍 Données des pays
- +175 pays
- Codes ISO (compatible FlagCDN)
- Niveau de difficulté 0 → 200
- Drapeaux haute qualité via FlagCDN

### 🎨 Interface utilisateur
- Design sombre moderne
- Drapeaux harmonisés (aspect-ratio + contain)
- UI responsive
- Navigation simple

### 🔒 Architecture sécurisée
- `contextIsolation: true`
- `nodeIntegration: false`
- Preload IPC sécurisé
- CSP stricte
- Renderer isolé

### 🏗️ Build & packaging
- Installateur `.exe` via `electron-builder`
- Version portable `win-unpacked`
- Build optimisé pour Windows

---

## 📁 Structure du projet

```
FlagMasters/
├── .github/workflows/ci.yml
├── build/                      # Icônes / packaging
├── dist/                       # Builds electron-builder
├── out/                        # Builds electron-vite
├── resources/                  # Assets (logo, sons…)
├── src/
│   ├── main/                   # Processus principal
│   │   ├── ipc/                # Handlers IPC
│   │   ├── services/
│   │   │   ├── auth.js         # Vérif tokens Firebase Admin
│   │   │   ├── firebaseCountries.js
│   │   │   ├── quiz.js         # Génération quiz (Firestore)
│   │   │   ├── scores.js       # Leaderboard Firestore (users)
│   │   │   └── config.js
│   │   └── main.js
│   ├── preload/                # Bridge sécurisé
│   │   └── preload.js
│   └── renderer/               # UI Vue 3
│       ├── App.vue
│       ├── main.js
│       ├── components/         # TopBar, MenuPanel, GamePanel, ScoreModal…
│       ├── services/           # authService, quizService, configService
│       └── composables/        # useFlags, useSounds…
├── tmp/                        # Fichiers de travail (scores.json…)
├── electron.vite.config.mjs
├── electron-builder.yml
├── package.json
└── README.md
```

---

## 🚀 Installation et développement

### 🔧 Prérequis
- Node.js **18+** (recommandé : **20+**)
- npm **8+**

### ▶️ Lancer l’application en mode dev

```
npm install
npm run dev
```

Electron démarre en utilisant le serveur Vite local.

---

## 📦 Build Windows (.exe)

```
npm run build:win
```

Résultats :
- `dist/package-<version>-setup.exe` (installateur)
- `dist/win-unpacked/` (application portable)

---

## 🔐 Sécurité

Le projet suit les bonnes pratiques d’Electron :

- Aucun accès Node dans le renderer  
- API IPC exposée uniquement via preload  
- sandbox + isolation du contexte  
- stricte séparation Main / Preload / Renderer  
- CSP restrictive

---

## 📜 Améliorations futures

- Mode "Contre-la-montre"
- Mode "Révision par continent"
- Support multi-langues
- Animations UI

---

## 👤 Auteur

**Yanis Saidi**  
Projet étudiant et personnel visant à produire un quiz moderne, sécurisé et propre avec Electron + Vue + Vite.

---

## 📝 Licence

Libre pour un usage éducatif.
