import { readFile } from 'fs/promises'
import path from 'path'
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app'
import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore'

let adminApp
let currentUid = null

function getServiceAccount() {
  const jsonEnv = process.env['FM_SERVICE_ACCOUNT_JSON']
  if (jsonEnv) {
    return JSON.parse(jsonEnv)
  }
  const keyPath =
    process.env['FM_SERVICE_ACCOUNT_PATH'] || path.join(process.cwd(), 'FM-serviceAccountKey.json')
  return readFile(keyPath, 'utf-8').then((raw) => JSON.parse(raw))
}

async function ensureAdmin() {
  if (adminApp) return adminApp
  const serviceAccount = await getServiceAccount()
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
