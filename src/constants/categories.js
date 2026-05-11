// ЛАБ. 2: Константи для категорій витрат
// Використовуються по всьому застосунку

export const CATEGORIES = [
  {
    id: 'food',
    name: 'Їжа',
    icon: '🍔',
    color: '#FF6584',
    description: 'Продукти, кафе, ресторани',
  },
  {
    id: 'transport',
    name: 'Транспорт',
    icon: '🚗',
    color: '#6C63FF',
    description: 'Пальне, таксі, громадський транспорт',
  },
  {
    id: 'entertainment',
    name: 'Розваги',
    icon: '🎮',
    color: '#FFD166',
    description: 'Кіно, ігри, відпочинок',
  },
  {
    id: 'health',
    name: "Здоров'я",
    icon: '💊',
    color: '#06D6A0',
    description: 'Ліки, лікарі, аптека',
  },
  {
    id: 'housing',
    name: 'Житло',
    icon: '🏠',
    color: '#118AB2',
    description: 'Оренда, комунальні, ремонт',
  },
  {
    id: 'clothing',
    name: 'Одяг',
    icon: '👗',
    color: '#EF476F',
    description: 'Одяг, взуття, аксесуари',
  },
  {
    id: 'education',
    name: 'Освіта',
    icon: '📚',
    color: '#4ECDC4',
    description: 'Курси, книги, навчання',
  },
  {
    id: 'other',
    name: 'Інше',
    icon: '📦',
    color: '#8D99AE',
    description: 'Інші витрати',
  },
];

export const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
