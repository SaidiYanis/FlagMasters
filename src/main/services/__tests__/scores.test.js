import { createScoreService } from '../scores.js';

const mockApp = {
  getPath: () => 'tmp'
};

describe('score service validation', () => {
  test('rejects invalid payloads', async () => {
    const svc = createScoreService(mockApp);
    await expect(svc.add(null)).rejects.toThrow();
    await expect(svc.add({ name: '', correct: 1, total: 0 })).rejects.toThrow();
    await expect(svc.add({ name: 'A', correct: 5, total: 3 })).rejects.toThrow();
  });
});
