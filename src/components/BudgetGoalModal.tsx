import React, { useState } from 'react';
import { X, Save, ShieldAlert } from 'lucide-react';
import { UserGoals } from '../types.js';

interface BudgetGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: UserGoals;
  onSaveGoals: (newGoals: UserGoals) => Promise<void>;
}

export const BudgetGoalModal: React.FC<BudgetGoalModalProps> = ({
  isOpen,
  onClose,
  goals,
  onSaveGoals,
}) => {
  const [budgetLimit, setBudgetLimit] = useState(goals.monthly_budget_limit.toString());
  const [walletBalance, setWalletBalance] = useState(goals.current_wallet_balance.toString());
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    const balance = parseFloat(walletBalance);

    if (isNaN(limit) || isNaN(balance)) return;

    setSaving(true);
    try {
      await onSaveGoals({
        monthly_budget_limit: limit,
        current_wallet_balance: balance,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold font-heading text-stone-900 text-base">
                Budget Guardrails & Wallet
              </h3>
              <p className="text-xs text-stone-500">Configure velocity alerts and cash baseline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Monthly Expenditure Limit (KSh)
            </label>
            <input
              type="number"
              min="100"
              step="100"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              className="w-full text-sm font-semibold rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Triggers WARNING at 75% and CRITICAL alert when exceeded.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              Current Available Wallet Balance (KSh)
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={walletBalance}
              onChange={(e) => setWalletBalance(e.target.value)}
              className="w-full text-sm font-semibold rounded-lg border border-stone-300 px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
            <span className="text-[11px] text-stone-400 mt-1 block">
              Baseline for the 7-day predictive cash flow trajectory.
            </span>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium rounded-lg text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Updating...' : 'Save Parameters'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
