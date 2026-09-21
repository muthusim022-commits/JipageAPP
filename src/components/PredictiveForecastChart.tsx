import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DayForecast } from '../types.js';
import { Calendar, TrendingDown } from 'lucide-react';

interface PredictiveForecastChartProps {
  forecast: DayForecast[];
  currentBalance: number;
}

export const PredictiveForecastChart: React.FC<PredictiveForecastChartProps> = ({
  forecast,
  currentBalance,
}) => {
  if (!forecast || forecast.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-6 text-center text-stone-500">
        No forecast data yet. Parse incoming SMS transactions to view projected 7-day balances.
      </div>
    );
  }

  // Format data for chart
  const chartData = [
    {
      date: 'Today',
      balance: currentBalance,
    },
    ...forecast.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'numeric',
        day: 'numeric',
      }),
      balance: item.projected_wallet_balance,
    })),
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold font-heading text-stone-900">
              7-Day Predictive Cash Flow Forecast
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Model Active
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Linear burn projection based on current spending velocity
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-stone-500">
            <Calendar className="w-3.5 h-3.5" /> Next 7 Days
          </span>
          <span className="font-semibold text-stone-900">
            Current: KSh {currentBalance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="walletGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickFormatter={(v) => `KSh ${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(val: any) => [
                `KSh ${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                'Projected Balance',
              ]}
              contentStyle={{
                backgroundColor: '#1c1917',
                borderRadius: '8px',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="#059669"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#walletGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-xs text-stone-500 gap-2">
        <span>Forecast updates continuously as new transaction logs arrive.</span>
        <span className="flex items-center gap-1 font-medium text-stone-700">
          <TrendingDown className="w-3.5 h-3.5 text-amber-500" />
          End of 7 Days: KSh{' '}
          {forecast[forecast.length - 1]?.projected_wallet_balance.toLocaleString() ?? '0'}
        </span>
      </div>
    </div>
  );
};
