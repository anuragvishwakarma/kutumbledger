'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { generateOTP, storeOTP, verifyOTP, sendOTPViaEmail, sendOTPViaSMS } from '@/lib/otp';

export default function AccountsPage() {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [familyInfo, setFamilyInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [inviteData, setInviteData] = useState<{ email: string; phone: string }>({ email: '', phone: '' });
  const [verifyCode, setVerifyCode] = useState('');
  const [tempInvite, setTempInvite] = useState<{ email: string; phone: string; code: string } | null>(null);
  const [resendCount, setResendCount] = useState(0);
  const [lastResendTime, setLastResendTime] = useState<number | null>(null);

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get family info and members
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select(`
          *,
          families!family_id (
            id,
            name,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      // Get all family members
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          users!user_id (
            email
          ),
          families!family_id (
            name
          )
        `)
        .eq('family_id', memberData.family_id);

      if (membersError) throw membersError;

      setFamilyInfo(memberData.families);
      setFamilyMembers(membersData || []);
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load family data');
      setFamilyMembers([]);
      setFamilyInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async () => {
    const { email, phone } = inviteData;
    if (!email.trim() || !phone.trim()) {
      toast.error('Please enter both email and phone number');
      return;
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      // Check if email already associated with a family member
      const { data: existingMembers, error: checkError } = await supabase
        .from('family_members')
        .select('email')
        .eq('users.email', email);

      if (checkError) throw checkError;
      if (existingMembers && existingMembers.length > 0) {
        toast.error('This email is already associated with a family member');
        return;
      }

      // Generate verification code
      const code = generateOTP();
      
      // Store OTP with a key combining email and phone for uniqueness
      const otpKey = `${email}:${phone}`;
      storeOTP(otpKey, code);
      
      // Send OTP via email and SMS (in production, you might choose one or both)
      sendOTPViaEmail(email, code);
      sendOTPViaSMS(phone, code);
      
      // Store temporarily for verification
      setTempInvite({ email, phone, code: '' }); // We don't store the actual code in state for security
      setInviteData({ email: '', phone: '' });
      setShowInviteModal(false);
      setShowVerifyModal(true);
      setResendCount(0);
      setLastResendTime(Date.now());
      
      // In production, you would NOT show the OTP in a toast
      // For demo/development purposes only:
      if (process.env.NODE_ENV === 'development') {
        toast.info(`OTP sent to ${email} and ${phone}: ${code}`);
      } else {
        toast.success('Verification codes sent to email and phone');
      }
    } catch (err) {
      console.error('Error initiating invite:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to initiate invitation');
    }
  };

  const handleVerifyCode = async () => {
    if (!tempInvite) {
      toast.error('No pending invitation');
      return;
    }
    
    if (verifyCode.trim() === '') {
      toast.error('Please enter the verification code');
      return;
    }
    
    if (verifyCode.length !== 6) {
      toast.error('Please enter a 6-digit verification code');
      return;
    }
    
    try {
      const otpKey = `${tempInvite.email}:${tempInvite.phone}`;
      const isValid = verifyOTP(otpKey, verifyCode);
      
      if (!isValid) {
        toast.error('Invalid or expired verification code');
        return;
      }
    
      // Create auth user with email and random password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempInvite.email,
        password: Math.random().toString(36).slice(-8), // random password
        options: {
          data: {
            display_name: tempInvite.email.split('@')[0],
          }
        }
      });
      
      if (authError) throw authError;
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      // Get the family ID from current user
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (memberError) throw memberError;
      
      // Create family member record
      const { error: fmError } = await supabase
        .from('family_members')
        .insert({
          family_id: memberData.family_id,
          user_id: authData.user.id,
          role: 'dependent', // default role, can be changed later
          phone_number: tempInvite.phone,
          display_name: tempInvite.email.split('@')[0],
        });
      
      if (fmError) throw fmError;
      
      toast.success('Family member invited successfully!');
      setTempInvite(null);
      setVerifyCode('');
      setShowVerifyModal(false);
      
      // Refresh family data
      await fetchFamilyData();
    } catch (err) {
      console.error('Error verifying code:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to verify invitation');
    }
  };

  const handleResendCode = () => {
    if (!tempInvite) {
      toast.error('No pending invitation');
      return;
    }
    
    // Rate limiting: only allow resend every 30 seconds
    const now = Date.now();
    if (lastResendTime && (now - lastResendTime) < 30000) {
      const secondsLeft = Math.ceil((30000 - (now - lastResendTime)) / 1000);
      toast.error(`Please wait ${secondsLeft} seconds before resending`);
      return;
    }
    
    if (resendCount >= 3) {
      toast.error('Maximum resend attempts reached. Please try again later.');
      return;
    }
    
    try {
      const { email, phone } = tempInvite;
      // Generate new OTP
      const newCode = generateOTP();
      
      // Update stored OTP
      const otpKey = `${email}:${phone}`;
      storeOTP(otpKey, newCode);
      
      // Send new OTP
      sendOTPViaEmail(email, newCode);
      sendOTPViaSMS(phone, newCode);
      
      // Update state
      setResendCount(prev => prev + 1);
      setLastResendTime(now);
      
      // For demo/development only
      if (process.env.NODE_ENV === 'development') {
        toast.info(`New OTP sent: ${newCode}`);
      } else {
        toast.success('New verification codes sent');
      }
    } catch (err) {
      console.error('Error resending code:', err);
      toast.error('Failed to resend verification code');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Are you sure you want to remove this family member? This action cannot be undone.')) return;
    
    try {
      // Check if current user is admin
      const { data: userMember, error: userError } = await supabase
        .from('family_members')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (userError) throw userError;
      if (userMember.role !== 'admin') {
        throw new Error('Only admins can remove family members');
      }
      
      // Prevent removing self
      const { data: authUser } = await supabase.auth.getUser();
      const memberToRemove = familyMembers.find(m => m.id === memberId);
      if (memberToRemove?.user_id === authUser.user?.id) {
        throw new Error('You cannot remove yourself');
      }
      
      // Delete family member
      const { error: deleteError } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);
      
      if (deleteError) throw deleteError;
      
      toast.success('Family member removed successfully');
      await fetchFamilyData();
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Admin/Father',
      adult: 'Adult/Mother',
      dependent: 'Dependent',
      child: 'Child'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-blue-500',
      adult: 'bg-purple-500',
      dependent: 'bg-green-500',
      child: 'bg-orange-500'
    };
    return roleColors[role] || 'bg-gray-500';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading family information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading family data</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => fetchFamilyData()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Family Accounts
            </h1>
            <p className="text-slate-600">
              Manage family members and their roles
            </p>
          </div>
          <Button 
            onClick={() => setShowInviteModal(true)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Invite Member
          </Button>
        </div>
      </div>

      {/* Family Info Card */}
      {familyInfo && (
        <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              {familyInfo.name}
            </h2>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                {familyInfo.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">Family</p>
                <p className="text-slate-500">Created {new Date(familyInfo.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Members List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Family Members ({familyMembers.length})
          </h2>
          <p className="text-slate-500">
            Manage roles, permissions, and financial access for each member
          </p>
        </div>

        {familyMembers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No family members found</p>
            <Button 
              onClick={() => setShowInviteModal(true)}
              className="mt-4 bg-primary text-white hover:bg-primary/90"
            >
              Invite First Member
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {familyMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onRoleChange={async (newRole) => {
                  try {
                    const { error } = await supabase
                      .from('family_members')
                      .update({ role: newRole })
                      .eq('id', member.id);

                    if (error) throw error;
                    toast.success('Role updated successfully');
                    await fetchFamilyData();
                  } catch (err) {
                    console.error('Error updating role:', err);
                    toast.error(err instanceof Error ? err.message : 'Failed to update role');
                  }
                }}
                onRemove={handleRemoveMember}
              />
            ))}
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Invite Family Member
            </h2>
            <p className="text-slate-600 mb-6">
              Enter the email and phone number of the person you want to invite to your family.
              They will receive verification codes via email and SMS to join your Kutumbledger family.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                <Input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">+91</span>
                  <Input
                    type="tel"
                    value={inviteData.phone}
                    onChange={(e) => setInviteData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                    placeholder="9876543210"
                    maxLength="10"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Enter 10-digit mobile number without country code
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowInviteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleInviteMember}
                disabled={!inviteData.email || !inviteData.phone}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Code Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Verify Invitation
            </h2>
            {tempInvite && (
              <p className="text-slate-600 mb-6">
                Verification codes have been sent to <span className="font-medium">{tempInvite.email}</span> and 
                <span className="font-medium">+91 {tempInvite.phone}</span>. Please enter the 6-digit code below.
              </p>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code *</label>
                <Input
                  type="text"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  placeholder="123456"
                  maxLength="6"
                  required
                />
              </div>
              
              {/* Resend info */}
              {lastResendTime && (
                <div className="text-xs text-slate-500 mb-2">
                  {resendCount > 0 && (
                    <>
                      Resend {resendCount}/3 times
                      {lastResendTime && (
                        <span className="ml-2">
                          {(Date.now() - lastResendTime) < 30000 ? 
                            `Next resend in: ${Math.ceil((30000 - (Date.now() - lastResendTime)) / 1000)}s` : 
                            'Available now'}
                        </span>
                      )}
                    </>
                  )}
                  {resendCount === 0 && (
                    <>
                      First send
                      {lastResendTime && (
                        <span className="ml-2">
                          {(Date.now() - lastResendTime) < 30000 ? 
                            `Next resend in: ${Math.ceil((30000 - (Date.now() - lastResendTime)) / 1000)}s` : 
                            'Available now'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowVerifyModal(false);
                  setShowInviteModal(true); // Go back to invite if they cancel verification
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResendCode}
                disabled={resendCount >= 3 || (lastResendTime && (Date.now() - lastResendTime) < 30000)}
                className="text-sm text-slate-500"
              >
                Resend Code
              </Button>
              <Button 
                onClick={handleVerifyCode}
                disabled={!verifyCode || verifyCode.length !== 6}
                className="bg-primary text-white hover:bg-primary/90"
              >
                Verify & Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Member Card Component
function MemberCard({ member, onRoleChange, onRemove }: { 
  member: any; 
  onRoleChange: (role: string) => Promise<void>; 
  onRemove: (id: string) => Promise<void>; 
}) {
  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      admin: 'Admin/Father',
      adult: 'Adult/Mother',
      dependent: 'Dependent',
      child: 'Child'
    };
    return roleLabels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      admin: 'bg-blue-500',
      adult: 'bg-purple-500',
      dependent: 'bg-green-500',
      child: 'bg-orange-500'
    };
    return roleColors[role] || 'bg-gray-500';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4 mb-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center">
          {member.avatar_url ? (
            <img 
              src={member.avatar_url} 
              alt={member.display_name || member.users?.email?.split('@')[0] || 'User'} 
              className="object-cover w-full h-full"
            />
          ) : (
            <div className={`${getRoleColor(member.role)} flex items-center justify-center text-white text-lg font-bold`}>
              {getInitials(member.display_name || member.users?.email?.split('@')[0] || '??')}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-slate-900">
            {member.display_name || member.users?.email?.split('@')[0] || 'Unknown User'}
          </h3>
          <p className="text-sm text-slate-500">
            {member.phone_number ? `📱 ${member.phone_number}` : 'No phone number'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Joined: {new Date(member.joined_at).toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}20`}>
            {getRoleLabel(member.role)}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              // Role change logic: cycle through roles
              const roles = ['admin', 'adult', 'dependent', 'child'];
              const currentIndex = roles.indexOf(member.role);
              const newRole = roles[(currentIndex + 1) % roles.length];
              onRoleChange(newRole);
            }}
            className="text-xs px-2 py-1"
          >
            Change Role
          </Button>
          {member.role !== 'admin' && (
            <Button 
              variant="destructive"
              size="sm"
              onClick={() => onRemove(member.id)}
              className="text-xs px-2 py-1 ml-2"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}