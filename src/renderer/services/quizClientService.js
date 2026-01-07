import { fetchCountries } from './firestoreService'
import { flagUrlFor, generateQuizData } from '../../shared/quizUtils.js'

export async function generateQuiz({
  mode = 'country-to-flag',
  difficulty = 'easy',
  totalQuestions
}) {
  const all = await fetchCountries()
  return generateQuizData({ countries: all, mode, difficulty, totalQuestions })
}

export const QuizClientUtils = { flagUrlFor }
