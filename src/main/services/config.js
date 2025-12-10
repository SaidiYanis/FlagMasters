import fs from 'fs/promises'
import path from 'path'

export function createConfigService(app) {
  const configPath = () => path.join(app.getPath('userData'), 'config.json')

  function sanitize(cfg) {
    if (!cfg || typeof cfg !== 'object') return null
    const total = Number.isFinite(cfg.totalQuestions)
      ? Math.max(1, Math.min(50, cfg.totalQuestions))
      : null
    const difficulty = typeof cfg.difficulty === 'string' ? cfg.difficulty : null
    return {
      ...(total ? { totalQuestions: total } : {}),
      ...(difficulty ? { difficulty } : {})
    }
  }

  async function read() {
    try {
      const raw = await fs.readFile(configPath(), 'utf-8')
      const parsed = JSON.parse(raw)
      return sanitize(parsed) || { totalQuestions: 10, difficulty: 'easy' }
    } catch {
      return { totalQuestions: 10, difficulty: 'easy' }
    }
  }

  return { read }
}
