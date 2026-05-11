// ЛАБ. 7 + 8: Slice для бюджету (Firestore + Redux)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  db,
  collection, addDoc, getDocs, query, where, orderBy,
  doc, setDoc, getDoc, deleteDoc,
} from '../firebase/firestoreService';

// ЛАБ. 7: Завантаження витрат
export const fetchExpenses = createAsyncThunk(
  'budget/fetchExpenses',
  async (userId, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ЛАБ. 7: Додавання витрати
export const addExpense = createAsyncThunk(
  'budget/addExpense',
  async (expense, { rejectWithValue }) => {
    try {
      const newExpense = { ...expense, date: new Date().toISOString() };
      const docRef = await addDoc(collection(db, 'expenses'), newExpense);
      return { id: docRef.id, ...newExpense };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ЛАБ. 7: Видалення витрати
export const deleteExpense = createAsyncThunk(
  'budget/deleteExpense',
  async (expenseId, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
      return expenseId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ЛАБ. 7: Завантаження лімітів
export const fetchBudgetLimits = createAsyncThunk(
  'budget/fetchLimits',
  async (userId, { rejectWithValue }) => {
    try {
      const docRef = doc(db, 'budgets', userId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : {};
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ЛАБ. 7: Збереження ліміту категорії
export const saveBudgetLimit = createAsyncThunk(
  'budget/saveLimit',
  async ({ userId, categoryId, limit }, { rejectWithValue }) => {
    try {
      await setDoc(doc(db, 'budgets', userId), { [categoryId]: Number(limit) }, { merge: true });
      return { categoryId, limit: Number(limit) };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ЛАБ. 8: Budget slice
const budgetSlice = createSlice({
  name: 'budget',
  initialState: {
    expenses: [],
    budgetLimits: {},
    loading: false,
    saving: false,
    error: null,
    filter: 'all',
    selectedMonth: new Date().getMonth(),
    selectedYear: new Date().getFullYear(),
  },
  reducers: {
    setFilter: (state, action) => { state.filter = action.payload; },
    setSelectedMonth: (state, action) => {
      state.selectedMonth = action.payload.month;
      state.selectedYear = action.payload.year;
    },
    clearBudgetData: (state) => {
      state.expenses = [];
      state.budgetLimits = {};
      state.filter = 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.loading = true; })
      .addCase(fetchExpenses.fulfilled, (state, action) => { state.loading = false; state.expenses = action.payload; })
      .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addExpense.pending, (state) => { state.saving = true; })
      .addCase(addExpense.fulfilled, (state, action) => { state.saving = false; state.expenses.unshift(action.payload); })
      .addCase(addExpense.rejected, (state, action) => { state.saving = false; state.error = action.payload; })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e.id !== action.payload);
      })
      .addCase(fetchBudgetLimits.fulfilled, (state, action) => { state.budgetLimits = action.payload; })
      .addCase(saveBudgetLimit.pending, (state) => { state.saving = true; })
      .addCase(saveBudgetLimit.fulfilled, (state, action) => {
        state.saving = false;
        state.budgetLimits[action.payload.categoryId] = action.payload.limit;
      })
      .addCase(saveBudgetLimit.rejected, (state) => { state.saving = false; });
  },
});

export const { setFilter, setSelectedMonth, clearBudgetData } = budgetSlice.actions;
export default budgetSlice.reducer;
