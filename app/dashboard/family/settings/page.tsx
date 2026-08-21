'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ExportUtil } from '@/lib/export';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

export default function FamilySettings() {
  const [familyName, setFamilyName] = useState('Sharma Family');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast('Family settings saved successfully', 'success');
    } catch (err) {
      setError('Failed to save family settings');
      showToast('Failed to save family settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!phoneNumber) {
      showToast('Please enter a phone number', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToast(`Invitation sent to ${phoneNumber}`, 'success');
      setPhoneNumber('');
    } catch (err) {
      setError('Failed to send invitation');
      showToast('Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const SkeletonForm = () => (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded w-1/3"></div>
      <div className="space-y-6">
        <div>
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-slate-200 rounded-xl"></div>
        </div>
        <div>
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="flex gap-3">
            <div className="flex-1 h-10 bg-slate-200 rounded-xl"></div>
            <div className="w-32 h-10 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
        <div className="h-10 bg-slate-200 rounded-xl w-1/4"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <ToastManager>
        <SkeletonLoader
          loading={true}
          fallback={<SkeletonForm />}
        >
          <div className="max-w-2xl mx-auto py-8">
            <SkeletonForm />
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
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button onClick={() => { setError(null); window.location.reload(); }} className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">Try Again</button>
          </div>
        </div>
      </ToastManager>
    );
  }

  return (
    <ToastManager>
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Family Settings</h1>
              <p className="text-slate-500 mt-1">Manage your family profile and members</p>
            </div>
          </div>

          <form className="space-y-8">
            {/* Family Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Family Name</label>
              <input
                type="text"
                value={familyName}
                onChange={e => setFamilyName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter family name"
              />
            </div>

            {/* Invite Members */}
            <div className="border-t border-slate-100 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Invite Members</h2>
              </div>
              <div className="flex gap-3">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
                <button
                  type="button"
                  onClick={handleSendInvite}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>

          {/* Save Button */}
          <div className="border-t border-slate-100 pt-8">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-red-100 p-6">
          <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Danger Zone
          </h3>
          <p className="text-sm text-red-600 mb-4">These actions are irreversible. Proceed with caution.</p>
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-red-50 border border-red-200 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors">
              Leave Family
            </button>
            <button className="flex-1 py-3 bg-red-50 border border-red-200 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors">
              Delete Family
            </button>
          </div>
        </div>
      </div>
    </ToastManager>
  );
}