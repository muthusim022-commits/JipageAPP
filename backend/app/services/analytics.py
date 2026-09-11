import pandas as pd
from datetime import datetime, timedelta

class JipageAnalyticsEngine:
    @staticmethod
    def run_predictive_flow(historical_transactions: list, user_goals: dict) -> dict:
        """
        Processes transaction history using Pandas to calculate spending velocity,
        run 7-day wallet forecasts, and generate AI-style behavioral summaries.
        """
        if not historical_transactions:
            return {
                "velocity_status": "STABLE",
                "days_until_limit": -1,
                "ai_behavioral_summary": "Welcome to JipageApp! Feed me M-Pesa alerts or bank logs to unlock personalized behavior trends."
            }

        df = pd.DataFrame(historical_transactions)
        df["amount"] = pd.to_numeric(df["amount"])
        
        outflows_df = df[df["direction"] == "OUTFLOW"]
        total_spent = outflows_df["amount"].sum()
        
        days_tracked = max(len(outflows_df["parsed_at"].unique()), 1)
        daily_velocity_rate = total_spent / days_tracked

        target_budget = user_goals.get("monthly_budget_limit", 10000.0)
        remaining_budget = target_budget - total_spent
        
        if daily_velocity_rate > 0:
            days_until_limit = int(remaining_budget / daily_velocity_rate)
        else:
            days_until_limit = 999

        if total_spent > target_budget:
            velocity_status = "CRITICAL_BURNOUT"
            ai_text = f"🚨 Critical Budget alert! You spent KSh {total_spent:,.2f}, exceeding your target by KSh {abs(remaining_budget):,.2f}."
        elif total_spent > (target_budget * 0.75):
            velocity_status = "WARNING_HIGH_VELOCITY"
            ai_text = f"⚠️ High velocity spending. You are pacing to exhaust your budget limit in {days_until_limit} days."
        else:
            velocity_status = "HEALTHY_OPTIMAL"
            ai_text = f"✅ Excellent financial vigilance! Your spending velocity is KSh {daily_velocity_rate:,.2f}/day."

        predicted_balances = []
        mock_current_balance = user_goals.get("current_wallet_balance", 5000.0)
        
        for i in range(1, 8):
            future_date = (datetime.now() + timedelta(days=i)).strftime("%Y-%m-%d")
            projected_balance = max(mock_current_balance - (daily_velocity_rate * i), 0.0)
            predicted_balances.append({
                "date": future_date,
                "projected_wallet_balance": round(projected_balance, 2)
            })

        return {
            "metrics": {
                "total_outflow_tracked": float(total_spent),
                "daily_spending_velocity": float(round(daily_velocity_rate, 2)),
                "remaining_goal_budget": float(round(remaining_budget, 2))
            },
            "velocity_status": velocity_status,
            "days_until_limit_breach": max(days_until_limit, 0),
            "ai_behavioral_summary": ai_text,
            "seven_day_predictive_forecast": predicted_balances
        }
