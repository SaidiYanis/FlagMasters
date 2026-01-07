import { app, BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'
import { createScoreService } from './services/scores.js'
import { createConfigService } from './services/config.js'
import { registerScoreIpc } from './ipc/scores.js'
import { registerConfigIpc } from './ipc/config.js'
import { registerCountriesIpc } from './ipc/countries.js'
import { registerQuizIpc } from './ipc/quiz.js'
import { createQuizService } from './services/quiz.js'
import { registerAuthIpc } from './ipc/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const scoreService = createScoreService(app)
const configService = createConfigService(app)
const quizService = createQuizService()

let rendererServer

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

function getMimeType(filePath) {
  return MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
}

function startRendererServer(rendererDir) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url || req.method !== 'GET') {
        res.writeHead(405)
        res.end()
        return
      }

      const url = new URL(req.url, 'http://localhost')
      let requestPath = decodeURIComponent(url.pathname)
      if (requestPath === '/') requestPath = '/index.html'

      const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, '')
      let filePath = path.join(rendererDir, safePath)

      fs.stat(filePath, (err, stat) => {
        const hasExtension = path.extname(filePath).length > 0

        if (err || (stat && stat.isDirectory())) {
          if (!hasExtension) {
            filePath = path.join(rendererDir, 'index.html')
          } else {
            res.writeHead(404)
            res.end()
            return
          }
        }

        fs.access(filePath, fs.constants.R_OK, (accessErr) => {
          if (accessErr) {
            res.writeHead(404)
            res.end()
            return
          }

          res.setHeader('Content-Type', getMimeType(filePath))
          const stream = fs.createReadStream(filePath)
          stream.on('error', () => {
            res.writeHead(500)
            res.end()
          })
          stream.pipe(res)
        })
      })
    })

    server.on('error', reject)
    server.listen(0, 'localhost', () => {
      const { port } = server.address()
      resolve({ server, url: `http://localhost:${port}` })
    })
  })
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    backgroundColor: '#020617',
    icon: path.resolve(__dirname, '../../resources/logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.setMenuBarVisibility(false)

  const rendererDevServerUrl = process.env['ELECTRON_RENDERER_URL']
  const rendererDir = path.join(__dirname, '../renderer')
  const rendererIndexPath = path.join(rendererDir, 'index.html')

  if (rendererDevServerUrl) {
    // Dev mode: use the Vite dev server provided by electron-vite
    win.loadURL(rendererDevServerUrl)
  } else {
    // Packaged/preview mode: serve the static HTML over localhost
    const { server, url } = await startRendererServer(rendererDir)
    rendererServer = server
    win.loadURL(url)
  }
}

function registerIpcHandlers() {
  registerConfigIpc(ipcMain, configService)
  registerScoreIpc(ipcMain, scoreService)
  registerCountriesIpc(ipcMain)
  registerQuizIpc(ipcMain, quizService)
  registerAuthIpc(ipcMain)
}

app.whenReady().then(() => {
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  app.quit()
})

app.on('before-quit', () => {
  if (rendererServer) {
    rendererServer.close()
    rendererServer = undefined
  }
})
