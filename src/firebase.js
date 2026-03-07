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
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
