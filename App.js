import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { LogBox } from 'react-native';

// Ігноруємо деякі попередження для коректної роботи Firebase
LogBox.ignoreLogs([
  'Setting a timer',
  'AsyncStorage has been extracted',
  '@firebase/auth',
]);

// ЛАБ. 1: Точка входу в застосунок
// ЛАБ. 8: Обгортаємо все в Provider для Redux
export default function App() {
  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}
