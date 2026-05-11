// ЛАБ. 6 + 8: Slice для автентифікації користувача
// createAsyncThunk — для асинхронних дій (реєстрація, вхід, вихід)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

// ЛАБ. 6: Реєстрація нового користувача через Firebase Auth
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        name,
      };
    } catch (error) {
      // Перекладаємо Firebase помилки
      let message = 'Помилка реєстрації';
      if (error.code === 'auth/email-already-in-use') message = 'Цей email вже використовується';
      if (error.code === 'auth/weak-password') message = 'Пароль занадто слабкий (мін. 6 символів)';
      if (error.code === 'auth/invalid-email') message = 'Невірний формат email';
      return rejectWithValue(message);
    }
  }
);

// ЛАБ. 6: Вхід існуючого користувача
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: credential.user.uid,
        email: credential.user.email,
        name: credential.user.displayName,
      };
    } catch (error) {
      let message = 'Помилка входу';
      if (error.code === 'auth/user-not-found') message = 'Користувача не знайдено';
      if (error.code === 'auth/wrong-password') message = 'Невірний пароль';
      if (error.code === 'auth/invalid-email') message = 'Невірний формат email';
      if (error.code === 'auth/too-many-requests') message = 'Забагато спроб. Спробуйте пізніше';
      return rejectWithValue(message);
    }
  }
);

// Вихід з акаунту
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await signOut(auth);
});

// ЛАБ. 8: authSlice — частина Redux Store
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,        // Дані поточного користувача
    loading: false,    // Стан завантаження
    error: null,       // Повідомлення про помилку
    initialized: false,// Чи перевірена сесія Firebase
  },
  reducers: {
    // Встановлення користувача (з onAuthStateChanged)
    setUser: (state, action) => {
      state.user = action.payload;
      state.initialized = true;
    },
    // Очищення помилки
    clearError: (state) => {
      state.error = null;
    },
    setInitialized: (state) => {
      state.initialized = true;
    },
  },
  // Обробка результатів асинхронних дій
  extraReducers: (builder) => {
    builder
      // Реєстрація
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Вхід
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Вихід
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;
