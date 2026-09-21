export interface Transaction {
  transaction_id: string;
  source_channel: string;
  amount: number;
  transaction_type: string;
  direction: 'INFLOW' | 'OUTFLOW';
  counterparty: string;
  parsed_at: string;
  raw_sms?: string;
  sender_header?: string;
}

export interface UserGoals {
  monthly_budget_limit: number;
  current_wallet_balance: number;
}

export interface PredictiveMetrics {
  total_outflow_tracked: number;
  daily_spending_velocity: number;
  remaining_goal_budget: number;
}

export interface DayForecast {
  date: string;
  projected_wallet_balance: number;
}

export interface PredictiveResults {
  metrics: PredictiveMetrics;
  velocity_status: 'STABLE' | 'HEALTHY_OPTIMAL' | 'WARNING_HIGH_VELOCITY' | 'CRITICAL_BURNOUT';
  days_until_limit_breach: number;
  ai_behavioral_summary: string;
  seven_day_predictive_forecast: DayForecast[];
}
