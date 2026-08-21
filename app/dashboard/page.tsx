'use client';

import { useState, useEffect } from 'react';
import { ExportUtil } from '@/lib/export';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

// Mock financial data
const mockIncome = 85000; // ₹850.00
const mockExpense = 62000; // ₹620.00
const mockSavings = mockIncome - mockExpense; // ₹230.00
const mockSavingsRate = ((mockSavings / mockIncome) * 100).toFixed(1); // 27.1%

const mockCategories = [
  { name: 'Kirana', amount: 18500, icon: '🛒' },
  { name: 'Sabzi Mandi', amount: 12300, icon: '🥬' },
  { name: 'Doodhwala', amount: 8500, icon: '🥛' },
  { name: 'Auto-rickshaw', amount: 7200, icon: '🛺' },
  { name: 'Electricity', amount: 4500, icon: '💡' },
  { name: 'Internet', amount: 2200, icon: '🌐' },
];

const mockUpcomingBills = [
  { name: 'Electricity', amount: 4500, dueDate: '2026-08-20', daysLeft: 6, icon: '💡' },
  { name: 'Water', amount: 1800, dueDate: '2026-08-22', daysLeft: 8, icon: '💧' },
  { name: 'DTH Recharge', amount: 1200, dueDate: '2026-08-25', daysLeft: 11, icon: '📺' },
  { name: 'Mobile Recharge', amount: 300, dueDate: '2026-08-18', daysLeft: 4, icon: '📱' },
  { name: 'Gas Cylinder', amount: 900, dueDate: '2026-08-28', daysLeft: 14, icon: '🔥' },
];

const mockPaymentMethodDistribution = [
  { method: 'UPI', amount: 28000, percentage: 45, icon: '📱', color: 'bg-emerald-500' },
  { method: 'Cash', amount: 20000, percentage: 32, icon: '💷', color: 'bg-amber-500' },
  { method: 'Card', amount: 10000, percentage: 16, icon: '💳', color: 'bg-blue-500' },
  { method: 'Bank', amount: 4000, percentage: 7, icon: '🏦', color: 'bg-indigo-500' },
];

// Skeleton components
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="h-4 bg-slate-200 rounded w-1/3 mb-4 animate-pulse"></div>
    <div className="h-8 bg-slate-200 rounded w-1/2 mb-2 animate-pulse"></div>
    <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
  </div>
);

const SkeletonChart = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-6 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3, 4].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-8 bg-slate-200 rounded w-1/4 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonBills = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-6 animate-pulse"></div>
    <div className="space-y-3">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            <div className="h-4 bg-slate-200 rounded w-24"></div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-3 bg-slate-200 rounded w-32 mt-1"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonActions = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2 mb-6"></div>
        <div className="h-10 bg-slate-200 rounded-full"></div>
      </div>
    ))}
  </div>
);

