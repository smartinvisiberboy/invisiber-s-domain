import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getFirestore, type Firestore } from "firebase-admin/firestore"

/**
 * Server-only Firebase Admin initialization.
 *
 * Expects the following environment variables:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL
 * - FIREBASE_PRIVATE_KEY   (with literal "\\n" newlines, which we normalize)
 * - FIREBASE_STORAGE_BUCKET (e.g. your-project.appspot.com)
 */

let cachedApp: App | null = null

export function getAdminStatus() {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

  const missing: string[] = []
  if (!projectId) missing.push('FIREBASE_PROJECT_ID')
  if (!clientEmail) missing.push('FIREBASE_CLIENT_EMAIL')
  if (!privateKey) missing.push('FIREBASE_PRIVATE_KEY')
  if (!storageBucket) missing.push('FIREBASE_STORAGE_BUCKET')

  return {
    configured: missing.length === 0,
    missing,
  }
}

function getAdminApp(): App {
  if (cachedApp) return cachedApp

  const existing = getApps()
  if (existing.length > 0) {
    cachedApp = existing[0]
    return cachedApp
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET

  if (!projectId || !clientEmail || !privateKey) {
    // Throw a clear, non-sensitive error so callers can respond appropriately.
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.",
    )
  }

  cachedApp = initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  })
  return cachedApp
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp())
}

export const APPLICATIONS_COLLECTION = "applications"
