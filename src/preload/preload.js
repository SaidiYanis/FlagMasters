const { contextBridge, ipcRenderer } = require('electron');

// Pont sécurisé : ajouter ici les API nécessaires, sans exposer Node directement
contextBridge.exposeInMainWorld('api', {
  readConfig: () => ipcRenderer.invoke('config:read'),
  saveScore: (payload) => ipcRenderer.invoke('score:add', payload),
  listScores: () => ipcRenderer.invoke('score:list')
});
