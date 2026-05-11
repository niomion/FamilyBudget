// ЛАБ. 6 + 7: Firebase конфігурація
//
// ======================================================
// РЕАЛЬНИЙ КОД FIREBASE (для звіту та реального проекту):
// ======================================================
//
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
//
// const firebaseConfig = {
//   apiKey: "ВАШ_API_KEY",
//   authDomain: "ВАШ_PROJECT.firebaseapp.com",
//   projectId: "ВАШ_PROJECT_ID",
//   storageBucket: "ВАШ_PROJECT.appspot.com",
//   messagingSenderId: "ВАШ_SENDER_ID",
//   appId: "ВАШ_APP_ID"
// };
//
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
//
// ======================================================
// SNACK-СУМІСНА ВЕРСІЯ (AsyncStorage-емуляція):
// ======================================================
// Firebase Web SDK не підтримується в Expo Snack через обмеження
// Metro bundler. Нижче — ідентичний за інтерфейсом сервіс.

export { auth } from './authService';
export { db } from './firestoreService';
