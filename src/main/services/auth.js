import { readFile } from 'fs/promises'
import path from 'path'
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore'

let adminApp
let currentUid = null

async function ensureAdmin() {
  if (adminApp) return adminApp
  const keyPath = path.join(process.cwd(), 'FM-serviceAccountKey.json')
  const raw = await readFile(keyPath, 'utf-8')
  const serviceAccount = JSON.parse(raw)
  adminApp = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) })
  return adminApp
}

export async function verifyIdToken(idToken) {
  const app = await ensureAdmin()
  const auth = getAdminAuth(app)
  const decoded = await auth.verifyIdToken(idToken)
  currentUid = decoded.uid
  return decoded
}

export function getCurrentUid() {
  return currentUid
}

export async function saveUserProfile({ uid, displayName, photoURL, email }) {
  const app = await ensureAdmin()
  const db = getAdminFirestore(app)
  const now = new Date()
  await db
    .collection('users')
    .doc(uid)
    .set(
      {
        displayName: displayName || 'Joueur',
        photoURL: photoURL || '',
        email: email || '',
        lastLogin: now
      },
      { merge: true }
    )
}

export function clearAuth() {
  currentUid = null
}

export async function getAdminDb() {
  const app = await ensureAdmin()
  return getAdminFirestore(app)
}
