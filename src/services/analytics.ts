import { Transaction, UserGoals, PredictiveResults, DayForecast } from '../types.js';

export class JipageAnalyticsEngine {
  /**
   * Processes transaction history to calculate spending velocity,
   * run 7-day wallet forecasts, and generate AI-style behavioral summaries.
   */
  static runPredictiveFlow(
    historicalTransactions: Transaction[],
    userGoals: Partial<UserGoals> = {}
  ): PredictiveResults {
    if (!historicalTransactions || historicalTransactions.length === 0) {
      return {
        metrics: {
          total_outflow_tracked: 0.0,
          daily_spending_velocity: 0.0,
          remaining_goal_budget: userGoals.monthly_budget_limit ?? 10000.0,
        },
        velocity_status: 'STABLE',
        days_until_limit_breach: -1,
        ai_behavioral_summary:
          'Welcome to JipageApp! Feed me M-Pesa alerts or bank logs to unlock personalized behavior trends.',
        seven_day_predictive_forecast: [],
      };
    }

    const outflows = historicalTransactions.filter((tx) => tx.direction === 'OUTFLOW');
    const totalSpent = outflows.reduce((acc, tx) => acc + (Number(tx.amount) || 0), 0);

    // Unique days tracked from parsed_at
    const uniqueDates = new Set(
      outflows.map((tx) => {
        try {
          return new Date(tx.parsed_at).toISOString().split('T')[0];
        } catch {
          return tx.parsed_at?.split('T')[0] || 'today';
        }
      })
    );
    const daysTracked = Math.max(uniqueDates.size, 1);
    const dailyVelocityRate = totalSpent / daysTracked;

    const targetBudget = Number(userGoals.monthly_budget_limit ?? 10000.0);
    const remainingBudget = targetBudget - totalSpent;

    let daysUntilLimit: number;
    if (dailyVelocityRate > 0) {
      daysUntilLimit = Math.floor(remainingBudget / dailyVelocityRate);
    } else {
      daysUntilLimit = 999;
    }

    let velocityStatus: PredictiveResults['velocity_status'] = 'HEALTHY_OPTIMAL';
    let aiText = '';

    if (totalSpent > targetBudget) {
      velocityStatus = 'CRITICAL_BURNOUT';
      aiText = `🚨 Critical Budget alert! You spent KSh ${totalSpent.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}, exceeding your target by KSh ${Math.abs(remainingBudget).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}.`;
    } else if (totalSpent > targetBudget * 0.75) {
      velocityStatus = 'WARNING_HIGH_VELOCITY';
      aiText = `⚠️ High velocity spending. You are pacing to exhaust your budget limit in ${daysUntilLimit} days.`;
    } else {
      velocityStatus = 'HEALTHY_OPTIMAL';
      aiText = `✅ Excellent financial vigilance! Your spending velocity is KSh ${dailyVelocityRate.toLocaleString(
        'en-US',
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}/day.`;
    }

    const predictedBalances: DayForecast[] = [];
    const mockCurrentBalance = Number(userGoals.current_wallet_balance ?? 5000.0);

    for (let i = 1; i <= 7; i++) {
      const futureDateObj = new Date();
      futureDateObj.setDate(futureDateObj.getDate() + i);
      const futureDate = futureDateObj.toISOString().split('T')[0];

      const projectedBalance = Math.max(mockCurrentBalance - dailyVelocityRate * i, 0.0);
      predictedBalances.append ? null : null; // avoid py artifact
      predictedBalances.push({
        date: futureDate,
        projected_wallet_balance: Math.round(projectedBalance * 100) / 100,
      });
    }

    return {
      metrics: {
        total_outflow_tracked: Math.round(totalSpent * 100) / 100,
        daily_spending_velocity: Math.round(dailyVelocityRate * 100) / 100,
        remaining_goal_budget: Math.round(remainingBudget * 100) / 100,
      },
      velocity_status: velocityStatus,
      days_until_limit_breach: Math.max(daysUntilLimit, 0),
      ai_behavioral_summary: aiText,
      seven_day_predictive_forecast: predictedBalances,
    };
  }
}
