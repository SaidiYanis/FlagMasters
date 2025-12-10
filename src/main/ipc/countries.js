import { ipcMain } from 'electron';
import { listCountries } from '../services/firebaseCountries.js';

export function registerCountriesIpc() {
  ipcMain.handle('countries:list', async () => {
    try {
      console.log('[ipc:countries:list] invoked');
      const all = await listCountries();
      console.log('[ipc:countries:list] returning', all.length, 'items');
      return all;
    } catch (err) {
      console.error('Erreur Firestore :', err);
      return { error: err?.code || 'unknown', items: [] };
    }
  });
}
