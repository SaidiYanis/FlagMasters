const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs/promises');

function scoresFilePath() {
  return path.join(app.getPath('userData'), 'scores.json');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    backgroundColor: '#020617',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const rendererDevServerUrl = process.env['ELECTRON_RENDERER_URL'];
  const rendererIndexPath = path.join(__dirname, '../renderer/index.html');

  if (rendererDevServerUrl) {
    // Dev mode: use the Vite dev server provided by electron-vite
    win.loadURL(rendererDevServerUrl);
  } else {
    // Packaged/preview mode: load the built static HTML
    win.loadFile(rendererIndexPath);
  }
}

async function readConfigFile() {
  const configPath = path.join(app.getPath('userData'), 'config.json');
  try {
    const raw = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    // Fallback: retourne une config par défaut sans planter le renderer
    return { totalQuestions: 10, difficulty: 'easy' };
  }
}

async function ensureScoresFile() {
  const file = scoresFilePath();
  try {
    const raw = await fs.readFile(file, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const empty = { players: {} };
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(empty, null, 2), 'utf-8');
    return empty;
  }
}

async function addScore({ name, correct, total }) {
  if (!name || !total || total <= 0) return { successRate: 0 };
  const safeName = String(name).trim() || 'Anonyme';
  const data = await ensureScoresFile();
  const player = data.players[safeName] || { totalCorrect: 0, totalQuestions: 0 };
  player.totalCorrect += correct;
  player.totalQuestions += total;
  data.players[safeName] = player;
  await fs.writeFile(scoresFilePath(), JSON.stringify(data, null, 2), 'utf-8');
  await writeScoresTxt(data);
  const successRate = Math.round((player.totalCorrect / player.totalQuestions) * 100);
  return { successRate };
}

async function listScores() {
  const data = await ensureScoresFile();
  return Object.entries(data.players).map(([name, stats]) => {
    const rate = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
    return { name, successRate: rate, totalQuestions: stats.totalQuestions, totalCorrect: stats.totalCorrect };
  });
}

function registerIpcHandlers() {
  ipcMain.handle('config:read', async () => {
    return readConfigFile();
  });
  ipcMain.handle('score:add', async (_event, payload) => {
    try {
      return await addScore(payload || {});
    } catch (err) {
      return { successRate: 0, error: err?.message || 'save_error' };
    }
  });
  ipcMain.handle('score:list', async () => {
    try {
      return await listScores();
    } catch (err) {
      return [];
    }
  });
}

async function writeScoresTxt(data) {
  const file = path.join(app.getPath('userData'), 'scores.txt');
  const lines = Object.entries(data.players).map(([name, stats]) => {
    const rate = stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0;
    return `${name} : ${rate}% (${stats.totalCorrect}/${stats.totalQuestions})`;
  }).sort((a, b) => {
    const ra = parseInt(a.split(':')[1], 10) || 0;
    const rb = parseInt(b.split(':')[1], 10) || 0;
    return rb - ra;
  });
  await fs.writeFile(file, lines.join('\n'), 'utf-8');
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
