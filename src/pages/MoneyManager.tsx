import { useState } from 'react';
import { useMoney } from '@/hooks/useMoney';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Plus, AlertTriangle, XCircle, IndianRupee, Trash2 } from 'lucide-react';

const PIE_COLORS = [
  'hsl(82,85%,55%)', 'hsl(199,89%,48%)', 'hsl(45,93%,47%)',
  'hsl(0,72%,51%)', 'hsl(280,65%,60%)', 'hsl(160,60%,45%)', 'hsl(30,80%,55%)',
];

export default function MoneyManager() {
  const m = useMoney();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetIncome, setShowSetIncome] = useState(m.income === 0);
  const [incomeInput, setIncomeInput] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState(m.categories[0]?.name || '');
  const [expenseNote, setExpenseNote] = useState('');

  const handleSetIncome = () => {
    const amt = parseFloat(incomeInput);
    if (amt > 0) {
      m.setIncome(amt);
      setShowSetIncome(false);
      setIncomeInput('');
    }
  };

  const handleAddExpense = () => {
    const amt = parseFloat(expenseAmount);
    if (amt > 0 && expenseCategory) {
      m.addExpense({
        amount: amt,
        category: expenseCategory,
        date: new Date().toISOString().split('T')[0],
        note: expenseNote || undefined,
      });
      setExpenseAmount('');
      setExpenseNote('');
      setShowAddExpense(false);
    }
  };

  const barData = m.categories.map(c => ({
    name: c.emoji,
    budget: c.budget,
    spent: m.getCategorySpent(c.name),
  }));

  const pieData = m.categories
    .map((c, i) => ({ name: c.name, value: m.getCategorySpent(c.name), color: PIE_COLORS[i % PIE_COLORS.length] }))
    .filter(d => d.value > 0);

  const alertColor = (level: string) => {
    if (level === 'exceeded') return 'bg-destructive/20 border-destructive/50';
    if (level === 'danger') return 'bg-destructive/10 border-destructive/30';
    if (level === 'warning') return 'bg-warning/10 border-warning/30';
    return '';
  };

  const progressColor = (level: string) => {
    if (level === 'exceeded' || level === 'danger') return 'bg-destructive';
    if (level === 'warning') return 'bg-warning';
    return 'bg-primary';
  };

  if (showSetIncome) {
    return (
      <div className="space-y-5 fade-in">
        <h1 className="text-xl font-bold">Set Monthly Income</h1>
        <div className="glass-card p-6 space-y-4">
          <p className="text-sm text-muted-foreground">Enter your monthly income to get started with budget allocation.</p>
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-primary" />
            <input
              type="number"
              value={incomeInput}
              onChange={e => setIncomeInput(e.target.value)}
              placeholder="e.g. 10000"
              className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
          </div>
          <button
            onClick={handleSetIncome}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
          >
            Set Income
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Money Manager</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSetIncome(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ₹{m.income.toLocaleString('en-IN')}/mo
          </button>
          <button
            onClick={() => { m.resetIncome(); setShowSetIncome(true); }}
            className="text-xs text-destructive/70 hover:text-destructive transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Overview Card */}
      <div className="glass-card p-5 glow-primary slide-up">
        <div className="flex justify-between items-baseline">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Remaining</p>
            <p className={`text-3xl font-bold ${m.totalRemaining >= 0 ? 'text-gradient' : 'text-destructive'}`}>
              ₹{m.totalRemaining.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-xl font-semibold">₹{m.totalSpent.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="progress-bar mt-3">
          <div
            className={`progress-bar-fill ${m.totalSpent / m.income > 0.9 ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${Math.min(100, Math.round((m.totalSpent / m.income) * 100))}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Daily avg: ₹{m.dailyAverage().toLocaleString('en-IN')}</p>
      </div>

      {/* Categories */}
      <div className="space-y-2 slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-semibold">Budget Categories</h2>
        {m.categories.map(cat => {
          const spent = m.getCategorySpent(cat.name);
          const pct = m.getCategoryPercent(cat.name);
          const level = m.getAlertLevel(cat.name);
          return (
            <div key={cat.name} className={`glass-card p-4 border ${alertColor(level)}`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{cat.emoji} {cat.name}</span>
                <div className="flex items-center gap-2">
                  {level === 'warning' && <AlertTriangle size={14} className="text-warning" />}
                  {(level === 'danger' || level === 'exceeded') && <XCircle size={14} className="text-destructive" />}
                  <span className="text-xs text-muted-foreground">
                    ₹{spent.toLocaleString('en-IN')} / ₹{cat.budget.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-bar-fill ${progressColor(level)}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Expense Button */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all glow-primary"
      >
        <Plus size={24} />
      </button>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg p-6 rounded-2xl space-y-4 slide-up">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Add Expense</h2>
              <button onClick={() => setShowAddExpense(false)} className="text-muted-foreground">✕</button>
            </div>
            <input
              type="number"
              value={expenseAmount}
              onChange={e => setExpenseAmount(e.target.value)}
              placeholder="Amount (₹)"
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <select
              value={expenseCategory}
              onChange={e => setExpenseCategory(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {m.categories.map(c => (
                <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
            <input
              type="text"
              value={expenseNote}
              onChange={e => setExpenseNote(e.target.value)}
              placeholder="Note (optional)"
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button
              onClick={handleAddExpense}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Add Expense
            </button>
          </div>
        </div>
      )}

      {/* Charts */}
      {pieData.length > 0 && (
        <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-sm font-semibold mb-3">Spending Breakdown</h2>
          <div className="flex items-center gap-4">
            <div className="w-28 h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={30} outerRadius={50} dataKey="value" strokeWidth={0}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(240,6%,10%)', border: '1px solid hsl(240,4%,20%)',
                      borderRadius: '8px', fontSize: '12px',
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="truncate">{d.name}</span>
                  <span className="ml-auto text-muted-foreground">₹{d.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Category Bar Chart */}
      <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-sm font-semibold mb-3">Budget vs Spent</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 14 }} />
              <YAxis tick={{ fill: 'hsl(240,5%,55%)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(240,6%,10%)', border: '1px solid hsl(240,4%,20%)',
                  borderRadius: '8px', fontSize: '12px',
                }}
              />
              <Bar dataKey="budget" fill="hsl(240,4%,24%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" fill="hsl(82,85%,55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Expenses */}
      {m.expenses.length > 0 && (
        <div className="glass-card p-5 slide-up" style={{ animationDelay: '0.25s' }}>
          <h2 className="text-sm font-semibold mb-3">Recent Expenses</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[...m.expenses].reverse().slice(0, 10).map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">
                    {m.categories.find(c => c.name === exp.category)?.emoji} ₹{exp.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground">{exp.note || exp.category} · {exp.date}</p>
                </div>
                <button onClick={() => m.deleteExpense(exp.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
