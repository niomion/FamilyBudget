// ЛАБ. 8: Налаштування Redux Store
// Redux Toolkit — сучасний підхід до управління станом

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import budgetReducer from './budgetSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,     // Стан автентифікації (лаб. 6)
    budget: budgetReducer, // Стан бюджету та витрат (лаб. 7)
  },
  // Дозволяємо нон-серіалізовані значення (для Firebase об'єктів)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
