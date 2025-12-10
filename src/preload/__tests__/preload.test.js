import { describe, expect, it, vi } from 'vitest'

// Hoisted mock to avoid TDZ issues with preload import
const invokeMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => ({
  ipcRenderer: { invoke: invokeMock },
  contextBridge: {
    exposeInMainWorld: (key, api) => {
      globalThis[key] = api
    }
  }
}))

// Fournit un alias window dans l'environnement node
globalThis.window = globalThis

import '../preload.js'

describe('preload api exposure', () => {
  it('exposes countries.list that calls ipcRenderer.invoke', async () => {
    invokeMock.mockResolvedValueOnce([{ code: 'FR' }])
    const res = await window.api.countries.list()
    expect(invokeMock).toHaveBeenCalledWith('countries:list')
    expect(res).toEqual([{ code: 'FR' }])
  })
})
