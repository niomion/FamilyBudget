// ЛАБ. 2, 3, 6: Екран реєстрації користувача
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../redux/authSlice';
import COLORS from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [focused, setFocused] = useState('');

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) {
      Alert.alert('Помилка реєстрації', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) },
      ]);
    }
  }, [error]);

  const handleRegister = () => {
    // Валідація форми
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Увага', "Будь ласка, заповніть всі поля");
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Увага', "Ім'я повинно містити мінімум 2 символи");
      return;
    }
    if (password.length < 6) {
      Alert.alert('Увага', 'Пароль повинен містити мінімум 6 символів');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Увага', 'Паролі не співпадають');
      return;
    }

    // ЛАБ. 6: Реєстрація через Firebase Auth
    dispatch(registerUser({ email: email.trim(), password, name: name.trim() }));
  };

  const inputStyle = (field) => [
    commonStyles.input,
    focused === field && commonStyles.inputFocused,
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👨‍👩‍👧‍👦</Text>
          <Text style={styles.title}>Створити акаунт</Text>
          <Text style={styles.subtitle}>Почніть контролювати сімейний бюджет</Text>
        </View>

        {/* ЛАБ. 3: Форма реєстрації */}
        <View style={styles.form}>
          <Text style={commonStyles.label}>Ваше ім'я</Text>
          <TextInput
            style={inputStyle('name')}
            value={name}
            onChangeText={setName}
            placeholder="Іван Петренко"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="words"
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused('')}
          />

          <Text style={commonStyles.label}>Email адреса</Text>
          <TextInput
            style={inputStyle('email')}
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused('')}
          />

          <Text style={commonStyles.label}>Пароль</Text>
          <TextInput
            style={inputStyle('password')}
            value={password}
            onChangeText={setPassword}
            placeholder="Мінімум 6 символів"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused('')}
          />

          <Text style={commonStyles.label}>Підтвердіть пароль</Text>
          <TextInput
            style={inputStyle('confirm')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Повторіть пароль"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused('')}
          />

          {/* Індикатор сили пароля */}
          {password.length > 0 && (
            <View style={styles.passwordStrength}>
              <View style={[
                styles.strengthBar,
                { backgroundColor: password.length >= 8 ? COLORS.success : password.length >= 6 ? COLORS.warning : COLORS.danger }
              ]} />
              <Text style={styles.strengthText}>
                {password.length >= 8 ? '✅ Надійний пароль' : password.length >= 6 ? '⚠️ Середній пароль' : '❌ Слабкий пароль'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[commonStyles.buttonPrimary, loading && { opacity: 0.7 }, { marginTop: 8 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={commonStyles.buttonPrimaryText}>Зареєструватися</Text>
            )}
          </TouchableOpacity>

          {/* ЛАБ. 5: Навігація назад на Login */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.linkText}>
              Вже є акаунт? <Text style={styles.link}>Увійти</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 28,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -8,
  },
  strengthBar: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  strengthText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  linkText: {
    color: COLORS.textLight,
    fontSize: 15,
  },
  link: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
