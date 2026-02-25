import { useState } from 'react';
import { User, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const [name, setName] = useState(() => localStorage.getItem('focus-flow-user-name') || '');
  const [nameInput, setNameInput] = useState(name);

  const handleSaveName = () => {
    const trimmed = nameInput.trim();
    if (trimmed) {
      localStorage.setItem('focus-flow-user-name', trimmed);
      setName(trimmed);
      toast.success('Name updated!');
    }
  };

  const handleResetName = () => {
    localStorage.removeItem('focus-flow-user-name');
    setName('');
    setNameInput('');
    toast.success('Name reset. You will be asked on next reload.');
  };

  const handleClearHabits = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('habits-'));
    keys.forEach(k => localStorage.removeItem(k));
    toast.success(`Cleared ${keys.length} habit entries`);
  };

  const handleClearMoney = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('money-'));
    keys.forEach(k => localStorage.removeItem(k));
    toast.success(`Cleared ${keys.length} money entries`);
  };

  const handleClearAll = () => {
    localStorage.clear();
    setName('');
    setNameInput('');
    toast.success('All data cleared. Reload to start fresh.');
  };

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Name */}
      <div className="glass-card p-5 space-y-4 slide-up">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">Your Name</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {name ? `Currently: ${name}` : 'No name set'}
        </p>
        <input
          type="text"
          value={nameInput}
          onChange={e => setNameInput(e.target.value)}
          placeholder="Enter your name"
          className="w-full bg-secondary border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSaveName}
            disabled={!nameInput.trim() || nameInput.trim() === name}
            className="flex-1 bg-primary text-primary-foreground font-semibold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            Save
          </button>
          <button
            onClick={handleResetName}
            disabled={!name}
            className="px-4 py-2.5 border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Reset Data */}
      <div className="glass-card p-5 space-y-3 slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-1">
          <Trash2 size={16} className="text-destructive" />
          <h2 className="text-sm font-semibold">Reset Data</h2>
        </div>
        <p className="text-xs text-muted-foreground">These actions cannot be undone.</p>

        <button
          onClick={handleClearHabits}
          className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors flex items-center justify-between"
        >
          <span className="text-sm">Clear all habit data</span>
          <span className="text-xs text-muted-foreground">Habits & history</span>
        </button>

        <button
          onClick={handleClearMoney}
          className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors flex items-center justify-between"
        >
          <span className="text-sm">Clear all money data</span>
          <span className="text-xs text-muted-foreground">Income, budgets & expenses</span>
        </button>

        <button
          onClick={handleClearAll}
          className="w-full text-left px-4 py-3 rounded-lg border border-destructive/50 bg-destructive/10 hover:bg-destructive/20 transition-colors flex items-center justify-between"
        >
          <span className="text-sm text-destructive">Clear everything</span>
          <span className="text-xs text-destructive/70">Full reset</span>
        </button>
      </div>
    </div>
  );
}
