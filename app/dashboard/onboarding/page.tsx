'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

const steps = [
  { num: 1, title: 'Get Started', desc: 'Welcome to your family finance OS', icon: '🏠', color: 'bg-emerald-50 text-emerald-600' },
  { num: 2, title: 'Add Family', desc: 'Invite members & set roles', icon: '👨‍👩‍👧‍👦', color: 'bg-blue-50 text-blue-600' },
  { num: 3, title: 'Track Transactions', desc: 'SMS parsing, voice input, categories', icon: '📱', color: 'bg-purple-50 text-purple-600' },
  { num: 4, title: 'Explore Features', desc: 'Jars, Udhaar, Festival, Payroll', icon: '✨', color: 'bg-amber-50 text-amber-600' },
];

const features = {
  1: [
    { icon: '👨‍👩‍👧‍👦', title: 'Joint Family Mode', desc: 'Hierarchy: Admin → Adults → Dependents → Kids', color: 'bg-blue-50 text-blue-600' },
    { icon: '🔒', title: 'Privacy First', desc: 'Zero bank credentials, local-first IndexedDB', color: 'bg-emerald-50 text-emerald-600' },
    { icon: '📱', title: 'SMS Auto-Detection', desc: 'Local regex parser for bank/UPI SMS', color: 'bg-purple-50 text-purple-600' },
  ],
  2: [
    { icon: '👨‍👩‍👧‍👦', title: 'Create Family', desc: 'Set up your family profile with name and details', color: 'bg-blue-50 text-blue-600' },
    { icon: '📨', title: 'Invite Members', desc: 'Invite family via WhatsApp, SMS, or email', color: 'bg-emerald-50 text-emerald-600' },
    { icon: '👥', title: 'Set Roles', desc: 'Admin, Adult Earner, Dependent, or Child', color: 'bg-purple-50 text-purple-600' },
  ],
  3: [
    { icon: '📱', title: 'SMS Parsing', desc: 'Auto-detect transactions from bank SMS (HDFC, ICICI, SBI)', color: 'bg-blue-50 text-blue-600' },
    { icon: '🎤', title: 'Voice Input', desc: 'Add transactions using Hindi/English voice commands', color: 'bg-emerald-50 text-emerald-600' },
    { icon: '📂', title: 'Indian Categories', desc: 'Groceries, rent, festivals, utilities, transport', color: 'bg-purple-50 text-purple-600' },
    { icon: '💰', title: 'Payment Methods', desc: 'UPI, Cash, Card, Bank Transfer, Wallet', color: 'bg-amber-50 text-amber-600' },
  ],
  4: [
    { icon: '📊', title: 'Dashboard Insights', desc: 'Income, expenses, savings, budgets at a glance', color: 'bg-blue-50 text-blue-600' },
    { icon: '🏦', title: 'Money Jars', desc: 'Save/Spend/Give/Invest for kids', color: 'bg-emerald-50 text-emerald-600' },
    { icon: '🤝', title: 'Udhaar Tracker', desc: 'Track informal lending within family/friends', color: 'bg-rose-50 text-rose-600' },
    { icon: '🎪', title: 'Festival Planner', desc: 'Plan & save for festivals 3 months ahead', color: 'bg-purple-50 text-purple-600' },
    { icon: '👨‍💼', title: 'Helper Payroll', desc: 'Salaries, advances, festival bonuses', color: 'bg-indigo-50 text-indigo-600' },
    { icon: '📤', title: 'Export & Reports', desc: 'CSV/Excel exports for accounting', color: 'bg-slate-50 text-slate-600' },
  ],
};

const SkeletonStep = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
      ))}
    </div>
  </div>
);

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  useEffect(() => {
    const completed = localStorage.getItem('kutumbLedgerOnboardingComplete');
    if (completed) {
      setChecking(false);
      showToast('You\'ve already completed onboarding', 'info');
      setTimeout(() => window.location.href = '/dashboard', 800);
    } else {
      setChecking(false);
    }
  }, [showToast]);

  const handleNext = async () => {
    setSubmitting(true);
    try {
      if (step < 4) {
        setStep(step + 1);
        showToast(`Step ${step + 1}: ${steps[step].title}`, 'success');
      } else {
        localStorage.setItem('kutumbLedgerOnboardingComplete', 'true');
        setIsComplete(true);
        showToast('Welcome to KutumbLedger! 🎉', 'success');
        setTimeout(() => window.location.href = '/dashboard', 800);
      }
    } catch (err) {
      showToast('Failed to continue', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    try {
      localStorage.setItem('kutumbLedgerOnboardingComplete', 'true');
      setIsComplete(true);
      showToast('Onboarding skipped — complete anytime in Settings', 'info');
      setTimeout(() => window.location.href = '/dashboard', 800);
    } catch (err) {
      showToast('Failed to skip onboarding', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <ToastManager>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <SkeletonStep />
        </div>
      </ToastManager>
    );
  }

  if (isComplete) return null;

  const currentFeatures = features[step as keyof typeof features] || [];
  const progress = (step / 4) * 100;

  return (
    <ToastManager>
      <div className="min-h-screen bg-slate-50">
        {/* Progress Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome to KutumbLedger</h1>
                  <p className="text-slate-500 mt-1">Step {step} of 4 — {steps[step - 1].title}</p>
                </div>
                <button
                  onClick={handleSkip}
                  disabled={submitting}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 self-start"
                >
                  Skip onboarding
                </button>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="px-8 py-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                {steps.map((s, i) => (
                  <div key={s.num} className="flex flex-col items-center">
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                      i < step - 1
                        ? 'bg-emerald-500 text-white'
                        : i === step - 1
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {i < step - 1 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="font-semibold">{s.num}</span>
                      )}
                    </div>
                    <p className={`mt-2 text-xs font-medium ${i < step ? 'text-emerald-600' : 'text-slate-400'}`}>{s.title}</p>
                    {i < 3 && (
                      <div className={`absolute top-5 left-[calc(50%+5px)] w-full h-0.5 -ml-5 transition-all duration-300 ${i < step - 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-8">
              <div className="space-y-8 animate-fade-in">
                {/* Title */}
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${steps[step - 1].color || 'bg-blue-50 text-blue-600'}`}>
                    <span className="text-3xl">{steps[step - 1].icon}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{steps[step - 1].title}</h2>
                  <p className="text-slate-600 max-w-2xl mx-auto">{steps[step - 1].desc}</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentFeatures.map((f, i) => (
                    <div
                      key={i}
                      className="group p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className={`p-3 rounded-xl ${f.color} mb-3`}>
                        <span className="text-2xl">{f.icon}</span>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                      <p className="text-sm text-slate-500">{f.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Additional context for step 1 */}
                {step === 1 && (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-emerald-800">Built for Indian joint families</p>
                        <p className="text-sm text-emerald-600 mt-1">Privacy-first, offline-capable, works with your existing UPI apps</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                  <button
                    onClick={() => setStep(Math.max(1, step - 1))}
                    disabled={step === 1 || submitting}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={submitting}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {step < 4 ? 'Next' : 'Get Started'}
                    {step < 4 && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}
                    {step === 4 && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToastManager>
  );
}