import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// ============================================
// 🔥 Firebase Configuration
// ============================================
// ⚠️ IMPORTANT: Replace the placeholder values below with your actual
// Firebase project config from:
// Firebase Console > Project Settings > General > Your apps > Web app
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyDemo-REPLACE-WITH-YOUR-ACTUAL-API-KEY",
  authDomain: "shehab-9687f.firebaseapp.com",
  databaseURL: "https://shehab-9687f-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "shehab-9687f",
  storageBucket: "shehab-9687f.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference
export const db = getDatabase(app);

// Export for use in other components
export default app;
