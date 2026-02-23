import { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChevronLeft, ChevronRight, RotateCcw, Check, Plus, X } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CHART_COLORS = ['hsl(82, 85%, 55%)', 'hsl(240, 4%, 16%)'];

function getColor(pct: number) {
  if (pct >= 70) return 'text-success';
  if (pct >= 40) return 'text-warning';
  return 'text-destructive';
}

function getBgColor(pct: number) {
  if (pct >= 70) return 'bg-success';
  if (pct >= 40) return 'bg-warning';
  return 'bg-destructive';
}

export default function HabitTracker() {
  const h = useHabits();
  const [newHabit, setNewHabit] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const barData = h.habitNames.map(name => ({
    name: name.length > 12 ? name.slice(0, 12) + '…' : name,
    days: h.getHabitTotal(name),
    pct: h.getHabitPercent(name),
  }));

  const overallPct = h.getOverallPercent();
  const donutData = [
    { name: 'Done', value: overallPct },
    { name: 'Remaining', value: Math.max(0, 100 - overallPct) },
  ];

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Habit Tracker</h1>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowAdd(v => !v)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <Plus size={18} className="text-primary" />
          </button>
          <button onClick={h.goToPreviousWeek} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <ChevronLeft size={18} className="text-muted-foreground" />
          </button>
          <button
            onClick={h.goToCurrentWeek}
            className="px-2 py-1 text-xs rounded-lg hover:bg-secondary transition-colors text-muted-foreground"
            disabled={h.isCurrentWeek}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={h.goToNextWeek}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
            disabled={h.isCurrentWeek}
          >
            <ChevronRight size={18} className={h.isCurrentWeek ? 'text-muted' : 'text-muted-foreground'} />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground -mt-3">{h.getWeekLabel()}</p>

      {/* Add Custom Habit */}
      {showAdd && (
        <div className="glass-card p-3 flex gap-2 slide-up">
          <input
            value={newHabit}
            onChange={e => setNewHabit(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && newHabit.trim()) {
                h.addHabit(newHabit);
                setNewHabit('');
                setShowAdd(false);
              }
            }}
            placeholder="New habit name…"
            className="flex-1 bg-secondary/50 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => {
              if (newHabit.trim()) {
                h.addHabit(newHabit);
                setNewHabit('');
                setShowAdd(false);
              }
            }}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
          >
            Add
          </button>
        </div>
      )}

      {/* Excel Table */}
      <div className="glass-card overflow-x-auto slide-up">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 sticky left-0 bg-card/95 backdrop-blur-sm font-semibold text-muted-foreground min-w-[140px]">
                Habit
              </th>
              {DAYS.map(d => (
                <th key={d} className="p-2 text-center font-medium text-muted-foreground w-10">{d}</th>
              ))}
              <th className="p-2 text-center font-medium text-muted-foreground">Total</th>
              <th className="p-2 text-center font-medium text-muted-foreground">%</th>
            </tr>
          </thead>
          <tbody>
            {h.habitNames.map((habit, i) => {
              const total = h.getHabitTotal(habit);
              const pct = h.getHabitPercent(habit);
              return (
                <tr
                  key={habit}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  <td className="p-3 sticky left-0 bg-card/95 backdrop-blur-sm font-medium text-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      {habit}
                      {h.isCustomHabit(habit) && (
                        <button
                          onClick={() => h.removeHabit(habit)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                          title="Remove habit"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </span>
                  </td>
                  {DAYS.map((_, di) => (
                    <td key={di} className="p-1 text-center">
                      <button
                        onClick={() => h.toggleHabit(habit, di)}
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all duration-200 ${
                          h.weekData[habit]?.[di]
                            ? 'bg-primary/20 text-primary scale-100'
                            : 'bg-secondary/50 hover:bg-secondary text-transparent hover:text-muted-foreground'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>
                    </td>
                  ))}
                  <td className="p-2 text-center font-semibold">{total}</td>
                  <td className={`p-2 text-center font-bold ${getColor(pct)}`}>{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-gradient">{overallPct}%</p>
          <p className="text-xs text-muted-foreground mt-1">Weekly Average</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-3xl font-bold text-primary">
            {h.habitNames.filter(n => h.getHabitPercent(n) >= 70).length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Habits on Track</p>
        </div>
      </div>

      {/* Donut Chart */}
      <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.15s' }}>
        <h2 className="text-sm font-semibold mb-3">Weekly Completion</h2>
        <div className="flex items-center justify-center gap-6">
          <div className="w-28 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={35}
                  outerRadius={50}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span>Completed {overallPct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-muted-foreground">Remaining {100 - overallPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-sm font-semibold mb-3">Habit Performance</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" domain={[0, 7]} tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={90}
                tick={{ fill: 'hsl(0,0%,85%)', fontSize: 9 }}
              />
              <Tooltip
                contentStyle={{
                  background: 'hsl(240, 6%, 10%)',
                  border: '1px solid hsl(240, 4%, 20%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="days" radius={[0, 4, 4, 0]}>
                {barData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.pct >= 70 ? 'hsl(142,71%,45%)' : entry.pct >= 40 ? 'hsl(45,93%,47%)' : 'hsl(0,72%,51%)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights */}
      <div className="glass-card p-4 space-y-2 slide-up" style={{ animationDelay: '0.25s' }}>
        <h2 className="text-sm font-semibold mb-2">💡 Insights</h2>
        <p className="text-xs text-muted-foreground">
          You completed <span className="text-foreground font-medium">{overallPct}%</span> of habits this week
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="text-success">✦</span> <span className="text-foreground">{h.getBestHabit()}</span> is your strongest habit
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="text-destructive">✦</span> <span className="text-foreground">{h.getMostMissed()}</span> needs attention
        </p>
      </div>
    </div>
  );
}
