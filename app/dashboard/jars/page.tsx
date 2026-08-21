'use client';

import { useState, useEffect } from 'react';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

const jarTypes = {
  save: { name: 'Save Jar', icon: '🏦', color: 'bg-emerald-100 text-emerald-700', gradient: 'from-emerald-500 to-emerald-600' },
  spend: { name: 'Spend Jar', icon: '🛒', color: 'bg-amber-100 text-amber-700', gradient: 'from-amber-500 to-amber-600' },
  give: { name: 'Give Jar', icon: '❤️', color: 'bg-rose-100 text-rose-700', gradient: 'from-rose-500 to-rose-600' },
  invest: { name: 'Invest Jar', icon: '📈', color: 'bg-indigo-100 text-indigo-700', gradient: 'from-indigo-500 to-indigo-600' },
} as const;

const mockEducationalTips = [
  'Save a portion of your allowance every week.',
  'Track your spending to understand where your money goes.',
  'Set goals for things you want to buy.',
  'Ask parents for extra chores to earn more money.',
  'Share with others - it makes you feel good!',
  'Compare prices before buying to save money.',
  'Avoid impulse purchases - wait 24 hours before buying.',
  'Keep your money in a safe place.',
  'Learn about different coins and notes.',
  'Help family with budgeting for groceries or utilities.',
];

interface Jar {
  id: string;
  type: keyof typeof jarTypes;
  name: string;
  amount: number;
  goal: number;
  icon: string;
}

const initialJars: Jar[] = [
  { id: '1', type: 'save', name: 'Save Jar', amount: 5000, goal: 10000, icon: '🏦' },
  { id: '2', type: 'spend', name: 'Spend Jar', amount: 2000, goal: 5000, icon: '🛒' },
  { id: '3', type: 'give', name: 'Give Jar', amount: 1000, goal: 2000, icon: '❤️' },
  { id: '4', type: 'invest', name: 'Invest Jar', amount: 3000, goal: 15000, icon: '📈' },
];

function formatCurrency(value: number): string {
  return `₹${(Math.abs(value) / 100).toFixed(2)}`;
}

const SkeletonJar = () => (
  <div className="animate-pulse">
    <div className="bg-slate-200 rounded-2xl h-48"></div>
    <div className="mt-4 h-4 bg-slate-200 rounded w-1/4"></div>
    <div className="mt-2 h-4 bg-slate-200 rounded w-1/2"></div>
  </div>
);

const SkeletonGrid = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((_, i) => <SkeletonJar key={i} />)}
  </div>
);

