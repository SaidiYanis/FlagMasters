import { ipcMain } from 'electron'
import { verifyIdToken, saveUserProfile, clearAuth } from '../services/auth.js'

export function registerAuthIpc() {
  ipcMain.handle('auth:setToken', async (_e, token) => {
    if (!token) return { ok: false, error: 'missing_token' }
    try {
      const decoded = await verifyIdToken(token)
      return { ok: true, uid: decoded.uid }
    } catch (err) {
      console.error('[auth:setToken] verify failed', err)
      return { ok: false, error: 'invalid_token' }
    }
  })

  ipcMain.handle('users:save', async (_e, profile) => {
    if (!profile?.uid) return { ok: false, error: 'missing_uid' }
    try {
      await saveUserProfile(profile)
      return { ok: true }
    } catch (err) {
      console.error('[users:save] failed', err)
      return { ok: false, error: 'save_failed' }
    }
  })

  ipcMain.handle('auth:clear', () => {
    clearAuth()
    return { ok: true }
  })
}
