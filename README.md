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
├── build/                     # Icônes et fichiers packaging
├── dist/                      # Build final (setup exe + unpacked)
├── out/                       # Build Vite/Electron intermédiaire
├── resources/                 # Ressources diverses
├── src/
│   ├── main/                  # Processus principal Electron
│   │   └── main.js
│   ├── preload/               # Bridge sécurisé
│   │   └── preload.js
│   └── renderer/              # Code frontend Vue + Vite
│       ├── index.html
│       ├── app.js
│       ├── src/
│       │   ├── App.vue
│       │   ├── countries.js
│       │   ├── quizService.js
│       │   └── main.js
│       └── assets/
├── electron-builder.yml
├── electron.vite.config.mjs
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
