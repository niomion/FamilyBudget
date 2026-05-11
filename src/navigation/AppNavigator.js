// ЛАБ. 5 + 6: Навігація та відстеження стану автентифікації
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { onAuthStateChanged, auth } from '../firebase/authService';
import { setUser, setInitialized } from '../redux/authSlice';
import { fetchExpenses, fetchBudgetLimits, clearBudgetData } from '../redux/budgetSlice';
import COLORS from '../styles/colors';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import HistoryScreen from '../screens/HistoryScreen';
import BudgetScreen from '../screens/BudgetScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Головна',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={{
          tabBarLabel: 'Додати',
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: focused ? COLORS.primary : COLORS.primaryLight,
              width: 44, height: 44, borderRadius: 22,
              alignItems: 'center', justifyContent: 'center', marginBottom: 4,
            }}>
              <Text style={{ fontSize: 26, color: focused ? COLORS.white : COLORS.primary, lineHeight: 32 }}>+</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'Витрати',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Budget"
        component={BudgetScreen}
        options={{
          tabBarLabel: 'Бюджет',
          tabBarIcon: () => <Text style={{ fontSize: 22 }}>💰</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const dispatch = useDispatch();
  const { user, initialized } = useSelector((state) => state.auth);

  // ЛАБ. 6: Відстеження стану сесії
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Користувач',
        };
        dispatch(setUser(userData));
        dispatch(fetchExpenses(firebaseUser.uid));
        dispatch(fetchBudgetLimits(firebaseUser.uid));
      } else {
        dispatch(setUser(null));
        dispatch(clearBudgetData());
        dispatch(setInitialized());
      }
    });
    return () => unsubscribe();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>💰</Text>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
