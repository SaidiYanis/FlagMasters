import { describe, it, expect } from 'vitest'
import { QuizClientUtils } from '../services/quizClientService'

describe('QuizService', () => {
  it('flagUrlFor builds a CDN URL', () => {
    const url = QuizClientUtils.flagUrlFor({ code: 'FR' }, 'main')
    expect(url).toContain('flagcdn.com')
    expect(url).toContain('/fr.png')
  })
})
