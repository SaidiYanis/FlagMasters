import { listCountries } from './firebaseCountries.js'
import { getCurrentUid } from './auth.js'
import {
  buildOptions,
  buildQuestionPool,
  filteredCountries,
  flagUrlFor,
  generateQuizData
} from '../../shared/quizUtils.js'

export function createQuizService() {
  async function generate({
    mode = 'country-to-flag',
    difficulty = 'easy',
    totalQuestions
  }) {
    if (!getCurrentUid()) {
      throw Object.assign(new Error('User not authenticated'), { code: 'unauthenticated' })
    }
    const all = await listCountries()
    return generateQuizData({ countries: all, mode, difficulty, totalQuestions })
  }

  return { generate, flagUrlFor, filteredCountries, buildOptions, buildQuestionPool }
}
