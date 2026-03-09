// ============================================================
// FIREBASE CONFIGURATION
// ============================================================
// Before running this app, fill in your Firebase project config below.
//
// Steps:
//  1. Go to https://console.firebase.google.com
//  2. Create or open your "life-built-app" project
//  3. Project Settings → General → Your apps → Web app → SDK setup
//  4. Copy the firebaseConfig values into this file
//  5. Enable Authentication: Email/Password + Google
//  6. Enable Firestore Database (start in test mode)
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
 apiKey: "AIzaSyAyLPqPSgnNltR-eIWqvCTANgF00qHCYPA",
  authDomain: "life-built-app.firebaseapp.com",
  projectId: "life-built-app",
  storageBucket: "life-built-app.firebasestorage.app",
  messagingSenderId: "113594088373",
  appId: "1:113594088373:web:9d1d00f34ca8b467fcb7fc",
  measurementId: "G-6N3813KNJJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
