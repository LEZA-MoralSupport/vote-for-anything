import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// ============================================================
// PASTE YOUR OWN FIREBASE PROJECT CONFIG HERE.
// Firebase console -> Project settings -> General -> Your apps -> SDK setup and configuration
// ============================================================
const firebaseConfig = {

};


const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
