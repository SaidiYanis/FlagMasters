export function registerQuizIpc(ipcMain, quizService, log = console) {
  ipcMain.handle('quiz:generate', async (_event, payload = {}) => {
    try {
      const mode = typeof payload.mode === 'string' ? payload.mode : 'country-to-flag';
      const difficulty = typeof payload.difficulty === 'string' ? payload.difficulty : 'easy';
      const totalQuestions = Number.isFinite(payload.totalQuestions) ? payload.totalQuestions : undefined;
      return quizService.generate({ mode, difficulty, totalQuestions });
    } catch (err) {
      log.warn?.('[quiz:generate] failed', err?.message || err);
      return { mode: 'country-to-flag', difficulty: 'easy', totalQuestions: 0, questions: [] };
    }
  });
}
