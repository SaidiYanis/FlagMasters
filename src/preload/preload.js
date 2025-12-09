const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  config: {
    read: () => ipcRenderer.invoke('config:read')
  },
  countries: {
    list: () => ipcRenderer.invoke('countries:list')
  },
  quiz: {
    generate: (payload) => ipcRenderer.invoke('quiz:generate', payload)
  },
  scores: {
    add: (payload) => ipcRenderer.invoke('score:add', payload),
    list: () => ipcRenderer.invoke('score:list')
  }
});
