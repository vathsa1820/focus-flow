import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const COLORS = [
  'hsl(82,85%,55%)', 'hsl(199,89%,48%)', 'hsl(45,93%,47%)',
  'hsl(0,72%,51%)', 'hsl(280,65%,60%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)',
];
const chartStyle = {
  background: 'hsl(240,6%,10%)', border: '1px solid hsl(240,4%,20%)',
  borderRadius: '8px', fontSize: '12px',
};
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getAllWeeksInMonth(year: number, month: number) {
  const weeks: string[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    const mon = getMonday(d);
    const key = mon.toISOString().split('T')[0];
    if (!weeks.includes(key)) weeks.push(key);
    d.setDate(d.getDate() + 1);
  }
  return weeks;
}

function getColor(pct: number) {
  if (pct >= 70) return 'hsl(142,71%,45%)';
  if (pct >= 40) return 'hsl(45,93%,47%)';
  return 'hsl(0,72%,51%)';
}

export default function History() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = new Date(year, month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const goBack = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const goForward = () => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  // Money data
  const income: number = useMemo(() => {
    const s = localStorage.getItem(`money-income-${monthKey}`);
    return s ? JSON.parse(s) : 0;
  }, [monthKey]);

  const categories = useMemo(() => {
    const s = localStorage.getItem(`money-categories-${monthKey}`);
    return s ? JSON.parse(s) as { name: string; emoji: string; budget: number }[] : [];
  }, [monthKey]);

  const expenses = useMemo(() => {
    const s = localStorage.getItem(`money-expenses-${monthKey}`);
    return s ? JSON.parse(s) as { amount: number; category: string; date: string; note?: string }[] : [];
  }, [monthKey]);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);

  const categorySpend = useMemo(() => {
    return categories.map((c, i) => {
      const spent = expenses.filter(e => e.category === c.name).reduce((s, e) => s + e.amount, 0);
      return { ...c, spent, color: COLORS[i % COLORS.length] };
    });
  }, [categories, expenses]);

  const spendPie = categorySpend.filter(c => c.spent > 0);

  // Habit data for all weeks in this month
  const weekKeys = useMemo(() => getAllWeeksInMonth(year, month), [year, month]);

  const habitWeeks = useMemo(() => {
    return weekKeys.map(wk => {
      const s = localStorage.getItem(`habits-${wk}`);
      const data: Record<string, boolean[]> = s ? JSON.parse(s) : {};
      const habits = Object.keys(data);
      const totalPossible = habits.length * 7;
      const totalDone = habits.reduce((sum, h) => sum + (data[h] || []).filter(Boolean).length, 0);
      const pct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
      const endDate = new Date(wk);
      endDate.setDate(endDate.getDate() + 6);
      const label = `${new Date(wk).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
      return { weekKey: wk, pct, label, data, habits };
    });
  }, [weekKeys]);

  const monthlyHabitAvg = habitWeeks.length > 0
    ? Math.round(habitWeeks.reduce((s, w) => s + w.pct, 0) / habitWeeks.length)
    : 0;

  // Per-habit monthly average
  const allHabitNames = useMemo(() => {
    const set = new Set<string>();
    habitWeeks.forEach(w => w.habits.forEach(h => set.add(h)));
    return Array.from(set);
  }, [habitWeeks]);

  const habitMonthly = useMemo(() => {
    return allHabitNames.map(name => {
      let total = 0, possible = 0;
      habitWeeks.forEach(w => {
        if (w.data[name]) {
          total += w.data[name].filter(Boolean).length;
          possible += 7;
        }
      });
      const pct = possible > 0 ? Math.round((total / possible) * 100) : 0;
      return { name: name.length > 12 ? name.slice(0, 12) + '…' : name, pct };
    });
  }, [allHabitNames, habitWeeks]);

  const hasData = income > 0 || expenses.length > 0 || habitWeeks.some(w => w.pct > 0);

  return (
    <div className="space-y-5 fade-in">
      {/* Header with month nav */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">History</h1>
        <div className="flex items-center gap-1">
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-1.5 px-2">
            <Calendar size={14} className="text-primary" />
            <span className="text-sm font-medium">{monthLabel}</span>
          </div>
          <button onClick={goForward} className="p-2 rounded-lg hover:bg-secondary transition-colors" disabled={isCurrentMonth}>
            <ChevronRight size={18} className={isCurrentMonth ? 'text-muted' : 'text-muted-foreground'} />
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No data for this month yet.</p>
        </div>
      ) : (
        <>
          {/* Monthly Summary Cards */}
          <div className="grid grid-cols-2 gap-3 slide-up">
            <div className="glass-card p-4 text-center">
              <p className="text-3xl font-bold text-gradient">{monthlyHabitAvg}%</p>
              <p className="text-xs text-muted-foreground mt-1">Habit Avg</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Spent</p>
              {income > 0 && (
                <p className="text-[10px] text-muted-foreground">of ₹{income.toLocaleString('en-IN')}</p>
              )}
            </div>
          </div>

          {/* Weekly Habit Trend */}
          {habitWeeks.some(w => w.pct > 0) && (
            <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-sm font-semibold mb-3">📅 Weekly Habit Completion</h2>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitWeeks}>
                    <XAxis dataKey="label" tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
                    <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`${v}%`, 'Completion']} />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {habitWeeks.map((w, i) => (
                        <Cell key={i} fill={getColor(w.pct)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Per-Habit Monthly Performance */}
          {habitMonthly.length > 0 && (
            <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.15s' }}>
              <h2 className="text-sm font-semibold mb-3">🎯 Habit Monthly Performance</h2>
              <div className="space-y-2">
                {habitMonthly.map(h => (
                  <div key={h.name} className="flex items-center gap-3">
                    <span className="text-xs w-24 truncate">{h.name}</span>
                    <div className="flex-1 progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${h.pct}%`, background: getColor(h.pct) }}
                      />
                    </div>
                    <span className="text-xs font-semibold w-10 text-right" style={{ color: getColor(h.pct) }}>
                      {h.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spending Breakdown */}
          {spendPie.length > 0 && (
            <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-sm font-semibold mb-3">💰 Spending Breakdown</h2>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={spendPie} innerRadius={30} outerRadius={50} dataKey="spent" strokeWidth={0}>
                        {spendPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-1.5">
                  {spendPie.map(d => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="truncate">{d.emoji} {d.name}</span>
                      <span className="ml-auto text-muted-foreground">₹{d.spent.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Category Budget vs Spent */}
          {categorySpend.length > 0 && (
            <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.25s' }}>
              <h2 className="text-sm font-semibold mb-3">📊 Budget vs Spent</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySpend}>
                    <XAxis dataKey="emoji" tick={{ fontSize: 14 }} />
                    <YAxis tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
                    <Tooltip contentStyle={chartStyle} />
                    <Bar dataKey="budget" fill="hsl(240,4%,24%)" radius={[4, 4, 0, 0]} name="Budget" />
                    <Bar dataKey="spent" fill="hsl(82,85%,55%)" radius={[4, 4, 0, 0]} name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
