import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getCurrentUid } from './auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD3GQ-AtLOvCsfBIEj1tazn4pq_Jjxin7I',
  authDomain: 'flag-masters-geo.firebaseapp.com',
  projectId: 'flag-masters-geo',
  storageBucket: 'flag-masters-geo.firebasestorage.app',
  messagingSenderId: '729351393002',
  appId: '1:729351393002:web:72a2caffaaadda21b09193',
  measurementId: 'G-86195LTSNQ'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function listCountries() {
  ensureAuthenticated();
  console.log('[countries] fetching all from Firestore');
  const snap = await getDocs(collection(db, 'countrySettings'));
  const data = snap.docs.map((doc) => normalize(doc)).filter((c) => c.enabled !== false);
  console.log('[countries] fetched', data.length, 'items (enabled only)');
  return data;
}

export async function listCountriesByDifficulty(min, max) {
  ensureAuthenticated();
  console.log('[countries] fetching by difficulty', { min, max });
  const q = query(
    collection(db, 'countrySettings'),
    where('difficulty', '>=', min),
    where('difficulty', '<=', max)
  );
  const snap = await getDocs(q);
  const data = snap.docs.map((doc) => normalize(doc)).filter((c) => c.enabled !== false);
  console.log('[countries] fetched', data.length, 'items (filtered + enabled only)');
  return data;
}

function normalize(doc) {
  const data = doc.data();
  const code = doc.id;
  const mainLink = data.link || data.flagUrl || `https://flagcdn.com/w320/${code.toLowerCase()}.png`;
  const flagUrl = data.flagUrl || mainLink;
  const flagThumbUrl =
    data.flagThumbUrl || `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
  const enabled =
    data.enabled === undefined
      ? true
      : data.enabled === true || data.enabled === 'true' || data.enabled === 1;
  return {
    code,
    ...data,
    link: mainLink,
    flagUrl,
    flagThumbUrl,
    enabled
  };
}

function ensureAuthenticated() {
  const uid = getCurrentUid();
  if (!uid) {
    // Retourne un tableau vide au lieu d'exploser; le renderer gèrera le message
    throw Object.assign(new Error('User not authenticated'), { code: 'unauthenticated' });
  }
}
