import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

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
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
// Force the account chooser even si un compte est déjà connu
provider.setCustomParameters({ prompt: 'select_account' });

export async function loginGoogle() {
  const result = await signInWithPopup(auth, provider);
  const user = result.user;
  const token = await user.getIdToken();
  await window.api?.auth?.setToken?.(token);
  await window.api?.auth?.users?.save?.({
    uid: user.uid,
    displayName: user.displayName,
    photoURL: user.photoURL,
    email: user.email
  });
  return currentUser();
}

export function currentUser() {
  const u = auth.currentUser;
  if (!u) return null;
  return {
    uid: u.uid,
    displayName: u.displayName,
    photoURL: u.photoURL,
    email: u.email
  };
}

export async function logoutGoogle() {
  await signOut(auth);
  await window.api?.auth?.clear?.();
  // Efface toute session résiduelle pour éviter une reconnexion silencieuse
  // (Google forcera le sélecteur grâce au prompt=select_account plus haut)
}

export function subscribeAuth(cb) {
  return onAuthStateChanged(auth, async (u) => {
    if (u) {
      try {
        const token = await u.getIdToken();
        await window.api?.auth?.setToken?.(token);
        await window.api?.auth?.users?.save?.({
          uid: u.uid,
          displayName: u.displayName,
          photoURL: u.photoURL,
          email: u.email
        });
      } catch (err) {
        console.error('[auth] token sync failed', err);
      }
    } else {
      await window.api?.auth?.clear?.();
    }
    cb?.(currentUser());
  });
}
