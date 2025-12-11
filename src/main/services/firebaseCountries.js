import { getAdminDb, getCurrentUid } from './auth.js'

export async function listCountries() {
  ensureAuthenticated()
  const db = await getAdminDb()
  console.log('[countries] fetching all from Firestore')
  const snap = await db.collection('countrySettings').get()
  const data = snap.docs.map((doc) => normalize(doc)).filter((c) => c.enabled !== false)
  console.log('[countries] fetched', data.length, 'items (enabled only)')
  return data
}

export async function listCountriesByDifficulty(min, max) {
  ensureAuthenticated()
  const db = await getAdminDb()
  console.log('[countries] fetching by difficulty', { min, max })
  const snap = await db
    .collection('countrySettings')
    .where('difficulty', '>=', min)
    .where('difficulty', '<=', max)
    .get()
  const data = snap.docs.map((doc) => normalize(doc)).filter((c) => c.enabled !== false)
  console.log('[countries] fetched', data.length, 'items (filtered + enabled only)')
  return data
}

function normalize(doc) {
  const data = doc.data()
  const code = doc.id
  const mainLink = data.link || data.flagUrl || `https://flagcdn.com/w320/${code.toLowerCase()}.png`
  const flagUrl = data.flagUrl || mainLink
  const flagThumbUrl = data.flagThumbUrl || `https://flagcdn.com/w160/${code.toLowerCase()}.png`
  const enabled =
    data.enabled === undefined
      ? true
      : data.enabled === true || data.enabled === 'true' || data.enabled === 1
  return {
    code,
    ...data,
    link: mainLink,
    flagUrl,
    flagThumbUrl,
    enabled
  }
}

function ensureAuthenticated() {
  const uid = getCurrentUid()
  if (!uid) {
    throw Object.assign(new Error('User not authenticated'), { code: 'unauthenticated' })
  }
}
