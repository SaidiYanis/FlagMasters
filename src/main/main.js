import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createScoreService } from './services/scores.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scoreService = createScoreService(app);

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

function registerIpcHandlers() {
  ipcMain.handle('config:read', async () => {
    return readConfigFile();
  });
  ipcMain.handle('score:add', async (_event, payload) => {
    try {
      return await scoreService.add(payload || {});
    } catch (err) {
      return { successRate: 0, error: err?.message || 'save_error' };
    }
  });
  ipcMain.handle('score:list', async () => {
    try {
      return await scoreService.list();
    } catch (err) {
      return [];
    }
  });
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
