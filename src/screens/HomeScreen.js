// ЛАБ. 2, 3, 4, 7, 8: Головний екран — дашборд
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice';
import { fetchExpenses, fetchBudgetLimits } from '../redux/budgetSlice';
import COLORS from '../styles/colors';
import { CATEGORIES } from '../constants/categories';
import CategoryCard from '../components/CategoryCard';
import ExpenseItem from '../components/ExpenseItem';

export default function HomeScreen() {
  const dispatch = useDispatch();
  // ЛАБ. 8: Читання даних з Redux Store
  const { user } = useSelector((state) => state.auth);
  const { expenses, budgetLimits, loading } = useSelector((state) => state.budget);

  // ЛАБ. 4: Обчислення даних поточного місяця (API Date)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Фільтрація витрат поточного місяця
  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Загальна сума витрат
  const totalSpent = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Загальний бюджет
  const totalBudget = Object.values(budgetLimits).reduce(
    (sum, v) => sum + Number(v || 0),
    0
  );
  const budgetPercentage = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isOverBudget = totalBudget > 0 && totalSpent > totalBudget;

  // Витрати по категоріях для карток
  const categoryData = CATEGORIES.map((cat) => {
    const spent = monthExpenses
      .filter((e) => e.categoryId === cat.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return { ...cat, spent, limit: Number(budgetLimits[cat.id] || 0) };
  }).filter((c) => c.spent > 0 || c.limit > 0); // Показуємо тільки активні

  const monthName = now.toLocaleString('uk-UA', { month: 'long', year: 'numeric' });
  const recentExpenses = expenses.slice(0, 5);

  // ЛАБ. 4: Pull-to-refresh (API RefreshControl)
  const handleRefresh = () => {
    if (user) {
      dispatch(fetchExpenses(user.uid));
      dispatch(fetchBudgetLimits(user.uid));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Шапка */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Привіт, {user?.name?.split(' ')[0] || 'Користувач'}! 👋
            </Text>
            <Text style={styles.monthText} numberOfLines={1}>
              {monthName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => dispatch(logoutUser())}
            style={styles.logoutBtn}
          >
            <Text style={styles.logoutText}>Вийти</Text>
          </TouchableOpacity>
        </View>

        {/* Картка загального бюджету */}
        <View style={[styles.summaryCard, isOverBudget && styles.summaryCardDanger]}>
          <Text style={styles.summaryLabel}>Витрачено цього місяця</Text>
          <Text style={styles.summaryAmount}>{totalSpent.toFixed(2)} ₴</Text>

          {totalBudget > 0 ? (
            <>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${budgetPercentage}%`,
                      backgroundColor: isOverBudget
                        ? COLORS.danger
                        : 'rgba(255,255,255,0.9)',
                    },
                  ]}
                />
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summarySubtext}>
                  Бюджет: {totalBudget.toFixed(2)} ₴
                </Text>
                <Text style={[styles.summarySubtext, isOverBudget && { color: '#FFD6D6' }]}>
                  {isOverBudget
                    ? `⚠️ -${(totalSpent - totalBudget).toFixed(2)} ₴`
                    : `✅ +${(totalBudget - totalSpent).toFixed(2)} ₴`}
                </Text>
              </View>
            </>
          ) : (
            <Text style={styles.summarySubtext}>
              💡 Встановіть ліміти у вкладці «Бюджет»
            </Text>
          )}

          {/* Міні-статистика */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthExpenses.length}</Text>
              <Text style={styles.statLabel}>витрат</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {monthExpenses.length > 0
                  ? (totalSpent / monthExpenses.length).toFixed(0)
                  : '0'}
              </Text>
              <Text style={styles.statLabel}>середня ₴</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {new Set(monthExpenses.map((e) => e.categoryId)).size}
              </Text>
              <Text style={styles.statLabel}>категорій</Text>
            </View>
          </View>
        </View>

        {/* Категорії з витратами */}
        {categoryData.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Категорії</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
            >
              {categoryData.map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Останні витрати */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Останні витрати</Text>
        </View>

        {recentExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>Витрат ще немає</Text>
            <Text style={styles.emptyText}>
              Натисніть «+» внизу, щоб додати першу витрату
            </Text>
          </View>
        ) : (
          recentExpenses.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} />
          ))
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
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
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  monthText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  logoutText: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  summaryCardDanger: {
    backgroundColor: COLORS.danger,
    shadowColor: COLORS.danger,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  summaryAmount: {
    color: COLORS.white,
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: -1,
    marginBottom: 18,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summarySubtext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-around',
    marginTop: 4,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  categoryList: {
    paddingLeft: 20,
    paddingRight: 8,
    paddingBottom: 4,
    marginBottom: 24,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
