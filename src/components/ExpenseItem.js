// ЛАБ. 2, 3: Компонент одного запису витрати
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { deleteExpense } from '../redux/budgetSlice';
import { getCategoryById } from '../constants/categories';
import COLORS from '../styles/colors';

// ЛАБ. 2: Компонент з props та обробкою подій
export default function ExpenseItem({ expense, showDeleteButton = false }) {
  const dispatch = useDispatch();
  const category = getCategoryById(expense.categoryId);

  // Форматування дати
  const date = new Date(expense.date);
  const dateStr = date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'short',
  });
  const timeStr = date.toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // ЛАБ. 7: Видалення витрати з Firestore через Redux
  const handleDelete = () => {
    Alert.alert(
      'Видалити витрату?',
      `${expense.description || category.name} — ${expense.amount} ₴`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => dispatch(deleteExpense(expense.id)),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Іконка категорії */}
      <View style={[styles.iconBg, { backgroundColor: category.color + '20' }]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>

      {/* Опис та категорія */}
      <View style={styles.info}>
        <Text style={styles.description} numberOfLines={1}>
          {expense.description || category.name}
        </Text>
        <View style={styles.row}>
          <Text style={[styles.categoryBadge, { color: category.color }]}>
            {category.name}
          </Text>
          <Text style={styles.dateText}>
            {dateStr} · {timeStr}
          </Text>
        </View>
      </View>

      {/* Сума та кнопка видалення */}
      <View style={styles.right}>
        <Text style={styles.amount}>-{Number(expense.amount).toFixed(2)} ₴</Text>
        {showDeleteButton && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ЛАБ. 3: Стилі компоненту в окремому StyleSheet
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBg: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 4,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
