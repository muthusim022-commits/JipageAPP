import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { MpesaSmsParser } from './src/services/parser.js';
import { JipageAnalyticsEngine } from './src/services/analytics.js';
import { Transaction, UserGoals } from './src/types.js';

// In-memory data store seeded with realistic initial transactions
let currentGoals: UserGoals = {
  monthly_budget_limit: 15000,
  current_wallet_balance: 8500,
};

let transactionStore: Transaction[] = [
  {
    transaction_id: 'QKH8910419',
    source_channel: 'MPESA',
    amount: 1450.0,
    transaction_type: 'TRANSFER_OUT',
    direction: 'OUTFLOW',
    counterparty: 'NAIVAS SUPERMARKET',
    parsed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    raw_sms: 'QKH8910419 Confirmed. Ksh1,450.00 paid to NAIVAS SUPERMARKET on 19/9/26 at 4:15 PM.',
    sender_header: 'MPESA',
  },
  {
    transaction_id: 'QKI1029381',
    source_channel: 'MPESA',
    amount: 500.0,
    transaction_type: 'AIRTIME_PURCHASE',
    direction: 'OUTFLOW',
    counterparty: 'TELECOM_PROVIDER',
    parsed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    raw_sms: 'QKI1029381 Confirmed. You bought Ksh500.00 of airtime on 20/9/26 at 10:30 AM.',
    sender_header: 'MPESA',
  },
  {
    transaction_id: 'QKJ4928104',
    source_channel: 'MPESA',
    amount: 3200.0,
    transaction_type: 'TRANSFER_OUT',
    direction: 'OUTFLOW',
    counterparty: 'TOTAL ENERGIES PETROL',
    parsed_at: new Date().toISOString(),
    raw_sms: 'QKJ4928104 Confirmed. Ksh3,200.00 sent to TOTAL ENERGIES PETROL on 21/9/26 at 1:45 PM.',
    sender_header: 'MPESA',
  },
  {
    transaction_id: 'QKA2819401',
    source_channel: 'BANK_EQUITY',
    amount: 12000.0,
    transaction_type: 'RECEIVE_MONEY',
    direction: 'INFLOW',
    counterparty: 'CONSULTING CLIENT DEPOSIT',
    parsed_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    raw_sms: 'REF: QKA2819401 Ksh 12,000.00 credited to account from CONSULTING CLIENT DEPOSIT on 18/9/26.',
    sender_header: 'EQUITY',
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // FastAPI Root parity endpoint (if requested via JSON/curl)
  app.get('/', (req, res, next) => {
    if (req.accepts('html')) {
      return next();
    }
    res.json({ status: 'JipageApp Backend is Running' });
  });

  // POST /api/v1/parse-sms (exact parity with FastAPI)
  app.post('/api/v1/parse-sms', (req, res) => {
    const { sms_content, sender_header } = req.body || {};
    if (!sms_content || typeof sms_content !== 'string' || !sms_content.trim()) {
      return res.status(400).json({ detail: 'SMS content cannot be empty' });
    }

    const structuredData = MpesaSmsParser.parseSms(
      sms_content,
      sender_header || 'UNKNOWN'
    );
    res.json({ success: true, data: structuredData });
  });

  // POST /api/v1/analytics/predictive-summary (exact parity with FastAPI)
  app.post('/api/v1/analytics/predictive-summary', (req, res) => {
    const { historical_transactions, user_goals } = req.body || {};
    const txList = Array.isArray(historical_transactions) ? historical_transactions : [];
    const goals = user_goals && typeof user_goals === 'object' ? user_goals : {};

    const analysisResults = JipageAnalyticsEngine.runPredictiveFlow(txList, goals);
    res.json({ success: true, results: analysisResults });
  });

  // In-memory CRUD endpoints for live frontend persistence
  app.get('/api/v1/state', (req, res) => {
    const analysisResults = JipageAnalyticsEngine.runPredictiveFlow(
      transactionStore,
      currentGoals
    );
    res.json({
      success: true,
      transactions: transactionStore,
      goals: currentGoals,
      analysis: analysisResults,
    });
  });

  app.get('/api/v1/transactions', (req, res) => {
    res.json({ success: true, transactions: transactionStore });
  });

  app.post('/api/v1/transactions', (req, res) => {
    const { sms_content, sender_header, transaction } = req.body || {};

    let newTx: Transaction;
    if (transaction && transaction.transaction_id) {
      newTx = transaction;
    } else if (sms_content) {
      newTx = MpesaSmsParser.parseSms(sms_content, sender_header || 'UNKNOWN');
    } else {
      return res.status(400).json({ detail: 'Provide transaction object or sms_content' });
    }

    // Prepend new transaction
    transactionStore = [newTx, ...transactionStore.filter((t) => t.transaction_id !== newTx.transaction_id)];
    const analysisResults = JipageAnalyticsEngine.runPredictiveFlow(
      transactionStore,
      currentGoals
    );

    res.json({
      success: true,
      transaction: newTx,
      analysis: analysisResults,
    });
  });

  app.delete('/api/v1/transactions/:id', (req, res) => {
    const { id } = req.params;
    transactionStore = transactionStore.filter((t) => t.transaction_id !== id);
    const analysisResults = JipageAnalyticsEngine.runPredictiveFlow(
      transactionStore,
      currentGoals
    );
    res.json({
      success: true,
      deleted_id: id,
      analysis: analysisResults,
    });
  });

  app.get('/api/v1/goals', (req, res) => {
    res.json({ success: true, goals: currentGoals });
  });

  app.put('/api/v1/goals', (req, res) => {
    const { monthly_budget_limit, current_wallet_balance } = req.body || {};
    if (typeof monthly_budget_limit === 'number') {
      currentGoals.monthly_budget_limit = monthly_budget_limit;
    }
    if (typeof current_wallet_balance === 'number') {
      currentGoals.current_wallet_balance = current_wallet_balance;
    }

    const analysisResults = JipageAnalyticsEngine.runPredictiveFlow(
      transactionStore,
      currentGoals
    );
    res.json({
      success: true,
      goals: currentGoals,
      analysis: analysisResults,
    });
  });

  // Vite middleware in development or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`JipageApp Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
