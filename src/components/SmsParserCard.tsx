import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, Send, AlertCircle, RefreshCw } from 'lucide-react';
import { Transaction } from '../types.js';

interface SmsParserCardProps {
  onTransactionAdded: (tx: Transaction) => void;
}

const SAMPLE_MESSAGES = [
  {
    title: 'M-Pesa Buy Goods',
    sender: 'MPESA',
    text: 'QK7891234 Confirmed. Ksh2,450.00 paid to CHANDARANA SUPERMARKET on 21/9/26 at 12:10 PM. New M-PESA balance is Ksh6,050.00.',
  },
  {
    title: 'M-Pesa Transfer Out',
    sender: 'MPESA',
    text: 'QK9123891 Confirmed. Ksh1,200.00 sent to JOHN NJOROGE 0712345678 on 21/9/26 at 2:30 PM. New M-PESA balance is Ksh4,850.00.',
  },
  {
    title: 'Bank Loan Disbursed',
    sender: 'KCB_BANK',
    text: 'REF: KCB9921092 Ksh 15,000.00 loan approved and deposited into your account on 21/9/26 via Mobile Banking.',
  },
  {
    title: 'Airtime Purchase',
    sender: 'MPESA',
    text: 'QK4419203 Confirmed. You bought Ksh350.00 of airtime on 21/9/26 at 9:05 AM.',
  },
  {
    title: 'Inward Bank Deposit',
    sender: 'EQUITY',
    text: 'REF: EQ9910248 Ksh 8,500.00 received from MAWINGU VENTURES LTD on 21/9/26 at 11:20 AM.',
  },
];

export const SmsParserCard: React.FC<SmsParserCardProps> = ({ onTransactionAdded }) => {
  const [smsContent, setSmsContent] = useState(SAMPLE_MESSAGES[0].text);
  const [senderHeader, setSenderHeader] = useState(SAMPLE_MESSAGES[0].sender);
  const [parsedResult, setParsedResult] = useState<Transaction | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleParse = async () => {
    if (!smsContent.trim()) {
      setError('Please enter SMS text to parse');
      return;
    }
    setError(null);
    setIsParsing(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/v1/parse-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sms_content: smsContent,
          sender_header: senderHeader || 'UNKNOWN',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.detail || 'Failed to parse SMS');
      }

      setParsedResult(json.data);
    } catch (err: any) {
      setError(err.message || 'Error occurred while parsing SMS');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSaveToLedger = async () => {
    if (!parsedResult) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: parsedResult,
        }),
      });

      const json = await res.json();
      if (res.ok && json.transaction) {
        onTransactionAdded(json.transaction);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save transaction to ledger');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold font-heading text-stone-900">
              M-Pesa & Bank SMS Ingestion Engine
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
              POST /api/v1/parse-sms
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Real-time pattern extraction for validation codes, counterparties, directions, and KSh amounts
          </p>
        </div>
      </div>

      {/* Preset sample pill buttons */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
          Quick Preset Templates
        </label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_MESSAGES.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSmsContent(sample.text);
                setSenderHeader(sample.sender);
                setParsedResult(null);
                setSaveSuccess(false);
              }}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Input controls */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-3">
            <label className="text-xs font-medium text-stone-700 block mb-1">
              SMS Content Body
            </label>
            <textarea
              id="sms-content-input"
              rows={3}
              value={smsContent}
              onChange={(e) => setSmsContent(e.target.value)}
              placeholder="Paste raw M-Pesa or Bank alert SMS here..."
              className="w-full text-sm rounded-lg border border-stone-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-stone-700 block mb-1">
              Sender Header
            </label>
            <input
              id="sender-header-input"
              type="text"
              value={senderHeader}
              onChange={(e) => setSenderHeader(e.target.value)}
              placeholder="e.g. MPESA, EQUITY"
              className="w-full text-sm rounded-lg border border-stone-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            />
            <span className="text-[11px] text-stone-400 mt-1 block">Phone SIM metadata</span>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            id="parse-sms-btn"
            type="button"
            onClick={handleParse}
            disabled={isParsing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isParsing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Parsing SMS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute Parser Matrix</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Parsed JSON Result Card */}
      {parsedResult && (
        <div id="parsed-result-card" className="mt-4 pt-4 border-t border-stone-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> Structured Output Extracted
            </span>
            <span className="text-xs text-stone-400 font-mono">{parsedResult.transaction_id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <span className="text-[11px] text-stone-400 block">Amount</span>
              <span className="font-bold text-stone-900 text-sm">
                KSh {parsedResult.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block">Direction</span>
              <span
                className={`font-semibold px-1.5 py-0.5 rounded text-[11px] inline-block ${
                  parsedResult.direction === 'INFLOW'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {parsedResult.direction}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block">Channel</span>
              <span className="font-medium text-stone-800 font-mono">
                {parsedResult.source_channel}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block">Type</span>
              <span className="font-medium text-stone-800">
                {parsedResult.transaction_type}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-2">
              <span className="text-[11px] text-stone-400 block">Counterparty</span>
              <span className="font-semibold text-stone-900 truncate block" title={parsedResult.counterparty}>
                {parsedResult.counterparty}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-stone-500">
              Confidence Score: 100% (Deterministic regex matrix match)
            </span>
            <button
              id="save-to-ledger-btn"
              type="button"
              onClick={handleSaveToLedger}
              disabled={isSaving || saveSuccess}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-stone-900 hover:bg-stone-800 text-white transition-colors disabled:opacity-75 cursor-pointer"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recorded in Ledger!</span>
                </>
              ) : isSaving ? (
                <span>Recording...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Commit to Financial Ledger</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
