// Conservé uniquement pour flagUrlFor si besoin local, sinon le quiz est servi par le back
const FLAG_CDN_BASE = 'https://flagcdn.com';

export const QuizService = {
  flagUrlFor(country, kind = 'main') {
    if (!country) return '';
    const lowerCode = country.code.toLowerCase();
    const size = kind === 'answer' ? 'w160' : 'w320';
    return `${FLAG_CDN_BASE}/${size}/${lowerCode}.png`;
  }
};
