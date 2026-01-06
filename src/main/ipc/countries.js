import { listCountries } from '../services/firebaseCountries.js'

export function registerCountriesIpc(ipcMain, log = console) {
  ipcMain.handle('countries:list', async () => {
    try {
      log.log?.('[ipc:countries:list] invoked')
      const all = await listCountries()
      log.log?.('[ipc:countries:list] returning', all.length, 'items')
      return all
    } catch (err) {
      log.error?.('Erreur Firestore :', err)
      return { error: err?.code || 'unknown', items: [] }
    }
  })
}
