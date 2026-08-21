'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExportUtil } from '@/lib/export';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

type HelperRole = 'maid' | 'cook' | 'driver' | 'nanny' | 'gardener' | 'other';
type PaymentMethod = 'cash' | 'upi' | 'bank';
type AttendanceStatus = 'present' | 'absent' | 'half_day';

interface Helper {
  id: string;
  name: string;
  role: HelperRole;
  baseSalary: number; // in rupees per month
  festivalBonusPct: number; // percentage
  advances: number; // in rupees
  paymentMethod: PaymentMethod;
  isActive: boolean;
}

const roleIcons: Record<HelperRole, string> = {
  maid: '🧹',
  cook: '👩‍🍳',
  driver: '🚗',
  nanny: '👶',
  gardener: '🌱',
  other: '👤',
};

const SkeletonHelper = () => (
  <div className="animate-pulse flex items-center p-4 border-b border-slate-100">
    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
    <div className="flex-1 ml-4 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
    </div>
    <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
  </div>
);

const SkeletonAttendance = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
    <div className="h-10 bg-slate-200 rounded-xl"></div>
    <div className="h-10 bg-slate-200 rounded-xl"></div>
    <div className="h-10 bg-slate-200 rounded-xl"></div>
  </div>
);

const SkeletonList = () => (
  <div className="space-y-0">
    {[1, 2, 3].map((_, i) => <SkeletonHelper key={i} />)}
  </div>
);

const SkeletonForm = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
    <div className="h-10 bg-slate-200 rounded-xl"></div>
    <div className="h-10 bg-slate-200 rounded-xl"></div>
  </div>
);

