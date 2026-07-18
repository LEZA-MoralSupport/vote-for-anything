import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// ============================================================
// PASTE YOUR OWN FIREBASE PROJECT CONFIG HERE.
// Firebase console -> Project settings -> General -> Your apps -> SDK setup and configuration
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyAdZrY6eZIBqkTI31JtjOtzwgwmkY5AgYI",
  authDomain: "vote-for-anything.firebaseapp.com",
  projectId: "vote-for-anything",
  storageBucket: "vote-for-anything.firebasestorage.app", 
  messagingSenderId: "537062239415",
  appId: "1:537062239415:web:935cb0cddc26df683b3132",
  measurementId: "G-LE31VPVBFW"
};


const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const storage = getStorage(app)
