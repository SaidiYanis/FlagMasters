export function registerConfigIpc(ipcMain, configService, log = console) {
  ipcMain.handle('config:read', async () => {
    try {
      return await configService.read()
    } catch (err) {
      log.warn?.('[config:read] failed', err?.message || err)
      return { totalQuestions: 10, difficulty: 'easy' }
    }
  })
}
