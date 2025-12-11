import { getApps, initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyANc0iQA97lMHuRMkgUXol7pdmQ7U19FwI',
  authDomain: 'flag-masters-geo.firebaseapp.com',
  projectId: 'flag-masters-geo',
  storageBucket: 'flag-masters-geo.firebasestorage.app',
  messagingSenderId: '729351393002',
  appId: '1:729351393002:web:72a2caffaaadda21b09193',
  measurementId: 'G-86195LTSNQ'
}

export function getFirebaseApp() {
  // Initialise l'app Firebase côté renderer (sans clé admin)
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
}

const app = getFirebaseApp()
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
// Force the account chooser even si un compte est déjà connu
provider.setCustomParameters({ prompt: 'select_account' })

export async function loginGoogle() {
  await signInWithPopup(auth, provider)
  return currentUser()
}

export function currentUser() {
  const u = auth.currentUser
  if (!u) return null
  return {
    uid: u.uid,
    displayName: u.displayName,
    photoURL: u.photoURL,
    email: u.email
  }
}

export async function logoutGoogle() {
  await signOut(auth)
  await window.api?.auth?.clear?.()
  // Efface toute session résiduelle pour éviter une reconnexion silencieuse
  // (Google forcera le sélecteur grâce au prompt=select_account plus haut)
}

export function subscribeAuth(cb) {
  return onAuthStateChanged(auth, async (u) => {
    if (!u) {
      await window.api?.auth?.clear?.()
    }
    cb?.(currentUser())
  })
}
