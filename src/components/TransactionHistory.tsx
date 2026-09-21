import React, { useState } from 'react';
import { Trash2, ArrowUpRight, ArrowDownLeft, Filter, RefreshCw } from 'lucide-react';
import { Transaction } from '../types.js';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  onDeleteTransaction,
  onRefresh,
  isLoading,
}) => {
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterDirection !== 'ALL' && tx.direction !== filterDirection) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.counterparty?.toLowerCase().includes(q) ||
        tx.transaction_id?.toLowerCase().includes(q) ||
        tx.source_channel?.toLowerCase().includes(q) ||
        tx.transaction_type?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold font-heading text-stone-900">
              Parsed Transaction Ledger
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
              {transactions.length} Records
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Real-time multi-channel ledger ingested from SMS messages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
            {(['ALL', 'INFLOW', 'OUTFLOW'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setFilterDirection(dir)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterDirection === dir
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {dir}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Ledger"
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by counterparty, reference code or channel..."
          className="w-full text-xs rounded-lg border border-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-stone-400 text-sm">
          No transactions match current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 uppercase tracking-wider font-semibold">
                <th className="pb-2.5 pl-1">Type / Channel</th>
                <th className="pb-2.5">Counterparty</th>
                <th className="pb-2.5">Reference ID</th>
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5 text-right">Amount</th>
                <th className="pb-2.5 text-center w-10">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((tx) => (
                <tr key={tx.transaction_id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3 pl-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.direction === 'INFLOW'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {tx.direction === 'INFLOW' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-800 font-mono text-[11px]">
                          {tx.source_channel}
                        </div>
                        <div className="text-[10px] text-stone-400">{tx.transaction_type}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-medium text-stone-900 max-w-xs truncate">
                    {tx.counterparty}
                  </td>
                  <td className="py-3 font-mono text-stone-500 text-[11px]">
                    {tx.transaction_id}
                  </td>
                  <td className="py-3 text-stone-500 text-[11px] whitespace-nowrap">
                    {new Date(tx.parsed_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`font-bold font-heading text-sm ${
                        tx.direction === 'INFLOW' ? 'text-emerald-600' : 'text-stone-900'
                      }`}
                    >
                      {tx.direction === 'INFLOW' ? '+' : '-'}KSh{' '}
                      {Number(tx.amount).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => onDeleteTransaction(tx.transaction_id)}
                      title="Delete entry"
                      className="p-1 rounded text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
