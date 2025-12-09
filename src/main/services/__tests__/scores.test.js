import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm } from 'fs/promises';
import os from 'os';
import path from 'path';
import { createScoreService } from '../scores.js';

let mockApp;
let tmpDir;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(os.tmpdir(), 'scores-test-'));
  mockApp = { getPath: () => tmpDir };
});

afterEach(async () => {
  if (tmpDir) {
    await rm(tmpDir, { recursive: true, force: true });
  }
});

describe('score service validation', () => {
  it('rejects invalid payloads', async () => {
    const svc = createScoreService(mockApp);
    await expect(svc.add(null)).rejects.toThrow();
    await expect(svc.add({ name: '', correct: 1, total: 0 })).rejects.toThrow();
    await expect(svc.add({ name: 'A', correct: 5, total: 3 })).rejects.toThrow();
  });

  it('aggregates scores and computes success rate', async () => {
    const svc = createScoreService(mockApp);
    const r1 = await svc.add({ name: 'Alice', correct: 7, total: 10 });
    expect(r1.successRate).toBe(70);
    const r2 = await svc.add({ name: 'Alice', correct: 3, total: 5 });
    expect(r2.successRate).toBe(67); // 10/15 ~ 66.6
  });
});
