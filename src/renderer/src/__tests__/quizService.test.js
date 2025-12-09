import { describe, it, expect } from 'vitest';
import { QuizService } from '../quizService';

const sample = [
  { code: 'A', name: 'A', difficulty: 100 },
  { code: 'B', name: 'B', difficulty: 100 },
  { code: 'C', name: 'C', difficulty: 100 },
  { code: 'D', name: 'D', difficulty: 100 }
];

describe('QuizService', () => {
  it('buildOptions returns correct + unique wrongs', () => {
    const opts = QuizService.buildOptions(sample[0], sample, 4);
    const codes = opts.map(o => o.code);
    expect(new Set(codes).size).toBe(opts.length);
    expect(codes).toContain('A');
    expect(opts.length).toBeLessThanOrEqual(4);
  });

  it('shuffle preserves length and elements', () => {
    const shuffled = QuizService.shuffle(sample);
    expect(shuffled).toHaveLength(sample.length);
    expect(shuffled.map(o => o.code).sort()).toEqual(sample.map(o => o.code).sort());
  });
});
