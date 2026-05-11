// ЛАБ. 2, 3, 4, 7, 8: Екран додавання витрати
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addExpense } from '../redux/budgetSlice';
import { CATEGORIES } from '../constants/categories';
import COLORS from '../styles/colors';
import commonStyles from '../styles/commonStyles';

export default function AddExpenseScreen() {
  const dispatch = useDispatch();
  // ЛАБ. 8: Отримуємо стан з Redux
  const { user } = useSelector((state) => state.auth);
  const { saving } = useSelector((state) => state.budget);

  // ЛАБ. 4: Локальний стан форми (useState — React API)
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amountFocused, setAmountFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  // ЛАБ. 7: Збереження витрати у Firestore через Redux action
  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert('Увага', 'Будь ласка, оберіть категорію');
      return;
    }
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Увага', 'Введіть коректну суму витрати');
      return;
    }

    const expense = {
      userId: user.uid,
      categoryId: selectedCategory,
      amount: parsedAmount,
      description: description.trim() || CATEGORIES.find((c) => c.id === selectedCategory)?.name,
    };

    try {
      await dispatch(addExpense(expense)).unwrap();
      // Скидаємо форму після успішного збереження
      setAmount('');
      setDescription('');
      setSelectedCategory(null);
      Alert.alert('✅ Збережено!', `Витрата ${parsedAmount.toFixed(2)} ₴ додана`);
    } catch (error) {
      Alert.alert('Помилка', 'Не вдалося зберегти витрату. Перевірте підключення до Firebase.');
    }
  };

  const selectedCat = CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={styles.title}>Нова витрата</Text>
            <Text style={styles.subtitle}>Оберіть категорію та введіть суму</Text>
          </View>

          {/* Поле суми */}
          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Сума витрати</Text>
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                onFocus={() => setAmountFocused(true)}
                onBlur={() => setAmountFocused(false)}
              />
              <Text style={styles.currency}>₴</Text>
            </View>
            {selectedCat && amount ? (
              <Text style={styles.amountHint}>
                {selectedCat.icon} {selectedCat.name}: {parseFloat(amount.replace(',', '.') || 0).toFixed(2)} ₴
              </Text>
            ) : null}
          </View>

          {/* ЛАБ. 2: Вибір категорії — власні компоненти-кнопки */}
          <Text style={[commonStyles.sectionTitle, { marginTop: 8 }]}>Категорія</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBtn,
                    isSelected && {
                      backgroundColor: cat.color,
                      borderColor: cat.color,
                    },
                  ]}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      isSelected && { color: COLORS.white, fontWeight: '700' },
                    ]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Поле опису */}
          <Text style={commonStyles.label}>Опис (необов'язково)</Text>
          <TextInput
            style={[
              commonStyles.input,
              descFocused && commonStyles.inputFocused,
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Наприклад: Супермаркет АТБ"
            placeholderTextColor={COLORS.textMuted}
            onFocus={() => setDescFocused(true)}
            onBlur={() => setDescFocused(false)}
            maxLength={100}
          />

          {/* ЛАБ. 7: Кнопка збереження → Firestore */}
          <TouchableOpacity
            style={[
              commonStyles.buttonPrimary,
              (!selectedCategory || !amount || saving) && styles.disabled,
            ]}
            onPress={handleSave}
            disabled={!selectedCategory || !amount || saving}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={commonStyles.buttonPrimaryText}>
                💾 Зберегти витрату
              </Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
  },
  // Картка суми
  amountCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 0,
  },
  currency: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  amountHint: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textLight,
  },
  // Сітка категорій
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryBtn: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});
