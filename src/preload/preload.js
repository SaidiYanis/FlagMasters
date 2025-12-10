import { contextBridge, ipcRenderer } from 'electron'

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
  },
  auth: {
    setToken: (token) => ipcRenderer.invoke('auth:setToken', token),
    clear: () => ipcRenderer.invoke('auth:clear'),
    users: {
      save: (profile) => ipcRenderer.invoke('users:save', profile)
    }
  }
})
