import { describe, it, expect } from 'vitest';
import { QuizService } from '../services/quizService';

describe('QuizService', () => {
  it('flagUrlFor builds a CDN URL', () => {
    const url = QuizService.flagUrlFor({ code: 'FR' }, 'main');
    expect(url).toContain('flagcdn.com');
    expect(url).toContain('/fr.png');
  });
});
