'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signInWithOTP } from '@/lib/auth/service';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

const steps = [
  { key: 'phone', title: 'Verify Phone', desc: 'We\'ll send an OTP', icon: '📱', color: 'bg-emerald-50 text-emerald-600' },
  { key: 'name', title: 'Family Name', desc: 'How your family is identified', icon: '🏠', color: 'bg-blue-50 text-blue-600' },
  { key: 'invite', title: 'Invite Members', desc: 'Add family by phone', icon: '👨‍👩‍👧‍👦', color: 'bg-purple-50 text-purple-600' },
];

export default function CreateFamily() {
  const showToast = useToast();
  const [step, setStep] = useState<'phone' | 'name' | 'invite'>('phone');
  const [phone, setPhone] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [invitePhones, setInvitePhones] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPhone, setSubmittedPhone] = useState(false);

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (step === 'phone') {
        if (!phone) { setError('Enter your phone number'); setLoading(false); return; }
        await signInWithOTP(undefined, phone);
        setSubmittedPhone(true);
        showToast('OTP sent to ' + phone, 'success');
        setStep('name');
      } else if (step === 'name') {
        if (!familyName.trim()) { setError('Enter family name'); setLoading(false); return; }
        setStep('invite');
      } else if (step === 'invite') {
        // In real app: create family in DB, send invites
        showToast('Family created! Welcome to KutumbLedger 🎉', 'success');
        setTimeout(() => window.location.href = '/dashboard/family/settings', 800);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step === 'name') setStep('phone');
    else if (step === 'invite') setStep('name');
  };

  const addInviteField = () => setInvitePhones([...invitePhones, '']);
  const removeInviteField = (i: number) => setInvitePhones(invitePhones.filter((_, idx) => idx !== i));
  const updateInvitePhone = (i: number, val: string) => {
    const next = [...invitePhones];
    next[i] = val;
    setInvitePhones(next);
  };

  const current = steps.find(s => s.key === step)!;
  const progress = (steps.findIndex(s => s.key === step) + 1) / steps.length * 100;

  return (
    <ToastManager>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Progress Header */}
          <div className="text-center mb-8">
            <div className="h-1 bg-slate-200 rounded-full mb-4 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex justify-center gap-4">
              {steps.map((s, i) => (
                <div key={s.key} className="flex flex-col items-center">
                  <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    i < steps.findIndex(x => x.key === step)
                      ? 'bg-emerald-500 text-white'
                      : i === steps.findIndex(x => x.key === step)
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {i < steps.findIndex(x => x.key === step) ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <span className="font-semibold">{i + 1}</span>
                    )}
                  </div>
                  <p className={`mt-1 text-xs font-medium ${i <= steps.findIndex(x => x.key === step) ? 'text-emerald-600' : 'text-slate-400'}`}>{s.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${current.color}`}>
                <span className="text-3xl">{current.icon}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{current.title}</h1>
              <p className="text-slate-500 mt-1">{current.desc}</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleNext} className="space-y-6">
              {/* Step: Phone */}
              {step === 'phone' && (
                <div className="space-y-4 animate-slide-up">
                  <label className="block text-sm font-medium text-slate-700">Your Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    placeholder="+91 98765 43210"
                    required
                    disabled={loading || submittedPhone}
                    autoFocus
                  />
                  <p className="text-sm text-slate-500">We'll send an OTP to verify your number</p>
                </div>
              )}

              {/* Step: Family Name */}
              {step === 'name' && (
                <div className="space-y-4 animate-slide-up">
                  <label className="block text-sm font-medium text-slate-700">Family Name</label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={e => setFamilyName(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    placeholder="e.g., Sharma Family"
                    required
                    autoFocus
                  />
                  <p className="text-sm text-slate-500">This will be how your family is identified in the app</p>
                </div>
              )}

              {/* Step: Invite Members */}
              {step === 'invite' && (
                <div className="space-y-4 animate-slide-up">
                  <h3 className="text-lg font-semibold text-slate-900">Invite Family Members</h3>
                  <p className="text-sm text-slate-500">Add family members by phone. They\'ll receive an invite to join.</p>
                  <div className="space-y-3" id="invite-list">
                    {invitePhones.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 animate-slide-up">
                        <input
                          type="tel"
                          value={p}
                          onChange={e => updateInvitePhone(i, e.target.value)}
                          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder={`Member ${i + 1} phone`}
                        />
                        {invitePhones.length > 1 && (
                          <button type="button" onClick={() => removeInviteField(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors" aria-label="Remove">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addInviteField} className="w-full py-2 text-purple-600 hover:text-purple-700 font-medium flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    + Add another member
                  </button>
                  <p className="text-sm text-slate-500">Members will verify their phone to join the family</p>
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                {step !== 'phone' && (
                  <button type="button" onClick={handleBack} disabled={loading} className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50">
                    <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Back
                  </button>
                )}
                <button type="submit" disabled={loading} className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? 'Processing...' : step === 'invite' ? 'Create Family' : step === 'name' ? 'Next: Invite Members' : 'Next: Family Name'}
                  {step !== 'invite' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>}
                  {step === 'invite' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </button>
              </div>
            </form>
          </div>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have a family?{' '}
            <Link href="/dashboard/family/members" className="text-emerald-600 hover:text-emerald-700 font-medium">View members</Link>
          </p>
        </div>
      </div>
    </ToastManager>
  );
}