const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  readConfig: () => ipcRenderer.invoke('config:read'),
  saveScore: (payload) => ipcRenderer.invoke('score:add', payload),
  listScores: () => ipcRenderer.invoke('score:list')
});
