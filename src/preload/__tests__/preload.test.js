import { describe, expect, it, vi } from 'vitest';

const invokeMock = vi.fn();

vi.mock('electron', () => ({
  ipcRenderer: { invoke: invokeMock },
  contextBridge: {
    exposeInMainWorld: (key, api) => {
      globalThis[key] = api;
    }
  }
}));

import '../preload.js';

describe('preload api exposure', () => {
  it('exposes countries.list that calls ipcRenderer.invoke', async () => {
    invokeMock.mockResolvedValueOnce([{ code: 'FR' }]);
    const res = await window.api.countries.list();
    expect(invokeMock).toHaveBeenCalledWith('countries:list');
    expect(res).toEqual([{ code: 'FR' }]);
  });
});
