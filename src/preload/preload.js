const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  config: {
    read: () => ipcRenderer.invoke('config:read')
  },
  countries: {
    list: () => ipcRenderer.invoke('countries:list')
  },
  scores: {
    add: (payload) => ipcRenderer.invoke('score:add', payload),
    list: () => ipcRenderer.invoke('score:list')
  }
});
