import { useHabits } from '@/hooks/useHabits';
import { useMoney } from '@/hooks/useMoney';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Wallet, Flame } from 'lucide-react';

export default function Dashboard() {
  const habits = useHabits();
  const money = useMoney();

  const overallPct = habits.getOverallPercent();
  const donutData = [
    { name: 'Done', value: overallPct },
    { name: 'Remaining', value: 100 - overallPct },
  ];

  const topSpending = money.categories
    .map(c => ({ ...c, spent: money.getCategorySpent(c.name) }))
    .filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here's your life snapshot</p>
      </div>

      {/* Habit Overview Card */}
      <div className="glass-card p-5 glow-primary slide-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Today's Habits</p>
            <p className="text-3xl font-bold text-gradient mt-1">{overallPct}%</p>
            <p className="text-xs text-muted-foreground mt-1">{habits.getWeekLabel()}</p>
          </div>
          <div className="w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={25}
                  outerRadius={38}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  <Cell fill="hsl(82, 85%, 55%)" />
                  <Cell fill="hsl(240, 4%, 16%)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Flame size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Best Habit</span>
          </div>
          <p className="text-sm font-semibold truncate">{habits.getBestHabit()}</p>
        </div>
        <div className="glass-card p-4 slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-destructive" />
            <span className="text-xs text-muted-foreground">Needs Work</span>
          </div>
          <p className="text-sm font-semibold truncate">{habits.getMostMissed()}</p>
        </div>
      </div>

      {/* Money Overview */}
      <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Wallet size={18} className="text-primary" />
          <h2 className="text-sm font-semibold">Money This Month</h2>
        </div>
        {money.income > 0 ? (
          <>
            <div className="flex justify-between items-baseline mb-3">
              <div>
                <p className="text-2xl font-bold">₹{money.totalRemaining.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">remaining of ₹{money.income.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Spent</p>
                <p className="text-lg font-semibold text-destructive">₹{money.totalSpent.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill bg-primary"
                style={{ width: `${Math.min(100, Math.round((money.totalSpent / money.income) * 100))}%` }}
              />
            </div>
            {topSpending.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Top Spending</p>
                {topSpending.map(c => (
                  <div key={c.name} className="flex justify-between text-sm">
                    <span>{c.emoji} {c.name}</span>
                    <span className="text-muted-foreground">₹{c.spent.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Set your monthly income to get started →</p>
        )}
      </div>

      {/* Insight */}
      <div className="glass-card p-4 slide-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" />
          <p className="text-sm">
            {overallPct >= 70
              ? `Great week! ${overallPct}% completion — keep it up! 🎯`
              : overallPct >= 40
              ? `${overallPct}% so far. Push a little harder! 💪`
              : `Just getting started — ${overallPct}%. Every step counts! 🌱`}
          </p>
        </div>
      </div>
    </div>
  );
}