const SkeletonExport = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
    <div className="flex gap-4">
      <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
      <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpense, setTodayExpense] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(mockIncome);
  const [monthlyExpense, setMonthlyExpense] = useState(mockExpense);
  const [savingsRate, setSavingsRate] = useState(mockSavingsRate);
  const [categories, setCategories] = useState(mockCategories);
  const [upcomingBills, setUpcomingBills] = useState(mockUpcomingBills);
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethodDistribution);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setTodayIncome(2500);
        setTodayExpense(1800);
        showToast('Dashboard loaded successfully', 'info');
      } catch (err) {
        setError('Failed to load dashboard data');
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [showToast]);

  const netToday = todayIncome - todayExpense;
  const netMonthly = monthlyIncome - monthlyExpense;

  const cashExpense = paymentMethods.find(method => method.method === 'Cash')?.amount || 0;
  const digitalExpense = monthlyExpense - cashExpense;
  const cashPercentage = monthlyExpense > 0 ? (cashExpense / monthlyExpense) * 100 : 0;
  const digitalPercentage = monthlyExpense > 0 ? (digitalExpense / monthlyExpense) * 100 : 0;

  const dashboardData = [
    { metric: "Today's Income", value: todayIncome, currency: "₹" },
    { metric: "Today's Expense", value: todayExpense, currency: "₹" },
    { metric: "Net Today", value: netToday, currency: "₹" },
    { metric: "Monthly Income", value: monthlyIncome, currency: "₹" },
    { metric: "Monthly Expense", value: monthlyExpense, currency: "₹" },
    { metric: "Net Monthly", value: netMonthly, currency: "₹" },
    { metric: "Savings Rate", value: parseFloat(savingsRate), currency: "%" },
    { metric: "Cash Expenses", value: cashExpense, currency: "₹" },
    { metric: "Digital Expenses", value: digitalExpense, currency: "₹" }
  ];

  const handleExportCSV = () => {
    ExportUtil.exportToCSV(dashboardData, {
      filename: `kutumbledger-dashboard-${new Date().toISOString().split('T')[0]}`
    });
    showToast('CSV exported successfully', 'success');
  };

  const handleExportExcel = () => {
    ExportUtil.exportToExcel(dashboardData, {
      filename: `kutumbledger-dashboard-${new Date().toISOString().split('T')[0]}`
    });
    showToast('Excel exported successfully', 'success');
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    setTimeout(() => window.location.reload(), 100);
  };

  const formatCurrency = (value: number) => `₹${(value / 100).toFixed(2)}`;
  const formatCurrencyRaw = (value: number) => `₹${value.toFixed(2)}`;

  // Status color for bills
  const getBillStatus = (daysLeft: number) => {
    if (daysLeft <= 0) return { label: 'Overdue', class: 'bg-red-100 text-red-700 border-red-200' };
    if (daysLeft <= 2) return { label: 'Due Soon', class: 'bg-amber-100 text-amber-700 border-amber-200' };
    if (daysLeft <= 7) return { label: 'This Week', class: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: 'Upcoming', class: 'bg-slate-100 text-slate-700 border-slate-200' };
  };

  // Payment method color mapping
  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      UPI: 'bg-emerald-500',
      Cash: 'bg-amber-500',
      Card: 'bg-blue-500',
      Bank: 'bg-indigo-500',
    };
    return colors[method] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <ToastManager>
        <SkeletonLoader
          loading={true}
          fallback={
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonChart />
                <SkeletonChart />
              </div>
              <SkeletonBills />
              <SkeletonActions />
              <SkeletonExport />
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonChart />
              <SkeletonChart />
            </div>
            <SkeletonBills />
            <SkeletonActions />
            <SkeletonExport />
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
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error loading dashboard</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </ToastManager>
    );
  }

  return (
    <ToastManager>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Income */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0l1-1m-1 1l-1-1" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Income</p>
                <p className="text-2xl font-bold text-slate-900 mt-1" id="todayIncome">+{formatCurrency(todayIncome)}</p>
              </div>
            </div>
          </div>

          {/* Today's Expense */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-50 rounded-xl">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Expense</p>
                <p className="text-2xl font-bold text-slate-900 mt-1" id="todayExpense">-{formatCurrency(todayExpense)}</p>
              </div>
            </div>
          </div>

          {/* Net Today */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${netToday >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <svg className={`w-6 h-6 ${netToday >= 0 ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {netToday >= 0 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m-2 2l-2 2m-2-2l2-2m-2 2l-2-2" />
                  )}
                </svg>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Net Today</p>
                <p className={`text-2xl font-bold mt-1 ${netToday >= 0 ? 'text-green-600' : 'text-red-600'}`} id="netToday">
                  {netToday >= 0 ? `+${formatCurrency(netToday)}` : `-${formatCurrency(Math.abs(netToday))}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Overview & Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Overview Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Monthly Overview</h2>
              <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Savings Rate: {savingsRate}%
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0l1-1m-1 1l-1-1" />
                    </svg>
                  </div>
                  <span className="text-slate-600 font-medium">Income</span>
                </div>
                <span className="text-xl font-bold text-slate-900" id="monthlyIncome">+{formatCurrency(monthlyIncome)}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 font-medium">Expense</span>
                </div>
                <span className="text-xl font-bold text-slate-900" id="monthlyExpense">-{formatCurrency(monthlyExpense)}</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-slate-600 font-medium">Net Savings</span>
                </div>
                <span className="text-xl font-bold text-green-600" id="monthlyNet">+{formatCurrency(netMonthly)}</span>
              </div>
            </div>
          </div>

          {/* Top Categories Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-5">Top Categories</h2>
            <div className="space-y-3">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-slate-900">{cat.name}</p>
                      <p className="text-xs text-slate-500">Rank #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(cat.amount)}</p>
                    <p className="text-xs text-slate-500">
                      {monthlyExpense > 0 ? `${((cat.amount / monthlyExpense) * 100).toFixed(1)}%` : '0%'}
                      of expenses
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Expense Payment Methods</h2>
              <p className="text-slate-500 text-sm mt-0.5">How your family spends money</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {paymentMethods.map((method, index) => (
              <div
                key={index}
                className="relative p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${method.color}`}>
                    <span className="text-xl">{method.icon}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{method.method}</p>
                    <p className="text-xs text-slate-500">{method.percentage}% of expenses</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${method.color} transition-all duration-500`}
                    style={{ width: `${Math.min(method.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="absolute bottom-3 right-3 text-sm font-bold text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatCurrency(method.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* Cash vs Digital Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="font-medium text-slate-700">Cash</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(cashExpense)}</p>
              <p className="text-sm text-slate-500">{cashPercentage.toFixed(1)}% of total</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-slate-700">Digital</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(digitalExpense)}</p>
              <p className="text-sm text-slate-500">{digitalPercentage.toFixed(1)}% of total</p>
            </div>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Bills</h2>
            {upcomingBills.length > 0 && (
              <span className="text-sm text-slate-500">{upcomingBills.length} bill{upcomingBills.length > 1 ? 's' : ''} pending</span>
            )}
          </div>

          {upcomingBills.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="text-slate-600">No upcoming bills</p>
              <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBills.map((bill, index) => {
                const status = getBillStatus(bill.daysLeft);
                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-2xl">{bill.icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{bill.name}</p>
                        <p className="text-sm text-slate-500">
                          Due: {new Date(bill.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="text-right sm:text-left">
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(bill.amount)}</p>
                        <p className="text-xs text-slate-500">{bill.daysLeft} day{bill.daysLeft !== 1 ? 's' : ''} left</p>
                      </div>
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-full border ${status.class} self-center`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/dashboard/transactions/add'}
            className="group relative p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 text-left"
          >
            <div className="p-3 bg-green-50 rounded-xl mb-4 group-hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600 group-hover:text-green-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Quick Add</h3>
            <p className="text-sm text-slate-500 mb-4">Log expense quickly</p>
            <span className="inline-flex items-center gap-1 text-green-600 font-medium text-sm group-hover:gap-2 transition-all">
              Get started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => showToast('Voice input feature coming soon!', 'info')}
            className="group relative p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 text-left"
          >
            <div className="p-3 bg-blue-50 rounded-xl mb-4 group-hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Voice Input</h3>
            <p className="text-sm text-slate-500 mb-4">Speak to add transaction</p>
            <span className="inline-flex items-center gap-1 text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
              Try it
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => showToast('Scan & pay feature coming soon!', 'info')}
            className="group relative p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 hover:-translate-y-0.5 transition-all duration-300 text-left"
          >
            <div className="p-3 bg-purple-50 rounded-xl mb-4 group-hover:bg-purple-100 transition-colors">
              <svg className="w-6 h-6 text-purple-600 group-hover:text-purple-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Scan & Pay</h3>
            <p className="text-sm text-slate-500 mb-4">Scan QR to pay bills</p>
            <span className="inline-flex items-center gap-1 text-purple-600 font-medium text-sm group-hover:gap-2 transition-all">
              Scan now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Export Data</h2>
              <p className="text-slate-500 text-sm mt-0.5">Download dashboard summary for reporting and analysis</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToastManager>
  );
}