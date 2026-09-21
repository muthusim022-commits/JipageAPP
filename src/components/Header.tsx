import React from 'react';
import { Smartphone, Activity, Sliders, ShieldCheck } from 'lucide-react';
import { UserGoals } from '../types.js';

interface HeaderProps {
  goals: UserGoals;
  onOpenGoals: () => void;
  serverStatus: boolean;
}

export const Header: React.FC<HeaderProps> = ({ goals, onOpenGoals, serverStatus }) => {
  return (
    <header id="app-header" className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading tracking-tight text-stone-900">JipageApp</h1>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                v1.0 Ready
              </span>
            </div>
            <p className="text-xs text-stone-500">M-Pesa & Bank Financial Visibility Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-100 text-xs text-stone-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Server: {serverStatus ? 'Online (Node.js)' : 'Connecting...'}</span>
          </div>

          <button
            id="open-budget-settings-btn"
            onClick={onOpenGoals}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-sm"
          >
            <Sliders className="w-4 h-4" />
            <span>Budget Goals (KSh {goals.monthly_budget_limit.toLocaleString()})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
