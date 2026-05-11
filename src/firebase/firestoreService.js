// ЛАБ. 7: Cloud Firestore
// У Expo Snack Firebase не підтримується, тому реалізовано
// сумісний інтерфейс через AsyncStorage.
// У реальному проекті замінюється на:
//
//   import { getFirestore, collection, addDoc, getDocs,
//            query, where, orderBy, doc, setDoc,
//            getDoc, deleteDoc } from 'firebase/firestore';
//   export const db = getFirestore(app);
//
// Всі функції мають ідентичні сигнатури з Firebase Firestore API.

import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Внутрішні хелпери ---
const readCollection = async (collectionName) => {
  try {
    const raw = await AsyncStorage.getItem(`col_${collectionName}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const writeCollection = async (collectionName, data) => {
  await AsyncStorage.setItem(`col_${collectionName}`, JSON.stringify(data));
};

const generateDocId = () =>
  Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

// --- Публічний API (сумісний з Firestore) ---

export const db = { _isMock: true };

// ЛАБ. 7: Додавання документу до колекції
export const addDoc = async (collRef, data) => {
  const col = await readCollection(collRef._name);
  const id = generateDocId();
  col[id] = { ...data, _id: id };
  await writeCollection(collRef._name, col);
  return { id };
};

// ЛАБ. 7: Отримання документів за запитом
export const getDocs = async (queryObj) => {
  const col = await readCollection(queryObj._collection);
  let docs = Object.entries(col).map(([id, data]) => ({ id, ...data }));

  // Фільтрація (where)
  for (const filter of queryObj._filters || []) {
    docs = docs.filter((d) => {
      if (filter.op === '==') return d[filter.field] === filter.value;
      return true;
    });
  }

  // Сортування (orderBy)
  if (queryObj._orderBy) {
    const { field, dir } = queryObj._orderBy;
    docs.sort((a, b) => {
      if (a[field] < b[field]) return dir === 'desc' ? 1 : -1;
      if (a[field] > b[field]) return dir === 'desc' ? -1 : 1;
      return 0;
    });
  }

  return {
    docs: docs.map((d) => ({
      id: d.id,
      data: () => {
        const { id: _id, ...rest } = d;
        return rest;
      },
    })),
  };
};

// ЛАБ. 7: Отримання одного документу за ID
export const getDoc = async (docRef) => {
  const col = await readCollection(docRef._collection);
  const data = col[docRef._id];
  return {
    exists: () => !!data,
    data: () => data || null,
  };
};

// ЛАБ. 7: Запис/оновлення документу за ID
export const setDoc = async (docRef, data, options = {}) => {
  const col = await readCollection(docRef._collection);
  if (options.merge && col[docRef._id]) {
    col[docRef._id] = { ...col[docRef._id], ...data };
  } else {
    col[docRef._id] = { ...data, _id: docRef._id };
  }
  await writeCollection(docRef._collection, col);
};

// ЛАБ. 7: Видалення документу
export const deleteDoc = async (docRef) => {
  const col = await readCollection(docRef._collection);
  delete col[docRef._id];
  await writeCollection(docRef._collection, col);
};

// --- Конструктори посилань (Firestore DSL) ---
export const collection = (dbObj, name) => ({
  _name: name,
});

export const doc = (dbObj, collectionName, id) => ({
  _collection: collectionName,
  _id: id,
});

export const query = (collRef, ...constraints) => {
  const result = {
    _collection: collRef._name,
    _filters: [],
    _orderBy: null,
  };
  for (const c of constraints) {
    if (c._type === 'where') result._filters.push(c);
    if (c._type === 'orderBy') result._orderBy = c;
  }
  return result;
};

export const where = (field, op, value) => ({
  _type: 'where',
  field,
  op,
  value,
});

export const orderBy = (field, dir = 'asc') => ({
  _type: 'orderBy',
  field,
  dir,
});
