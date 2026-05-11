// ЛАБ. 6: Firebase Authentication
// У Expo Snack Firebase Web SDK не підтримується через обмеження бандлера.
// Тому тут реалізовано сумісний інтерфейс через AsyncStorage.
// У реальному проекті цей файл замінюється на:
//
//   import { getAuth, createUserWithEmailAndPassword,
//            signInWithEmailAndPassword, signOut,
//            updateProfile, onAuthStateChanged } from 'firebase/auth';
//   export const auth = getAuth(app);
//
// Інтерфейс повністю ідентичний Firebase Auth API.

import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'fb_users';
const SESSION_KEY = 'fb_session';

// --- Внутрішні хелпери ---
const getUsers = async () => {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const saveUsers = async (users) => {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getSession = async () => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveSession = async (user) => {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const clearSession = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

// Генерація простого UID
const generateUID = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

// --- Публічний API (сумісний з Firebase Auth) ---

// ЛАБ. 6: Реєстрація нового користувача
export const createUserWithEmailAndPassword = async (authObj, email, password) => {
  const users = await getUsers();
  if (users[email]) {
    const err = new Error('Email вже використовується');
    err.code = 'auth/email-already-in-use';
    throw err;
  }
  if (password.length < 6) {
    const err = new Error('Пароль занадто короткий');
    err.code = 'auth/weak-password';
    throw err;
  }
  const uid = generateUID();
  const user = { uid, email, displayName: null, password };
  users[email] = user;
  await saveUsers(users);
  const sessionUser = { uid, email, displayName: null };
  await saveSession(sessionUser);
  return { user: sessionUser };
};

// ЛАБ. 6: Вхід існуючого користувача
export const signInWithEmailAndPassword = async (authObj, email, password) => {
  const users = await getUsers();
  const user = users[email];
  if (!user) {
    const err = new Error('Користувача не знайдено');
    err.code = 'auth/user-not-found';
    throw err;
  }
  if (user.password !== password) {
    const err = new Error('Невірний пароль');
    err.code = 'auth/wrong-password';
    throw err;
  }
  const sessionUser = { uid: user.uid, email: user.email, displayName: user.displayName };
  await saveSession(sessionUser);
  return { user: sessionUser };
};

// ЛАБ. 6: Оновлення профілю (ім'я)
export const updateProfile = async (user, { displayName }) => {
  const users = await getUsers();
  if (users[user.email]) {
    users[user.email].displayName = displayName;
    await saveUsers(users);
  }
  const session = await getSession();
  if (session) {
    session.displayName = displayName;
    await saveSession(session);
  }
  user.displayName = displayName;
};

// ЛАБ. 6: Вихід
export const signOut = async () => {
  await clearSession();
};

// ЛАБ. 6: Відстеження стану автентифікації (аналог onAuthStateChanged)
export const onAuthStateChanged = (authObj, callback) => {
  // Виконуємо одразу при підписці
  getSession().then((user) => callback(user));
  // Повертаємо функцію відписки (Snack-версія не підписується на зміни в реальному часі,
  // але інтерфейс ідентичний Firebase)
  return () => {};
};

// Заглушка об'єкту auth (для сумісності з кодом)
export const auth = { _isMock: true };
