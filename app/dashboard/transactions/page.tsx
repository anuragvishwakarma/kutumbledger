'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ExportUtil } from '@/lib/export';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

const categoryIcons: Record<string, string> = {
  kirana: '🛒',
  sabzi_mandi: '🥬',
  salary: '💰',
  rent: '🏠',
  utilities: '💡',
  transport: '🚌',
  medical: '🏥',
  entertainment: '🎮',
  dining: '🍽️',
  shopping: '🛍️',
  other: '📦',
};

const categoryLabels: Record<string, string> = {
  kirana: 'Kirana',
  sabzi_mandi: 'Sabzi Mandi',
  salary: 'Salary',
  rent: 'Rent',
  utilities: 'Utilities',
  transport: 'Transport',
  medical: 'Medical',
  entertainment: 'Entertainment',
  dining: 'Dining Out',
  shopping: 'Shopping',
  other: 'Other',
};

const mockTransactions = [
  {
    id: '1',
    date: '2026-08-14',
    type: 'expense' as const,
    category: 'kirana',
    description: 'Weekly grocery shopping',
    amount: 2450,
    paymentMethod: 'upi',
    isRecurring: false,
    refId: 'UPI123456789',
    UPIId: 'priya.sharma@oksbi',
  },
  {
    id: '2',
    date: '2026-08-13',
    type: 'expense' as const,
    category: 'sabzi_mandi',
    description: 'Vegetables from local market',
    amount: 1890,
    paymentMethod: 'cash',
    isRecurring: false,
  },
  {
    id: '3',
    date: '2026-08-12',
    type: 'income' as const,
    category: 'salary',
    description: 'Monthly salary',
    amount: 50000,
    paymentMethod: 'bank',
    isRecurring: false,
    refId: 'NEFT987654321',
  },
  {
    id: '4',
    date: '2026-08-11',
    type: 'expense' as const,
    category: 'transport',
    description: 'Auto-rickshaw fare',
    amount: 120,
    paymentMethod: 'cash',
    isRecurring: false,
  },
  {
    id: '5',
    date: '2026-08-10',
    type: 'expense' as const,
    category: 'dining',
    description: 'Family dinner',
    amount: 3200,
    paymentMethod: 'card',
    isRecurring: false,
    refId: 'CARD555666777',
  },
  {
    id: '6',
    date: '2026-08-09',
    type: 'income' as const,
    category: 'salary',
    description: 'Freelance project',
    amount: 15000,
    paymentMethod: 'upi',
    isRecurring: false,
    refId: 'UPI999888777',
  },
];

const paymentMethodIcons: Record<string, string> = {
  upi: '📱',
  cash: '💷',
  card: '💳',
  bank: '🏦',
};

const paymentMethodColors: Record<string, string> = {
  upi: 'bg-emerald-100 text-emerald-700',
  cash: 'bg-amber-100 text-amber-700',
  card: 'bg-blue-100 text-blue-700',
  bank: 'bg-indigo-100 text-indigo-700',
};

type TransactionType = typeof mockTransactions[0];

