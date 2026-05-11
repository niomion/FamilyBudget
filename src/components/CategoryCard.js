// ЛАБ. 2, 3: Компонент картки категорії (власний компонент)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../styles/colors';

// ЛАБ. 2: Функціональний компонент із props
export default function CategoryCard({ category }) {
  const { name, icon, color, spent, limit } = category;
  const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
  const isOverBudget = limit > 0 && spent > limit;

  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      {/* Іконка категорії */}
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      {/* Назва та сума */}
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={[styles.amount, isOverBudget && styles.overBudget]}>
        {spent.toFixed(0)} ₴
      </Text>

      {/* Прогрес-бар ліміту */}
      {limit > 0 ? (
        <>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: isOverBudget ? COLORS.danger : color,
                },
              ]}
            />
          </View>
          <Text style={styles.limitText}>
            {isOverBudget ? '⚠️ ' : ''}{limit.toFixed(0)} ₴
          </Text>
        </>
      ) : (
        <Text style={styles.noLimitText}>Без ліміту</Text>
      )}
    </View>
  );
}

// ЛАБ. 3: StyleSheet — кращий підхід, ніж inline стилі
const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 130,
    borderTopWidth: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  overBudget: {
    color: COLORS.danger,
  },
  progressBg: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  limitText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  noLimitText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});
