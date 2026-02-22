import { useHabits } from '@/hooks/useHabits';
import { useMoney } from '@/hooks/useMoney';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const COLORS = [
  'hsl(82,85%,55%)', 'hsl(199,89%,48%)', 'hsl(45,93%,47%)',
  'hsl(0,72%,51%)', 'hsl(280,65%,60%)', 'hsl(160,60%,45%)',
];

const chartStyle = {
  background: 'hsl(240,6%,10%)',
  border: '1px solid hsl(240,4%,20%)',
  borderRadius: '8px',
  fontSize: '12px',
};

export default function Analytics() {
  const h = useHabits();
  const m = useMoney();

  const habitData = h.habitNames.map(name => ({
    name: name.length > 10 ? name.slice(0, 10) + '…' : name,
    completion: h.getHabitPercent(name),
  }));

  const categoryData = m.categories.map((c, i) => ({
    name: c.emoji + ' ' + c.name,
    budget: c.budget,
    spent: m.getCategorySpent(c.name),
    remaining: m.getCategoryRemaining(c.name),
    color: COLORS[i % COLORS.length],
  }));

  const spendPie = categoryData.filter(d => d.spent > 0);

  // Daily spend trend (last 7 days)
  const dailySpend: { day: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayTotal = m.expenses.filter(e => e.date === dateStr).reduce((s, e) => s + e.amount, 0);
    dailySpend.push({
      day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      amount: dayTotal,
    });
  }

  return (
    <div className="space-y-5 fade-in">
      <h1 className="text-xl font-bold">Analytics</h1>

      {/* Habit Completion Chart */}
      <div className="glass-card p-5 slide-up">
        <h2 className="text-sm font-semibold mb-3">📊 Habit Completion (%)</h2>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={habitData} layout="vertical" margin={{ left: 0, right: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: 'hsl(0,0%,85%)', fontSize: 9 }} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="completion" radius={[0, 4, 4, 0]}>
                {habitData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.completion >= 70 ? 'hsl(142,71%,45%)' : entry.completion >= 40 ? 'hsl(45,93%,47%)' : 'hsl(0,72%,51%)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Spending Trend */}
      <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-semibold mb-3">📈 Daily Spending (7 days)</h2>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySpend}>
              <XAxis dataKey="day" tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
              <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`₹${v}`, 'Spent']} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="hsl(82,85%,55%)"
                strokeWidth={2}
                dot={{ fill: 'hsl(82,85%,55%)', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Pie */}
      {spendPie.length > 0 && (
        <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-sm font-semibold mb-3">🥧 Expense Distribution</h2>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={spendPie} innerRadius={30} outerRadius={55} dataKey="spent" strokeWidth={0}>
                    {spendPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={chartStyle} formatter={(v: number) => [`₹${v}`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {spendPie.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="truncate">{d.name}</span>
                  <span className="ml-auto text-muted-foreground">₹{d.spent.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Budget Utilization */}
      <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-sm font-semibold mb-3">💰 Budget Utilization</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fontSize: 8 }} interval={0} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
              <Tooltip contentStyle={chartStyle} />
              <Bar dataKey="budget" fill="hsl(240,4%,24%)" radius={[4, 4, 0, 0]} name="Budget" />
              <Bar dataKey="spent" fill="hsl(82,85%,55%)" radius={[4, 4, 0, 0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
