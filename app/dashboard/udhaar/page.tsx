'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSettlementUPILink, openUPILink } from '@/lib/upi-deep-link/upi-link';
import { ExportUtil } from '@/lib/export';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

const statusConfig = {
  lent: { label: 'Money Lent', icon: '🤝', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  received: { label: 'Money Received', icon: '🤲', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  partial: { label: 'Partially Received', icon: '🔄', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  written_off: { label: 'Written Off', icon: '🚫', color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-500' },
} as const;

const mockUdhaarRecords = [
  {
    id: '1',
    lenderName: 'Priya Sharma',
    borrowerName: 'Rahul Sharma',
    amount: 2000,
    purpose: 'Groceries',
    date: '2026-08-01',
    dueDate: '2026-08-15',
    status: 'lent' as const,
    whatsappSentAt: '2026-08-02T10:30:00Z',
    settledAt: null,
    lenderUpiId: 'priya.sharma@oksbi',
    borrowerUpiId: 'rahul.sharma@okicici',
  },
  {
    id: '2',
    lenderName: 'Amit Sharma',
    borrowerName: 'Sonia Sharma',
    amount: 500,
    purpose: 'Stationery',
    date: '2026-08-05',
    dueDate: '2026-08-20',
    status: 'partial' as const,
    whatsappSentAt: '2026-08-06T09:15:00Z',
    settledAt: '2026-08-10T14:20:00Z',
    lenderUpiId: 'amit.sharma@okaxis',
    borrowerUpiId: 'sonia.sharma@ybl',
  },
  {
    id: '3',
    lenderName: 'Priya Sharma',
    borrowerName: 'Amit Sharma',
    amount: 1500,
    purpose: 'Medical',
    date: '2026-07-20',
    dueDate: '2026-08-05',
    status: 'written_off' as const,
    whatsappSentAt: '2026-07-21T16:45:00Z',
    settledAt: null,
    lenderUpiId: 'priya.sharma@oksbi',
    borrowerUpiId: 'amit.sharma@okaxis',
  },
];

interface UdhaarRecord {
  id: string;
  lenderName: string;
  borrowerName: string;
  amount: number;
  purpose: string;
  date: string;
  dueDate: string;
  status: 'lent' | 'received' | 'partial' | 'written_off';
  whatsappSentAt?: string;
  settledAt?: string | null;
  lenderUpiId: string;
  borrowerUpiId: string;
}

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

function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const SkeletonRecord = () => (
  <div className="animate-pulse border-b border-slate-100 py-4 last:border-0">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
      </div>
      <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
    </div>
  </div>
);

const SkeletonList = () => (
  <div className="space-y-0">
    {[1, 2, 3, 4, 5].map((_, i) => <SkeletonRecord key={i} />)}
  </div>
);

const SkeletonSummary = () => (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-20 bg-slate-200 rounded-xl"></div>
      <div className="h-20 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="h-10 bg-slate-200 rounded-xl w-1/2"></div>
  </div>
);

export default function Udhaar() {
  const [records, setRecords] = useState<UdhaarRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState(0);
  const [settleStatus, setSettleStatus] = useState<'pending' | 'completed' | 'failed'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  useEffect(() => {
    const loadUdhaarRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setRecords(mockUdhaarRecords);
        showToast('Udhaar records loaded successfully', 'success');
      } catch (err) {
        setError('Failed to load udhaar records');
        showToast('Failed to load udhaar records', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadUdhaarRecords();
  }, [showToast]);

  const calculateNetPosition = (): Array<{ name: string; netAmount: number; upiId: string }> => {
    const positions: Record<string, { lent: number; borrowed: number; upiId: string }> = {};

    records.forEach(record => {
      if (!positions[record.lenderName]) {
        positions[record.lenderName] = { lent: 0, borrowed: 0, upiId: record.lenderUpiId };
      }
      if (!positions[record.borrowerName]) {
        positions[record.borrowerName] = { lent: 0, borrowed: 0, upiId: record.borrowerUpiId };
      }

      const amount = record.amount;
      if (record.status === 'lent') {
        positions[record.lenderName].lent += amount;
        positions[record.borrowerName].borrowed += amount;
      } else if (record.status === 'received') {
        positions[record.lenderName].lent -= amount;
        positions[record.borrowerName].borrowed -= amount;
      } else if (record.status === 'partial') {
        const receivedAmount = amount / 2;
        positions[record.lenderName].lent -= receivedAmount;
        positions[record.borrowerName].borrowed -= receivedAmount;
      }
    });

    return Object.entries(positions).map(([name, data]) => ({
      name,
      netAmount: data.lent - data.borrowed,
      upiId: data.upiId,
    }));
  };

  const netPositions = calculateNetPosition();
  const totalOutstanding = records
    .filter(r => r.status === 'lent' || r.status === 'partial')
    .reduce((sum, r) => sum + r.amount, 0);
  const totalReceived = records
    .filter(r => r.status === 'received')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleRecordSelect = (id: string) => {
    setSelectedRecord(id);
    const record = records.find(r => r.id === id);
    if (record) setSettleAmount(record.amount);
  };

  const handleSettleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettleAmount(parseFloat(e.target.value) || 0);
  };

  const handleSettleUdhaar = () => {
    if (!selectedRecord || settleAmount <= 0) {
      showToast('Please select a record and enter a valid amount', 'error');
      return;
    }

    const record = records.find(r => r.id === selectedRecord);
    if (!record) return;

    const upiResult = createSettlementUPILink(
      record.lenderUpiId,
      record.lenderName,
      settleAmount,
      `Udhaar Settlement - ${record.purpose}`,
      record.id
    );

    if (upiResult.success) {
      setShowSettleModal(false);
      setSettleStatus('pending');
      showToast('UPI payment link generated', 'success');
      openUPILink(upiResult.upiLink);

      setTimeout(() => {
        setSettleStatus('completed');
        setRecords(prev => prev.map(r =>
          r.id === selectedRecord
            ? { ...r, status: 'received' as const, settledAt: new Date().toISOString() }
            : r
        ));
        showToast('Payment successful! Udhaar marked as received.', 'success');
      }, 15000);
    } else {
      showToast(`Error generating UPI link: ${upiResult.error}`, 'error');
    }
  };

  const handleMarkAsReceived = () => {
    if (!selectedRecord) return;
    setRecords(prev => prev.map(r =>
      r.id === selectedRecord
        ? { ...r, status: 'received' as const, settledAt: new Date().toISOString() }
        : r
    ));
    setSelectedRecord(null);
    showToast('Udhaar marked as received', 'success');
  };

  const handleMarkAsWrittenOff = () => {
    if (!selectedRecord) return;
    setRecords(prev => prev.map(r =>
      r.id === selectedRecord
        ? { ...r, status: 'written_off' as const, settledAt: null }
        : r
    ));
    setSelectedRecord(null);
    showToast('Udhaar marked as written off', 'info');
  };

  const handleExportCSV = () => {
    ExportUtil.exportUdhaar(records, {
      filename: `kutumbledger-udhaar-${new Date().toISOString().split('T')[0]}`,
    });
    showToast('Udhaar records exported as CSV', 'success');
  };

  const handleExportExcel = () => {
    ExportUtil.exportToExcel(records, {
      filename: `kutumbledger-udhaar-${new Date().toISOString().split('T')[0]}`,
    });
    showToast('Udhaar records exported as Excel', 'success');
  };

  const getStatusConfig = (status: string) => statusConfig[status as keyof typeof statusConfig] || statusConfig.lent;

  if (loading) {
    return (
      <ToastManager>
        <SkeletonLoader loading={true} fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="h-10 bg-slate-200 rounded-xl w-56 mb-8"></div><SkeletonList /><SkeletonSummary /></div>}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-10 bg-slate-200 rounded-xl w-56 mb-8"></div>
            <SkeletonList />
            <SkeletonSummary />
          </div>
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
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error loading udhaar records</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button onClick={() => { setError(null); window.location.reload(); }} className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">Try Again</button>
          </div>
        </div>
      </ToastManager>
    );
  }

  return (
    <ToastManager>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Udhaar Tracker</h1>
            <p className="text-slate-500 mt-1">Track informal lending and borrowing within your family</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all" disabled={records.length === 0}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all" disabled={records.length === 0}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button onClick={() => showToast('Add udhaar feature coming soon!', 'info')} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              <span className="hidden sm:inline">Record Udhaar</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-50 rounded-xl"><svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Outstanding</p>
                <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-emerald-50 rounded-xl"><svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Received</p>
                <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(totalReceived)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-indigo-50 rounded-xl"><svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Position</p>
                <p className="text-xl font-bold text-indigo-600 mt-1">
                  {netPositions.reduce((sum, p) => sum + p.netAmount, 0) >= 0 ? '+' : ''}
                  {formatCurrency(netPositions.reduce((sum, p) => sum + p.netAmount, 0))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Records List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {records.length === 0 ? (
            <EmptyState title="No Udhaar Records Yet" description="Track informal lending and borrowing within your family." icon={<span className="text-4xl text-slate-300 mb-4">🤝</span>} actionText="Record First Udhaar" actionHref="#" className="py-16" />
          ) : (
            <div className="divide-y divide-slate-100">
              {records.map((record) => {
                const status = getStatusConfig(record.status);
                const daysLeft = record.dueDate ? getDaysUntilDue(record.dueDate) : null;
                const isOverdue = daysLeft !== null && daysLeft < 0;
                const isDueSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

                return (
                  <div key={record.id} className="py-4 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Main Info */}
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${status.color}`}>
                          <span className="text-xl">{status.icon}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate sm:max-w-xs">
                            {record.lenderName} lent to {record.borrowerName}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <span>{formatCurrency(record.amount)}</span>
                              <span>for</span>
                              <span>{record.purpose}</span>
                            </span>
                            <span>•</span>
                            <span>{formatDate(record.date)}</span>
                            {record.dueDate && (
                              <>
                                <span>•</span>
                                <span className={isOverdue ? 'text-red-600' : isDueSoon ? 'text-amber-600' : 'text-slate-500'}>
                                  Due: {formatDate(record.dueDate)}
                                  {isOverdue && ` (${Math.abs(daysLeft)} days overdue)`}
                                  {isDueSoon && !isOverdue && ` (${daysLeft} days left)`}
                                </span>
                              </>
                            )}
                          </div>
                          {record.whatsappSentAt && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              WhatsApp reminder sent
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${status.color} self-center`}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: status.dot }}></span>
                          {status.label}
                        </span>
                        <div className="flex items-center gap-2">
                          {(record.status === 'lent' || record.status === 'partial') && (
                            <button
                              onClick={() => { handleRecordSelect(record.id); setShowSettleModal(true); }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                              Settle
                            </button>
                          )}
                          {record.status === 'received' && (
                            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors" disabled>
                              Completed
                            </button>
                          )}
                          {record.status === 'written_off' && (
                            <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-sm font-medium rounded-lg transition-colors" disabled>
                              Written Off
                            </button>
                          )}
                          {(record.status === 'lent' || record.status === 'partial') && record.lenderUpiId && (
                            <button
                              onClick={() => { handleRecordSelect(record.id); setShowSettleModal(true); setSettleAmount(record.amount); }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Net Position Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-5">Net Positions</h2>
          <div className="space-y-3">
            {netPositions.map((pos) => {
              const isCreditor = pos.netAmount > 0;
              const isDebtor = pos.netAmount < 0;
              const isSettled = pos.netAmount === 0;
              return (
                <div key={pos.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCreditor ? 'bg-emerald-100' : isDebtor ? 'bg-red-100' : 'bg-slate-100'}`}>
                      <svg className={`w-5 h-5 ${isCreditor ? 'text-emerald-600' : isDebtor ? 'text-red-600' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isCreditor ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /> : isDebtor ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7v-18" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />}
                      </svg>
                    </div>
                    <span className="font-medium text-slate-900">{pos.name}</span>
                  </div>
                  <span className={`font-mono text-lg ${isCreditor ? 'text-emerald-600' : isDebtor ? 'text-red-600' : 'text-slate-600'}`}>
                    {isCreditor ? '+' : isDebtor ? '-' : '±'}{formatCurrency(Math.abs(pos.netAmount))}
                    <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${isCreditor ? 'bg-emerald-100 text-emerald-700' : isDebtor ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                      {isCreditor ? 'Creditor' : isDebtor ? 'Debtor' : 'Settled'}
                    </span>
                  </span>
                </div>
              );
            })}
            {netPositions.length === 0 && (
              <div className="text-center py-8 text-slate-500">No net positions to display</div>
            )}
          </div>
        </div>
      </div>

      {/* Settle Modal */}
      {showSettleModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Settle Udhaar</h2>
                <button onClick={() => { setShowSettleModal(false); setSelectedRecord(null); }} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {!settleStatus || settleStatus === 'pending' ? (
                <>
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500 mb-1">From</p>
                    <p className="font-medium text-slate-900">{records.find(r => r.id === selectedRecord)?.borrowerName}</p>
                    <p className="text-sm text-slate-500 mt-2">To</p>
                    <p className="font-medium text-slate-900">{records.find(r => r.id === selectedRecord)?.lenderName}</p>
                    <p className="text-sm text-slate-500 mt-2">Purpose</p>
                    <p className="font-medium text-slate-900">{records.find(r => r.id === selectedRecord)?.purpose}</p>
                  </div>

                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount to Settle (₹)</label>
                  <input type="number" min="1" step="0.01" placeholder="Enter amount" value={settleAmount} onChange={(e) => setSettleAmount(parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg" autoFocus />

                  <div className="mt-6 flex gap-3">
                    <button onClick={() => { setShowSettleModal(false); setSelectedRecord(null); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">Cancel</button>
                    <button onClick={handleSettleUdhaar} disabled={loading || settleAmount <= 0} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
                      {loading ? 'Generating UPI Link...' : 'Generate UPI Payment Link'}
                    </button>
                  </div>
                </>
              ) : settleStatus === 'completed' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Payment Successful!</h3>
                  <p className="text-slate-600 mb-6">Udhaar marked as received.</p>
                  <button onClick={() => { setShowSettleModal(false); setSelectedRecord(null); setSettleStatus('pending'); setSettleAmount(0); }} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors">Done</button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-2 2l-2 2m-2-2l2-2m-2 2l-2-2" /></svg>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Payment Failed</h3>
                  <p className="text-slate-600 mb-6">Unable to process payment.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setSettleStatus('pending')} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors">Retry</button>
                    <button onClick={() => { setShowSettleModal(false); setSelectedRecord(null); setSettleStatus('pending'); setSettleAmount(0); }} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ToastManager>
  );
}