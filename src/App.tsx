import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.js';
import { VelocityAlertBanner } from './components/VelocityAlertBanner.js';
import { PredictiveForecastChart } from './components/PredictiveForecastChart.js';
import { SmsParserCard } from './components/SmsParserCard.js';
import { TransactionHistory } from './components/TransactionHistory.js';
import { BudgetGoalModal } from './components/BudgetGoalModal.js';
import { Transaction, UserGoals, PredictiveResults } from './types.js';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<UserGoals>({
    monthly_budget_limit: 15000,
    current_wallet_balance: 8500,
  });
  const [analysis, setAnalysis] = useState<PredictiveResults | null>(null);
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [serverStatus, setServerStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppState = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/state');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        if (data.goals) setGoals(data.goals);
        if (data.analysis) setAnalysis(data.analysis);
        setServerStatus(true);
      } else {
        setServerStatus(false);
      }
    } catch (err) {
      console.error('Failed to connect to JipageApp server:', err);
      setServerStatus(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppState();
  }, [fetchAppState]);

  const handleTransactionAdded = (newTx: Transaction) => {
    setTransactions((prev) => [
      newTx,
      ...prev.filter((t) => t.transaction_id !== newTx.transaction_id),
    ]);
    // Refresh state to guarantee server-side synchronized forecast
    fetchAppState();
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/transactions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions((prev) => prev.filter((t) => t.transaction_id !== id));
        if (data.analysis) setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleSaveGoals = async (newGoals: UserGoals) => {
    try {
      const res = await fetch('/api/v1/goals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoals),
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals);
        if (data.analysis) setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Failed to update goals:', err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <Header
        goals={goals}
        onOpenGoals={() => setIsGoalsModalOpen(true)}
        serverStatus={serverStatus}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Spending Velocity & Predictive Status */}
        <VelocityAlertBanner analysis={analysis} goals={goals} />

        {/* 7-Day Predictive Cash Flow Chart */}
        <PredictiveForecastChart
          forecast={analysis?.seven_day_predictive_forecast || []}
          currentBalance={goals.current_wallet_balance}
        />

        {/* Core Capabilities: Interactive Ingestion & Transaction Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <SmsParserCard onTransactionAdded={handleTransactionAdded} />
          </div>
          <div className="lg:col-span-6">
            <TransactionHistory
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onRefresh={fetchAppState}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-stone-500">
          JipageApp — Intelligent Financial Visibility for Individuals & MSMEs &bull; Built on Node.js / Express & React
        </div>
      </footer>

      <BudgetGoalModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goals={goals}
        onSaveGoals={handleSaveGoals}
      />
    </div>
  );
}