export default function JarsPage() {
  const [jars, setJars] = useState<Jar[]>(initialJars);
  const [selectedJar, setSelectedJar] = useState<Jar | null>(null);
  const [jarAction, setJarAction] = useState<'deposit' | 'withdraw' | 'goal' | 'details' | null>(null);
  const [showEducationalModal, setShowEducationalModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');
  const showToast = useToast();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const handleSelectJar = (jar: Jar) => {
    setSelectedJar(jar);
    setJarAction(null);
    setInputValue('');
  };

  const handleCloseModal = () => {
    setSelectedJar(null);
    setJarAction(null);
    setInputValue('');
  };

  const handleDeposit = async () => {
    const amount = parseInt(inputValue) * 100;
    if (isNaN(amount) || amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setJars(prev => prev.map(jar =>
        jar.id === selectedJar!.id ? { ...jar, amount: jar.amount + amount } : jar
      ));
      showToast(`Deposited ${formatCurrency(amount)}`, 'success');
    } catch {
      showToast('Failed to deposit', 'error');
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(inputValue) * 100;
    if (isNaN(amount) || amount <= 0 || amount > selectedJar!.amount) {
      showToast(`Please enter a valid amount (max: ${formatCurrency(selectedJar!.amount)})`, 'error');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setJars(prev => prev.map(jar =>
        jar.id === selectedJar!.id ? { ...jar, amount: jar.amount - amount } : jar
      ));
      showToast(`Withdrew ${formatCurrency(amount)}`, 'success');
    } catch {
      showToast('Failed to withdraw', 'error');
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handleUpdateGoal = async () => {
    const goal = parseInt(inputValue) * 100;
    if (isNaN(goal) || goal <= 0) {
      showToast('Please enter a valid goal amount', 'error');
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setJars(prev => prev.map(jar =>
        jar.id === selectedJar!.id ? { ...jar, goal } : jar
      ));
      showToast('Goal updated successfully', 'success');
    } catch {
      showToast('Failed to update goal', 'error');
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const getProgress = (jar: Jar) => Math.min((jar.amount / jar.goal) * 100, 100);
  const isGoalMet = (jar: Jar) => jar.amount >= jar.goal;
  const totalSaved = jars.reduce((sum, jar) => sum + jar.amount, 0);
  const totalGoal = jars.reduce((sum, jar) => sum + jar.goal, 0);

  if (loading) {
    return (
      <ToastManager>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="h-10 bg-slate-200 rounded-xl w-48 mb-8 animate-pulse"></div>
          <SkeletonGrid />
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Money Jars</h1>
            <p className="text-slate-500 mt-1">Teach kids smart money habits with the 4-jar system</p>
          </div>
          <button
            onClick={() => setShowEducationalModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="hidden sm:inline">Money Tips</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-emerald-50 rounded-xl">
              <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Total Saved</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{formatCurrency(totalSaved)}</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Total Goals</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">{formatCurrency(totalGoal)}</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-xl">
              <p className="text-xs font-medium text-indigo-700 uppercase tracking-wider">Progress</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {totalGoal > 0 ? `${Math.round((totalSaved / totalGoal) * 100)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>

        {/* Jars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {jars.map((jar) => {
            const jarStyle = jarTypes[jar.type];
            const progress = getProgress(jar);
            const goalMet = isGoalMet(jar);

            return (
              <div
                key={jar.id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => handleSelectJar(jar)}
              >
                <div className="relative p-6">
                  {/* Jar Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${jarStyle.color}`}>
                        <span className="text-2xl">{jar.icon}</span>
                      </div>
                      <div>
                        <h2 className="font-semibold text-slate-900">{jar.name}</h2>
                        <p className="text-xs font-medium text-slate-500 capitalize">{jar.type} jar</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectJar(jar); setJarAction('details'); }}
                        className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                        aria-label="Jar options"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Amount Display */}
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-slate-900">{formatCurrency(jar.amount)}</p>
                    <p className="text-sm text-slate-500 mt-1">Total Saved</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{formatCurrency(jar.amount)}</span>
                      <span>Goal: {formatCurrency(jar.goal)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${goalMet ? 'bg-emerald-500' : jarStyle.gradient}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-center text-sm font-medium text-slate-600">
                      {goalMet ? '🎉 Goal Achieved!' : `${Math.round(progress)}% complete`}
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="mt-5 grid grid-cols-3 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedJar(jar); setJarAction('deposit'); }}
                      className="col-span-1 p-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors"
                      title="Add Money"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedJar(jar); setJarAction('withdraw'); }}
                      className="col-span-1 p-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                      title="Take Money"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedJar(jar); setJarAction('goal'); }}
                      className="col-span-1 p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                      title="Set Goal"
                    >
                      <svg className="w-4 h-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Jar Detail Modal */}
        {selectedJar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${jarTypes[selectedJar.type].color}`}>
                      <span className="text-2xl">{selectedJar.icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedJar.name}</h2>
                      <p className="text-sm text-slate-500 capitalize">{selectedJar.type} jar</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Current Status */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-slate-500">Current Amount</span>
                    <span className="font-bold text-slate-900">{formatCurrency(selectedJar.amount)}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-slate-500">Goal</span>
                    <span className="font-medium text-slate-700">{formatCurrency(selectedJar.goal)}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-slate-500">Progress</span>
                    <span className="font-semibold text-slate-900">
                      {isGoalMet(selectedJar) ? '🎉 Complete!' : `${Math.round(getProgress(selectedJar))}%`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isGoalMet(selectedJar) ? 'bg-emerald-500' : jarTypes[selectedJar.type].gradient}`}
                      style={{ width: `${getProgress(selectedJar)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Selection */}
                {!jarAction && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 text-center mb-2">What would you like to do?</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setJarAction('deposit')}
                        className="p-4 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors text-center"
                      >
                        <svg className="w-6 h-6 text-emerald-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-sm font-medium text-emerald-700">Add Money</p>
                      </button>
                      <button
                        onClick={() => setJarAction('withdraw')}
                        className="p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors text-center"
                      >
                        <svg className="w-6 h-6 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-sm font-medium text-red-700">Take Money</p>
                      </button>
                      <button
                        onClick={() => setJarAction('goal')}
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors text-center"
                      >
                        <svg className="w-6 h-6 text-blue-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="text-sm font-medium text-blue-700">Set Goal</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Deposit Form */}
                {jarAction === 'deposit' && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Add Money</h3>
                      <button onClick={() => setJarAction(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeposit}
                        disabled={loading}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Add Money'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Withdraw Form */}
                {jarAction === 'withdraw' && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Take Money</h3>
                      <button onClick={() => setJarAction(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                    <p className="text-xs text-slate-500 mb-2">Max available: {formatCurrency(selectedJar.amount)}</p>
                    <input
                      type="number"
                      min="1"
                      max={selectedJar.amount / 100}
                      step="0.01"
                      placeholder="Enter amount"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-lg"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleWithdraw}
                        disabled={loading}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Withdraw'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Goal Form */}
                {jarAction === 'goal' && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">Set Goal</h3>
                      <button onClick={() => setJarAction(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Goal Amount (₹)</label>
                    <p className="text-xs text-slate-500 mb-2">Current goal: {formatCurrency(selectedJar.goal)}</p>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="Enter goal amount"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      autoFocus
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={handleCloseModal}
                        className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateGoal}
                        disabled={loading}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Processing...' : 'Set Goal'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Educational Tips Modal */}
        {showEducationalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Money Tips for Kids</h2>
                  <button
                    onClick={() => setShowEducationalModal(false)}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  {mockEducationalTips.map((tip, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-100 transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg">
                          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm text-slate-700 pt-1">{tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowEducationalModal(false)}
                  className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToastManager>
  );
}