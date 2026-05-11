// ЛАБ. 2, 3, 7, 8: Екран управління бюджетом (ліміти по категоріях)
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { saveBudgetLimit } from '../redux/budgetSlice';
import { CATEGORIES } from '../constants/categories';
import COLORS from '../styles/colors';
import BudgetProgress from '../components/BudgetProgress';

export default function BudgetScreen() {
  const dispatch = useDispatch();
  // ЛАБ. 8: Redux state
  const { user } = useSelector((state) => state.auth);
  const { expenses, budgetLimits, saving } = useSelector((state) => state.budget);

  // Локальний стан редагування
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Витрати поточного місяця
  const now = new Date();
  const monthExpenses = useMemo(() =>
    expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }),
    [expenses]
  );

  // ЛАБ. 7: Збереження ліміту у Firestore
  const handleSaveLimit = async (categoryId) => {
    const numValue = parseFloat(editValue.replace(',', '.'));
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Увага', 'Введіть коректну суму');
      return;
    }
    try {
      await dispatch(saveBudgetLimit({
        userId: user.uid,
        categoryId,
        limit: numValue,
      })).unwrap();
      setEditingId(null);
      setEditValue('');
    } catch {
      Alert.alert('Помилка', 'Не вдалося зберегти ліміт');
    }
  };

  const handleEdit = (categoryId, currentLimit) => {
    setEditingId(categoryId);
    setEditValue(currentLimit > 0 ? String(currentLimit) : '');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  // Загальна статистика
  const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudget = Object.values(budgetLimits).reduce((sum, v) => sum + Number(v || 0), 0);
  const categoriesOverBudget = CATEGORIES.filter((cat) => {
    const spent = monthExpenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const limit = Number(budgetLimits[cat.id] || 0);
    return limit > 0 && spent > limit;
  });

  // ЛАБ. 2: Рендер кожного рядку категорії
  const renderCategory = ({ item: cat }) => {
    const spent = monthExpenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const limit = Number(budgetLimits[cat.id] || 0);
    const isEditing = editingId === cat.id;

    return (
      <View style={styles.categoryRow}>
        {/* Прогрес-бар (власний компонент — ЛАБ. 2) */}
        <BudgetProgress category={cat} spent={spent} limit={limit} />

        {/* Блок редагування */}
        <View style={styles.editRow}>
          {isEditing ? (
            // Режим редагування
            <>
              <TextInput
                style={styles.limitInput}
                value={editValue}
                onChangeText={setEditValue}
                placeholder="Введіть ліміт ₴"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="decimal-pad"
                autoFocus
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => handleSaveLimit(cat.id)}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.saveBtnText}>✓ Зберегти</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.cancelBtnText}>✕</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Режим перегляду
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleEdit(cat.id, limit)}
            >
              <Text style={styles.editBtnText}>
                ✏️ {limit > 0 ? `Змінити (${limit} ₴)` : 'Встановити ліміт'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ЛАБ. 2: FlatList зі заголовком */}
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* Заголовок */}
              <View style={styles.header}>
                <Text style={styles.title}>Бюджет</Text>
                <Text style={styles.subtitle}>Встановіть ліміти по категоріях</Text>
              </View>

              {/* Зведена картка */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{totalBudget.toFixed(0)} ₴</Text>
                    <Text style={styles.summaryLabel}>Загальний бюджет</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: COLORS.danger }]}>
                      {totalSpent.toFixed(0)} ₴
                    </Text>
                    <Text style={styles.summaryLabel}>Витрачено</Text>
                  </View>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryItem}>
                    <Text style={[
                      styles.summaryValue,
                      { color: totalBudget - totalSpent >= 0 ? COLORS.success : COLORS.danger }
                    ]}>
                      {(totalBudget - totalSpent).toFixed(0)} ₴
                    </Text>
                    <Text style={styles.summaryLabel}>Залишок</Text>
                  </View>
                </View>

                {categoriesOverBudget.length > 0 && (
                  <View style={styles.warningBanner}>
                    <Text style={styles.warningText}>
                      ⚠️ Перевищення у {categoriesOverBudget.length} {
                        categoriesOverBudget.length === 1 ? 'категорії' : 'категоріях'
                      }: {categoriesOverBudget.map((c) => c.name).join(', ')}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.listTitle}>Ліміти по категоріях</Text>
            </>
          }
          ListFooterComponent={<View style={{ height: 30 }} />}
          contentContainerStyle={styles.listContent}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
  // Зведена картка
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  warningBanner: {
    backgroundColor: COLORS.warningLight,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    fontWeight: '500',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  // Рядок категорії
  categoryRow: {
    marginBottom: 4,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 8,
  },
  limitInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.white,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 90,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  cancelBtn: {
    backgroundColor: COLORS.divider,
    borderRadius: 12,
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
  editBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  editBtnText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
});
