import React from 'react';
import { AlertTriangle, CheckCircle2, AlertOctagon, TrendingDown, Clock, Wallet } from 'lucide-react';
import { PredictiveResults, UserGoals } from '../types.js';

interface VelocityAlertBannerProps {
  analysis: PredictiveResults | null;
  goals: UserGoals;
}

export const VelocityAlertBanner: React.FC<VelocityAlertBannerProps> = ({ analysis, goals }) => {
  if (!analysis) return null;

  const { velocity_status, days_until_limit_breach, ai_behavioral_summary, metrics } = analysis;

  const getStatusBadge = () => {
    switch (velocity_status) {
      case 'CRITICAL_BURNOUT':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          indicator: 'bg-rose-500',
          icon: <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />,
          title: 'Critical Outflow Burnout',
        };
      case 'WARNING_HIGH_VELOCITY':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          indicator: 'bg-amber-500',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          title: 'High Velocity Warning',
        };
      case 'HEALTHY_OPTIMAL':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          indicator: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          title: 'Optimal Vigilance',
        };
      default:
        return {
          bg: 'bg-sky-50 border-sky-200 text-sky-800',
          indicator: 'bg-sky-500',
          icon: <TrendingDown className="w-5 h-5 text-sky-600 shrink-0" />,
          title: 'Stable Tracking',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="space-y-4">
      {/* Alert Summary Box */}
      <div
        id="velocity-alert-banner"
        className={`rounded-xl border p-4 sm:p-5 transition-all ${badge.bg}`}
      >
        <div className="flex items-start gap-3.5">
          {badge.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold font-heading tracking-tight">{badge.title}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/70 font-medium uppercase tracking-wider">
                {velocity_status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{ai_behavioral_summary}</p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Total Outflow</span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-heading text-stone-900">
            KSh {metrics.total_outflow_tracked.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-stone-400">Recorded expenses</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Spending Velocity</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-heading text-stone-900">
            KSh {metrics.daily_spending_velocity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-stone-500">/day</span>
          </div>
          <span className="text-[11px] text-stone-400">Daily burn pace</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Remaining Budget</span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className={`text-lg sm:text-xl font-bold font-heading ${metrics.remaining_goal_budget < 0 ? 'text-rose-600' : 'text-stone-900'}`}>
            KSh {metrics.remaining_goal_budget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-stone-400">Limit: KSh {goals.monthly_budget_limit.toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Limit Guardrail</span>
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-heading text-stone-900">
            {days_until_limit_breach >= 900 ? '99+ Days' : days_until_limit_breach < 0 ? 'Exceeded' : `${days_until_limit_breach} Days`}
          </div>
          <span className="text-[11px] text-stone-400">Until target exhausted</span>
        </div>
      </div>
    </div>
  );
};
