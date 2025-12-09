// Service stateless pour les helpers de quiz
const FLAG_CDN_BASE = 'https://flagcdn.com';

export const QuizService = {
  flagUrlFor(country, kind = 'main') {
    if (!country) return '';
    const lowerCode = country.code.toLowerCase();
    const size = kind === 'answer' ? 'w160' : 'w320';
    return `${FLAG_CDN_BASE}/${size}/${lowerCode}.png`;
  },

  shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  buildOptions(correct, pool, optionsPerQuestion) {
    const wrongs = [];
    const maxWrong = Math.min(optionsPerQuestion - 1, pool.length - 1);

    while (wrongs.length < maxWrong) {
      const candidate = this.getRandomCountry(correct.code, pool);
      if (!wrongs.find(w => w.code === candidate.code)) {
        wrongs.push(candidate);
      }
    }

    return this.shuffle([correct, ...wrongs]);
  },

  getRandomCountry(exceptCode = null, pool = []) {
    const source = exceptCode ? pool.filter(c => c.code !== exceptCode) : pool;
    const idx = Math.floor(Math.random() * source.length);
    return source[idx];
  }
};
