// ЛАБ. 6 + 8: Slice для автентифікації
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  auth,
} from '../firebase/authService';

// ЛАБ. 6: Реєстрація
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName: name });
      return { uid: credential.user.uid, email, name };
    } catch (error) {
      let message = 'Помилка реєстрації';
      if (error.code === 'auth/email-already-in-use') message = 'Цей email вже використовується';
      if (error.code === 'auth/weak-password') message = 'Пароль занадто слабкий (мін. 6 символів)';
      return rejectWithValue(message);
    }
  }
);

// ЛАБ. 6: Вхід
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
      return rejectWithValue(message);
    }
  }
);

// Вихід
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await signOut();
});

// ЛАБ. 8: Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.initialized = true;
    },
    clearError: (state) => { state.error = null; },
    setInitialized: (state) => { state.initialized = true; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(logoutUser.fulfilled, (state) => { state.user = null; });
  },
});

export const { setUser, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;
