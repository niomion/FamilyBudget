// ЛАБ. 2, 3, 4, 7, 8: Екран історії витрат
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter } from '../redux/budgetSlice';
import { CATEGORIES } from '../constants/categories';
import COLORS from '../styles/colors';
import ExpenseItem from '../components/ExpenseItem';

const MONTHS_UK = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

export default function HistoryScreen() {
  const dispatch = useDispatch();
  // ЛАБ. 8: Redux state
  const { expenses, filter } = useSelector((state) => state.budget);

  // ЛАБ. 4: Локальний стан навігації по місяцях
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  // Навігація: попередній місяць
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  // Навігація: наступний місяць
  const nextMonth = () => {
    const now = new Date();
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // ЛАБ. 4: useMemo — оптимізація обчислень (React API)
  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      const monthMatch =
        d.getMonth() === viewMonth && d.getFullYear() === viewYear;
      const categoryMatch = filter === 'all' || e.categoryId === filter;
      return monthMatch && categoryMatch;
    });
  }, [expenses, viewMonth, viewYear, filter]);

  // Сума відфільтрованих витрат
  const totalFiltered = filtered.reduce((sum, e) => sum + Number(e.amount), 0);

  // Чи можна перейти до наступного місяця?
  const now = new Date();
  const canGoNext = !(viewYear === now.getFullYear() && viewMonth === now.getMonth());

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Витрати</Text>
        {filtered.length > 0 && (
          <Text style={styles.totalAmount}>-{totalFiltered.toFixed(2)} ₴</Text>
        )}
      </View>

      {/* Навігація по місяцях */}
      <View style={styles.monthNav}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Text style={styles.navBtnText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.monthLabel}>
          <Text style={styles.monthText}>
            {MONTHS_UK[viewMonth]} {viewYear}
          </Text>
          <Text style={styles.countText}>{filtered.length} записів</Text>
        </View>
        <TouchableOpacity
          onPress={nextMonth}
          style={[styles.navBtn, !canGoNext && styles.navBtnDisabled]}
          disabled={!canGoNext}
        >
          <Text style={[styles.navBtnText, !canGoNext && { color: COLORS.textMuted }]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* ЛАБ. 2: Фільтр по категоріях (ScrollView + TouchableOpacity) */}
      <View>
        <FlatList
          data={[{ id: 'all', name: 'Всі', icon: '📊', color: COLORS.primary }, ...CATEGORIES]}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => {
            const isActive = filter === item.id;
            return (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isActive && { backgroundColor: item.color, borderColor: item.color },
                ]}
                onPress={() => dispatch(setFilter(item.id))}
              >
                <Text style={styles.filterIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.filterText,
                    isActive && { color: COLORS.white, fontWeight: '700' },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ЛАБ. 2: FlatList — ефективний рендер списку */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExpenseItem expense={item} showDeleteButton={true} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>Витрат немає</Text>
            <Text style={styles.emptyText}>
              {filter !== 'all'
                ? 'Немає витрат у цій категорії за обраний місяць'
                : 'У цьому місяці витрат ще немає'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.danger,
  },
  // Навігація по місяцях
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 8,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    backgroundColor: COLORS.divider,
  },
  navBtnText: {
    fontSize: 24,
    color: COLORS.primary,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  monthLabel: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  countText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Фільтри
  filterList: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    gap: 6,
    marginRight: 8,
  },
  filterIcon: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 20,
  },
  // Порожній стан
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
