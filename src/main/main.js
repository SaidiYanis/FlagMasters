import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { createScoreService } from './services/scores.js';
import { createConfigService } from './services/config.js';
import { createCountriesService } from './services/countries.js';
import { registerScoreIpc } from './ipc/scores.js';
import { registerConfigIpc } from './ipc/config.js';
import { registerCountriesIpc } from './ipc/countries.js';
import { registerQuizIpc } from './ipc/quiz.js';
import { createQuizService } from './services/quiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scoreService = createScoreService(app);
const configService = createConfigService(app);
const countriesService = createCountriesService();
const quizService = createQuizService();

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
  registerConfigIpc(ipcMain, configService);
  registerScoreIpc(ipcMain, scoreService);
  registerCountriesIpc(ipcMain, countriesService);
  registerQuizIpc(ipcMain, quizService);
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
