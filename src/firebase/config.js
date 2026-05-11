// ЛАБ. 6: Налаштування Firebase
// ВАЖЛИВО: Замініть значення нижче на ваші власні з консолі Firebase!
// Як отримати config: https://console.firebase.google.com
// → Ваш проект → Project Settings → Your apps → Firebase SDK snippet

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBS9MN7WBfqlLkfUW0Qn9zpEjV5He4f5xs",
  authDomain: "familybudget-18a2b.firebaseapp.com",
  projectId: "familybudget-18a2b",
  storageBucket: "familybudget-18a2b.firebasestorage.app",
  messagingSenderId: "965715935597",
  appId: "1:965715935597:web:1cc21df1eacee6f82eda64",
  measurementId: "G-ZH3K8WFHXC"
};

// Ініціалізація — перевіряємо, чи вже ініціалізовано (для hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// ЛАБ. 6: Firebase Authentication
export const auth = getAuth(app);

// ЛАБ. 7: Cloud Firestore
export const db = getFirestore(app);

export default app;
