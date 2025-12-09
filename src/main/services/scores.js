import fs from 'fs/promises';
import path from 'path';

export function createScoreService(app) {
  const scoresJson = () => path.join(app.getPath('userData'), 'scores.json');
  const scoresTxt = () => path.join(app.getPath('userData'), 'scores.txt');

  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  function validatePayload(payload) {
    if (!payload || typeof payload !== 'object') return { ok: false, reason: 'invalid_payload' };
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const correct = Number.isFinite(payload.correct) ? payload.correct : 0;
    const total = Number.isFinite(payload.total) ? payload.total : 0;
    if (!name || total <= 0 || correct < 0 || correct > total) {
      return { ok: false, reason: 'invalid_values' };
    }
    return { ok: true, name, correct: Math.round(correct), total: Math.round(total) };
  }

  async function ensureStore() {
    try {
      const raw = await fs.readFile(scoresJson(), 'utf-8');
      return JSON.parse(raw);
    } catch {
      const empty = { players: {} };
      await fs.mkdir(path.dirname(scoresJson()), { recursive: true });
      await fs.writeFile(scoresJson(), JSON.stringify(empty, null, 2), 'utf-8');
      return empty;
    }
  }

  async function persist(store) {
    await fs.writeFile(scoresJson(), JSON.stringify(store, null, 2), 'utf-8');
    await writeTxt(store);
  }

  async function writeTxt(store) {
    const lines = Object.entries(store.players)
      .map(([name, stats]) => {
        const rate = stats.totalQuestions > 0
          ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
          : 0;
        return `${name} : ${rate}% (${stats.totalCorrect}/${stats.totalQuestions})`;
      })
      .sort((a, b) => {
        const ra = parseInt(a.split(':')[1], 10) || 0;
        const rb = parseInt(b.split(':')[1], 10) || 0;
        return rb - ra;
      });
    await fs.writeFile(scoresTxt(), lines.join('\n'), 'utf-8');
  }

  async function add(payload) {
    const valid = validatePayload(payload);
    if (!valid.ok) {
      throw new Error(valid.reason || 'invalid_payload');
    }
    const store = await ensureStore();
    const key = valid.name || 'Anonyme';
    const player = store.players[key] || { totalCorrect: 0, totalQuestions: 0 };
    player.totalCorrect += clamp(valid.correct, 0, valid.total);
    player.totalQuestions += valid.total;
    store.players[key] = player;
    await persist(store);
    const successRate = Math.round((player.totalCorrect / player.totalQuestions) * 100);
    return { successRate, name: key };
  }

  async function list() {
    const store = await ensureStore();
    return Object.entries(store.players).map(([name, stats]) => {
      const rate = stats.totalQuestions > 0
        ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100)
        : 0;
      return { name, successRate: rate, totalQuestions: stats.totalQuestions, totalCorrect: stats.totalCorrect };
    });
  }

  return { add, list, validatePayload };
}
