export function registerScoreIpc(ipcMain, scoreService, log = console) {
  ipcMain.handle('score:add', async (_event, payload) => {
    try {
      return await scoreService.add(payload || {});
    } catch (err) {
      log.warn?.('[score:add] rejected', err?.message || err);
      return { successRate: 0, error: err?.message || 'save_error' };
    }
  });

  ipcMain.handle('score:list', async () => {
    try {
      return await scoreService.list();
    } catch (err) {
      log.warn?.('[score:list] failed', err?.message || err);
      return [];
    }
  });
}
