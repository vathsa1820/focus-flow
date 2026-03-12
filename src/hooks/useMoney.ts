import { useState, useEffect, useCallback } from 'react';
import { safeParse } from '@/lib/safeParse';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
}

export interface BudgetCategory {
  name: string;
  emoji: string;
  budget: number;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { name: 'Cook items', emoji: '🍲', budget: 800 },
  { name: 'Outside eating', emoji: '🍽️', budget: 2000 },
  { name: 'Snacks / chai', emoji: '☕', budget: 500 },
  { name: 'Travel', emoji: '🚌', budget: 1000 },
  { name: 'Personal care', emoji: '🧴', budget: 500 },
  { name: 'College / study', emoji: '📚', budget: 500 },
  { name: 'Savings', emoji: '💰', budget: 0 },
];

function getMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useMoney() {
  const monthKey = getMonthKey();

  const [income, setIncomeState] = useState<number>(() => {
    const raw = safeParse<unknown>(localStorage.getItem(`money-income-${monthKey}`), 0);
    return typeof raw === 'number' ? raw : 0;
  });

  const [categories, setCategories] = useState<BudgetCategory[]>(() => {
    const raw = safeParse<unknown>(localStorage.getItem(`money-categories-${monthKey}`), DEFAULT_CATEGORIES);
    return Array.isArray(raw) ? (raw as BudgetCategory[]) : DEFAULT_CATEGORIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const raw = safeParse<unknown>(localStorage.getItem(`money-expenses-${monthKey}`), []);
    return Array.isArray(raw) ? (raw as Expense[]) : [];
  });

  useEffect(() => {
    localStorage.setItem(`money-income-${monthKey}`, JSON.stringify(income));
  }, [income, monthKey]);

  useEffect(() => {
    localStorage.setItem(`money-categories-${monthKey}`, JSON.stringify(categories));
  }, [categories, monthKey]);

  useEffect(() => {
    localStorage.setItem(`money-expenses-${monthKey}`, JSON.stringify(expenses));
  }, [expenses, monthKey]);

  const setIncome = (amount: number) => {
    setIncomeState(amount);
    // Auto-assign savings
    const totalFixed = DEFAULT_CATEGORIES.filter(c => c.name !== 'Savings').reduce((s, c) => s + c.budget, 0);
    const savings = Math.max(0, amount - totalFixed);
    setCategories(prev => prev.map(c => c.name === 'Savings' ? { ...c, budget: savings } : c));
  };

  const resetIncome = () => {
    setIncomeState(0);
    setCategories(DEFAULT_CATEGORIES);
  };

  const updateBudget = (categoryName: string, newBudget: number) => {
    setCategories(prev => prev.map(c => c.name === categoryName ? { ...c, budget: newBudget } : c));
  };

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: Date.now().toString() };
    setExpenses(prev => [...prev, newExpense]);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const getCategorySpent = (categoryName: string) => {
    return expenses.filter(e => e.category === categoryName).reduce((s, e) => s + e.amount, 0);
  };

  const getCategoryRemaining = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    if (!cat) return 0;
    return cat.budget - getCategorySpent(categoryName);
  };

  const getCategoryPercent = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName);
    if (!cat || cat.budget === 0) return 0;
    return Math.round((getCategorySpent(categoryName) / cat.budget) * 100);
  };

  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalRemaining = income - totalSpent;

  const getAlertLevel = (categoryName: string): 'safe' | 'warning' | 'danger' | 'exceeded' => {
    const pct = getCategoryPercent(categoryName);
    if (pct >= 100) return 'exceeded';
    if (pct >= 90) return 'danger';
    if (pct >= 70) return 'warning';
    return 'safe';
  };

  const highestCategory = () => {
    let max = 0;
    let name = '';
    categories.forEach(c => {
      const spent = getCategorySpent(c.name);
      if (spent > max) { max = spent; name = c.name; }
    });
    return name;
  };

  const dailyAverage = () => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    return dayOfMonth > 0 ? Math.round(totalSpent / dayOfMonth) : 0;
  };

  return {
    income, setIncome, resetIncome, categories, updateBudget,
    expenses, addExpense, deleteExpense,
    getCategorySpent, getCategoryRemaining, getCategoryPercent,
    totalBudget, totalSpent, totalRemaining,
    getAlertLevel, highestCategory, dailyAverage, monthKey,
  };
}