function formatCurrency(value: number): string {
  return `₹${(Math.abs(value) / 100).toFixed(2)}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

const SkeletonTransaction = () => (
  <div className="flex items-center p-4 border-b border-slate-100 animate-pulse">
    <div className="w-12 h-12 bg-slate-200 rounded-xl flex-shrink-0"></div>
    <div className="flex-1 ml-4 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
    </div>
    <div className="text-right">
      <div className="h-6 bg-slate-200 rounded w-20"></div>
      <div className="h-3 bg-slate-200 rounded w-16 mt-1"></div>
    </div>
  </div>
);

const SkeletonList = () => (
  <div className="space-y-0">
    {[1, 2, 3, 4, 5].map((_, i) => (
      <SkeletonTransaction key={i} />
    ))}
  </div>
);

export default function TransactionsList() {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setTransactions(mockTransactions);
        showToast('Transactions loaded successfully', 'success');
      } catch (err) {
        setError('Failed to load transactions');
        showToast('Failed to load transactions', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, [showToast]);

  const handleExportCSV = () => {
    ExportUtil.exportTransactions(transactions, {
      filename: `kutumbledger-transactions-${new Date().toISOString().split('T')[0]}`,
    });
    showToast('Transactions exported as CSV', 'success');
  };

  const handleExportExcel = () => {
    ExportUtil.exportToExcel(transactions, {
      filename: `kutumbledger-transactions-${new Date().toISOString().split('T')[0]}`,
    });
    showToast('Transactions exported as Excel', 'success');
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'income':
        return { icon: '📈', color: 'bg-green-100 text-green-700', amountColor: 'text-green-600', sign: '+' };
      case 'expense':
        return { icon: '📉', color: 'bg-red-100 text-red-700', amountColor: 'text-red-600', sign: '-' };
      default:
        return { icon: '🔄', color: 'bg-blue-100 text-blue-700', amountColor: 'text-blue-600', sign: '' };
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast('Transaction deleted', 'success');
    }
  };

  if (loading) {
    return (
      <ToastManager>
        <SkeletonLoader loading={true} fallback={<SkeletonList />}>
          <SkeletonList />
        </SkeletonLoader>
      </ToastManager>
    );
  }

  if (error) {
    return (
      <ToastManager>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error loading transactions</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => { setError(null); window.location.reload(); }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ToastManager>
    );
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netTotal = totalIncome - totalExpense;

  return (
    <ToastManager>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Transactions</h1>
            <p className="text-slate-500 mt-1">View and manage all family transactions</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard/transactions/add"
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Add Transaction</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
                disabled={loading || transactions.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">CSV</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
                disabled={loading || transactions.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-50 rounded-xl">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0l1-1m-1 1l-1-1" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Income</p>
                <p className="text-xl font-bold text-green-600 mt-1">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-50 rounded-xl">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Expense</p>
                <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${netTotal >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <svg className={`w-5 h-5 ${netTotal >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {netTotal >= 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-2 2l-2 2m-2-2l2-2m-2 2l-2-2" />
                  )}
                </svg>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Total</p>
                <p className={`text-xl font-bold mt-1 ${netTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {netTotal >= 0 ? '+' : ''}{formatCurrency(netTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {transactions.length === 0 ? (
            <EmptyState
              title="No Transactions Yet"
              description="Add your first transaction to get started tracking your family's finances."
              icon={<span className="text-4xl text-slate-300 mb-4">💳</span>}
              actionText="Add First Transaction"
              actionHref="/dashboard/transactions/add"
              className="py-16"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((txn) => {
                const typeStyles = getTypeStyles(txn.type);
                const categoryIcon = categoryIcons[txn.category] || '📦';
                const categoryLabel = categoryLabels[txn.category] || txn.category.replace('_', ' ').toUpperCase();
                const methodIcon = paymentMethodIcons[txn.paymentMethod] || '💳';
                const methodColor = paymentMethodColors[txn.paymentMethod] || 'bg-slate-100 text-slate-700';

                return (
                  <div
                    key={txn.id}
                    className="flex items-center p-4 hover:bg-slate-50 transition-colors duration-200 group"
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${typeStyles.color}`}>
                        <span className="text-xl">{typeStyles.icon}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-slate-900 truncate">{txn.description}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${typeStyles.color}`}>
                          {categoryLabel}
                        </span>
                        {txn.isRecurring && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Recurring
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span>{categoryIcon}</span>
                          {categoryLabel}
                        </span>
                        <span>•</span>
                        <span>{formatDate(txn.date)}</span>
                        {txn.refId && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-400">Ref: {txn.refId.slice(-8)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-bold text-lg ${typeStyles.amountColor}`}>
                          {typeStyles.sign}{formatCurrency(txn.amount)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium ${methodColor}`}>
                          <span>{methodIcon}</span>
                          {txn.paymentMethod.toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleDelete(txn.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          aria-label="Delete transaction"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {transactions.length > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>{transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
            <span className="text-slate-400">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </ToastManager>
  );
}