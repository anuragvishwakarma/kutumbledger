'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signInWithOTP } from '@/lib/auth/service';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ToastManager from '@/components/ui/ToastManager';
import { useToast } from '@/components/ui/ToastManager';

interface FamilyMember {
  id: string;
  name: string;
  phone: string;
  role: 'Admin' | 'Adult Earner' | 'Dependent' | 'Child';
  joinedAt: string;
  isCurrentUser: boolean;
}

const roleConfig = {
  Admin: { color: 'bg-blue-100 text-blue-800', icon: '👑' },
  'Adult Earner': { color: 'bg-emerald-100 text-emerald-800', icon: '💼' },
  Dependent: { color: 'bg-amber-100 text-amber-800', icon: '👤' },
  Child: { color: 'bg-purple-100 text-purple-800', icon: '🧒' },
} as const;

const mockMembers: FamilyMember[] = [
  { id: '1', name: 'Priya Sharma', phone: '+91 98765 43210', role: 'Admin', joinedAt: '2026-01-15', isCurrentUser: true },
  { id: '2', name: 'Rahul Sharma', phone: '+91 98765 43211', role: 'Adult Earner', joinedAt: '2026-01-20', isCurrentUser: false },
  { id: '3', name: 'Amit Sharma', phone: '+91 98765 43212', role: 'Dependent', joinedAt: '2026-02-01', isCurrentUser: false },
  { id: '4', name: 'Sonia Sharma', phone: '+91 98765 43213', role: 'Child', joinedAt: '2026-03-10', isCurrentUser: false },
];

const SkeletonMember = () => (
  <div className="animate-pulse flex items-center p-4 border-b border-slate-100">
    <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
    <div className="flex-1 ml-4 space-y-2">
      <div className="h-4 bg-slate-200 rounded w-1/3"></div>
      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
    </div>
    <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
  </div>
);

const SkeletonList = () => (
  <div className="space-y-0">
    {[1, 2, 3, 4].map((_, i) => <SkeletonMember key={i} />)}
  </div>
);

const SkeletonInvite = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-slate-200 rounded w-1/4"></div>
    <div className="h-10 bg-slate-200 rounded-xl"></div>
  </div>
);

export default function FamilyMembers() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitesSent, setInvitesSent] = useState(0);
  const [members, setMembers] = useState<FamilyMember[]>(mockMembers);
  const showToast = useToast();

  useEffect(() => {
    const loadFamilyMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        setMembers(mockMembers);
      } catch (err) {
        setError('Failed to load family members');
        showToast('Failed to load family members', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadFamilyMembers();
  }, [showToast]);

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) { showToast('Please enter a phone number', 'error'); return; }

    setLoading(true);
    setError(null);
    try {
      await signInWithOTP(undefined, phone);
      setInvitesSent(prev => prev + 1);
      setPhone('');
      showToast('Invitation sent successfully', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
      showToast('Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (id: string) => {
    showToast(`Role management coming soon`, 'info');
  };

  if (loading) {
    return (
      <ToastManager>
        <SkeletonLoader
          loading={true}
          fallback={
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="h-8 bg-slate-200 rounded-xl w-48 mb-8"></div>
              <SkeletonInvite />
              <h2 className="text-xl font-semibold mb-4 mt-8 animate-pulse">Current Members</h2>
              <SkeletonList />
            </div>
          }
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Family Members</h1>
                <p className="text-slate-500 mt-1">Loading...</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Invite Family Member</h2>
              <SkeletonInvite />
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Current Members (0)</h2>
              </div>
              <SkeletonList />
            </div>
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
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error loading members</h2>
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Family Members</h1>
            <p className="text-slate-500 mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/dashboard/family/create" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors self-start">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span className="hidden sm:inline">Create Family</span>
          </Link>
        </div>

        {/* Invite Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Invite Family Member</h2>
            {invitesSent > 0 && (
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {invitesSent} invite{invitesSent > 1 ? 's' : ''} sent
              </span>
            )}
          </div>
          <form onSubmit={inviteMember} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="+91 98765 43210"
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                  Send Invite
                </>
              )}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {invitesSent > 0 && <p className="text-sm text-emerald-600">{invitesSent} invitation{invitesSent > 1 ? 's' : ''} sent successfully</p>}
          </form>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Current Members ({members.length})</h2>
          </div>
          {members.length === 0 ? (
            <EmptyState
              title="No Family Members Yet"
              description="Invite family members to get started tracking finances together."
              icon={<span className="text-4xl text-slate-300 mb-4">👥</span>}
              actionText="Invite First Member"
              actionHref="#"
              className="py-16"
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {members.map((member) => {
                const role = roleConfig[member.role];
                return (
                  <div key={member.id} className="px-6 py-4 hover:bg-slate-50 transition-colors duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                          {member.isCurrentUser ? '👤' : role.icon}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 truncate">{member.name}</p>
                          {member.isCurrentUser && <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">You</span>}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            {member.phone}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span>Joined {new Date(member.joinedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${role.color}`}>
                        {role.icon} {member.role}
                      </span>
                      {!member.isCurrentUser && (
                        <button onClick={() => handleRoleChange(member.id)} className="px-3 py-1.5 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
                          Manage Role
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ToastManager>
  );
}