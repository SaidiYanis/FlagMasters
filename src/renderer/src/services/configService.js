export async function loadInitialConfig(api) {
  if (!api?.readConfig) return null;
  try {
    const cfg = await api.readConfig();
    return cfg && typeof cfg === 'object' ? cfg : null;
  } catch {
    return null;
  }
}

export function applyConfigToState(cfg, state, difficultyRanges) {
  if (!cfg || !state) return;
  if (cfg.totalQuestions) {
    state.menuQuestions = Math.max(1, Math.min(50, cfg.totalQuestions));
  }
  if (cfg.difficulty && difficultyRanges[cfg.difficulty]) {
    state.menuDifficulty = cfg.difficulty;
  }
}
