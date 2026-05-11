// ЛАБ. 2, 3: Компонент прогрес-бару бюджету категорії
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import COLORS from '../styles/colors';

// ЛАБ. 2: Власний компонент із деструктуризацією props
export default function BudgetProgress({ category, spent, limit }) {
  const { name, icon, color } = category;

  const hasLimit = limit > 0;
  const percentage = hasLimit ? Math.min((spent / limit) * 100, 100) : 0;
  const remaining = hasLimit ? limit - spent : 0;
  const isOverBudget = hasLimit && spent > limit;
  const isNearLimit = hasLimit && percentage >= 80 && !isOverBudget;

  // Вибір кольору статус-індикатора
  const statusColor = isOverBudget
    ? COLORS.danger
    : isNearLimit
    ? COLORS.warning
    : color;

  return (
    <View style={styles.container}>
      {/* Заголовок рядку */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.amounts}>
          <Text style={[styles.spent, isOverBudget && { color: COLORS.danger }]}>
            {spent.toFixed(2)} ₴
          </Text>
          {hasLimit && (
            <Text style={styles.limit}> / {limit.toFixed(2)} ₴</Text>
          )}
        </View>
      </View>

      {/* Прогрес-бар */}
      {hasLimit && (
        <>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${percentage}%`,
                  backgroundColor: statusColor,
                },
              ]}
            />
          </View>
          {/* Статус */}
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isOverBudget
                ? `⚠️ Перевищення на ${Math.abs(remaining).toFixed(2)} ₴`
                : isNearLimit
                ? `⚡ Залишок: ${remaining.toFixed(2)} ₴`
                : `✅ Залишок: ${remaining.toFixed(2)} ₴`}
            </Text>
            <Text style={styles.percentText}>{percentage.toFixed(0)}%</Text>
          </View>
        </>
      )}

      {!hasLimit && (
        <Text style={styles.noLimit}>Ліміт не встановлено</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  spent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  limit: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  progressBg: {
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  noLimit: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
