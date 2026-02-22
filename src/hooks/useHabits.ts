import { useState, useEffect, useCallback } from 'react';

export interface HabitWeek {
  weekStart: string; // ISO date string of Monday
  habits: Record<string, boolean[]>; // habit name -> [Mon..Sun]
}

const DEFAULT_HABITS = [
  'Wake up early',
  'Exercise',
  'Breakfast preparation',
  'Freshen up & bath',
  'Get ready for college',
  'Attend college',
  'Evening chai (no snacks)',
  'Dinner preparation',
  'Work / assignments',
  'Notes writing',
  'Skin / hair care',
  'Cybersecurity study',
  'Sleep on time',
];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatWeekKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function useHabits() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const weekKey = formatWeekKey(currentWeekStart);

  const [weekData, setWeekData] = useState<Record<string, boolean[]>>(() => {
    const stored = localStorage.getItem(`habits-${weekKey}`);
    if (stored) return JSON.parse(stored);
    const initial: Record<string, boolean[]> = {};
    DEFAULT_HABITS.forEach(h => { initial[h] = Array(7).fill(false); });
    return initial;
  });

  useEffect(() => {
    const stored = localStorage.getItem(`habits-${weekKey}`);
    if (stored) {
      setWeekData(JSON.parse(stored));
    } else {
      const initial: Record<string, boolean[]> = {};
      DEFAULT_HABITS.forEach(h => { initial[h] = Array(7).fill(false); });
      setWeekData(initial);
    }
  }, [weekKey]);

  useEffect(() => {
    localStorage.setItem(`habits-${weekKey}`, JSON.stringify(weekData));
  }, [weekData, weekKey]);

  const toggleHabit = useCallback((habit: string, dayIndex: number) => {
    setWeekData(prev => {
      const updated = { ...prev };
      updated[habit] = [...(updated[habit] || Array(7).fill(false))];
      updated[habit][dayIndex] = !updated[habit][dayIndex];
      return updated;
    });
  }, []);

  const goToPreviousWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    const today = getMonday(new Date());
    if (next <= today) setCurrentWeekStart(next);
  };

  const goToCurrentWeek = () => setCurrentWeekStart(getMonday(new Date()));

  const isCurrentWeek = weekKey === formatWeekKey(getMonday(new Date()));

  const habitNames = DEFAULT_HABITS;

  const getHabitTotal = (habit: string) => (weekData[habit] || []).filter(Boolean).length;
  const getHabitPercent = (habit: string) => Math.round((getHabitTotal(habit) / 7) * 100);
  const getOverallPercent = () => {
    const totals = habitNames.map(h => getHabitTotal(h));
    const sum = totals.reduce((a, b) => a + b, 0);
    return Math.round((sum / (habitNames.length * 7)) * 100);
  };

  const getBestHabit = () => {
    let best = habitNames[0];
    let max = 0;
    habitNames.forEach(h => {
      const t = getHabitTotal(h);
      if (t > max) { max = t; best = h; }
    });
    return best;
  };

  const getMostMissed = () => {
    let worst = habitNames[0];
    let min = 8;
    habitNames.forEach(h => {
      const t = getHabitTotal(h);
      if (t < min) { min = t; worst = h; }
    });
    return worst;
  };

  const getWeekLabel = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return `${fmt(currentWeekStart)} — ${fmt(end)}`;
  };

  return {
    weekData, habitNames, weekKey, currentWeekStart,
    toggleHabit, goToPreviousWeek, goToNextWeek, goToCurrentWeek,
    isCurrentWeek, getHabitTotal, getHabitPercent, getOverallPercent,
    getBestHabit, getMostMissed, getWeekLabel,
  };
}