export default function Helpers() {
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [selectedHelper, setSelectedHelper] = useState<string | null>(null);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  const calculateSalary = (helper: Helper, daysInMonth: number, daysPresent: number) => {
    const dailyRate = helper.baseSalary / daysInMonth;
    let salary = dailyRate * daysPresent;
    const festivalBonus = (helper.baseSalary * helper.festivalBonusPct) / 100;
    salary += festivalBonus;
    salary -= helper.advances;
    return Math.max(0, salary);
  };

  useEffect(() => {
    const loadHelpers = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockData: Helper[] = [
          {
            id: '1',
            name: 'Sunita Devi',
            role: 'maid',
            baseSalary: 8000,
            festivalBonusPct: 50,
            advances: 0,
            paymentMethod: 'cash',
            isActive: true
          },
          {
            id: '2',
            name: 'Ramesh Kumar',
            role: 'cook',
            baseSalary: 10000,
            festivalBonusPct: 50,
            advances: 500,
            paymentMethod: 'bank',
            isActive: true
          },
          {
            id: '3',
            name: 'Mahesh Singh',
            role: 'driver',
            baseSalary: 12000,
            festivalBonusPct: 50,
            advances: 0,
            paymentMethod: 'upi',
            isActive: true
          }
        ];
        setHelpers(mockData);
      } catch (err) {
        setError('Failed to load helpers data');
        showToast('Failed to load helpers data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadHelpers();
  }, [showToast]);

  const handleSaveHelper = async (helperData: Omit<Helper, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHelpers(prev => [...prev, { ...helperData, id: Date.now().toString() }]);
      showToast('Helper added successfully', 'success');
    } catch (err) {
      setError('Failed to add helper');
      showToast('Failed to add helper', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedHelper) {
      showToast('Please select a helper', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const helper = helpers.find(h => h.id === selectedHelper);
      if (helper) {
        const daysPresent = status === 'present' ? 1 : status === 'half_day' ? 0.5 : 0;
        const salary = calculateSalary(helper, daysInMonth, daysPresent);
        showToast(`Attendance marked for ${helper.name}: ${status}`, 'success');
      }
    } catch (err) {
      setError('Failed to mark attendance');
      showToast('Failed to mark attendance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHelper = () => {
    showToast('Add helper feature coming soon!', 'info');
  };

  if (loading) {
    return (
      <ToastManager>
        <SkeletonLoader loading={true}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-8 bg-slate-200 rounded-xl w-64 mb-8"></div>
            <SkeletonForm />
            <h2 className="text-xl font-semibold mb-4 mt-8 animate-pulse">Today's Attendance</h2>
            <SkeletonForm />
            <h2 className="text-xl font-semibold mb-4 mt-8 animate-pulse">Helper Salaries</h2>
            <SkeletonList />
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
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error loading helpers</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button onClick={() => { setError(null); window.location.reload(); }} className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">Try Again</button>
          </div>
        </div>
      </ToastManager>
    );
  }

  return (
    <ToastManager>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Domestic Helpers Payroll</h1>
            <p className="text-slate-500 mt-1">Manage salaries, attendance, and advances for your household staff</p>
          </div>
          <button onClick={handleAddHelper} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors self-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">Add Helper</span>
          </button>
        </div>

        {/* Attendance Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Today's Attendance</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                max={new Date().toISOString().split('T')[0]}
                disabled={!selectedHelper || helpers.length === 0}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Helper</label>
              <select
                value={selectedHelper || ''}
                onChange={e => setSelectedHelper(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={helpers.length === 0}
              >
                <option value="">Select a helper</option>
                {helpers.map(helper => (
                  <option key={helper.id} value={helper.id}>
                    {helper.name} ({helper.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 flex-1">
                  <input
                    type="radio"
                    value="present"
                    checked={status === 'present'}
                    onChange={e => setStatus(e.target.value as AttendanceStatus)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-sm">Present</span>
                </label>
                <label className="flex items-center gap-2 flex-1">
                  <input
                    type="radio"
                    value="absent"
                    checked={status === 'absent'}
                    onChange={e => setStatus(e.target.value as AttendanceStatus)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-sm">Absent</span>
                </label>
                <label className="flex items-center gap-2 flex-1">
                  <input
                    type="radio"
                    value="half_day"
                    checked={status === 'half_day'}
                    onChange={e => setStatus(e.target.value as AttendanceStatus)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="text-sm">Half Day</span>
                </label>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleMarkAttendance}
                disabled={!selectedHelper || loading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Marking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Mark Attendance
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Salary List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-slate-900">Helper Salaries</h2>
            <span className="text-sm text-slate-500">{helpers.length} helper{helpers.length !== 1 ? 's' : ''}</span>
          </div>

          {helpers.length === 0 ? (
            <EmptyState
              title="No Helpers Added Yet"
              description="Add domestic helpers to track their salaries and payments."
              icon={<span className="text-4xl text-slate-300 mb-4">👥</span>}
              actionText="Add First Helper"
              actionHref="#"
              className="py-16"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {helpers.map(helper => {
                const monthlySalary = calculateSalary(helper, daysInMonth, daysInMonth);
                return (
                  <div key={helper.id} className="px-6 py-4 hover:bg-slate-50 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                          {roleIcons[helper.role]}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 truncate">{helper.name}</p>
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                            helper.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {helper.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <span>{roleIcons[helper.role]}</span>
                            <span className="font-medium capitalize">{helper.role}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                              helper.paymentMethod === 'upi' ? 'bg-emerald-100 text-emerald-700' :
                              helper.paymentMethod === 'cash' ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {helper.paymentMethod.toUpperCase()}
                            </span>
                          </span>
                          <span>•</span>
                          <span>Base: ₹{helper.baseSalary.toLocaleString()}/month</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right sm:text-left">
                        <p className="text-xl font-bold text-slate-900">₹{monthlySalary.toLocaleString()}</p>
                        <p className="text-sm text-slate-500">This Month</p>
                      </div>
                      {helper.advances > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          Advances: ₹{helper.advances.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment History</h2>
          <p className="text-slate-500 text-center py-8">Payment history feature coming soon</p>
          <button
            onClick={() => showToast('Payment history feature coming soon!', 'info')}
            className="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
          >
            View Payment History
          </button>
        </div>
      </div>
    </ToastManager>
  );
}