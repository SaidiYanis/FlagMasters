import { describe, expect, it, vi } from 'vitest'

const listCountriesMock = vi
  .fn()
  .mockResolvedValue([{ code: 'FR', name: 'France', difficulty: 200 }])

vi.mock('../../services/firebaseCountries.js', () => ({
  listCountries: (...args) => listCountriesMock(...args)
}))

const handles = {}
const ipcMainMock = vi.hoisted(() => ({
  handle: vi.fn((channel, cb) => {
    handles[channel] = cb
  })
}))

vi.mock('electron', () => ({ ipcMain: ipcMainMock }))

import { registerCountriesIpc } from '../countries.js'

describe('ipc countries', () => {
  it('registers handler and returns data', async () => {
    registerCountriesIpc()
    expect(ipcMainMock.handle).toHaveBeenCalledWith('countries:list', expect.any(Function))
    const result = await handles['countries:list']()
    expect(result).toEqual([{ code: 'FR', name: 'France', difficulty: 200 }])
  })
})
