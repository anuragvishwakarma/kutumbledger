'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function NewMoneyJarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jarData, setJarData] = useState({
    member_id: '',
    jar_type: 'save' as const,
    target_percentage: '',
    goal_name: '',
    goal_target_amount: '',
  });
  const [members, setMembers] = useState<any[]>([]);
  const [memberLoading, setMemberLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setMemberLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('id, display_name')
        .eq('family_id', memberData.family_id);

      if (membersError) throw membersError;
      setMembers(membersData || []);
    } catch (err) {
      console.error('Error fetching members:', err);
      toast.error('Failed to load family members');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify the selected member belongs to the user's family
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('id', jarData.member_id)
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const jarDataToSave = {
        ...jarData,
        family_id: memberData.family_id,
        target_percentage: parseInt(jarData.target_percentage, 10),
        goal_target_amount: jarData.goal_target_amount 
          ? Math.round(parseFloat(jarData.goal_target_amount) * 100) // Convert to paise
          : null,
      };

      const { error } = await supabase
        .from('money_jars')
        .insert([jarDataToSave]);

      if (error) throw error;

      toast.success('Money jar created successfully');
      router.push('/money_jars');
    } catch (err) {
      console.error('Error creating money jar:', err);
      setError(err instanceof Error ? err.message : 'Failed to create money jar');
      toast.error(err instanceof Error ? err.message : 'Failed to create money jar');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    if (!amount) return '₹0.00';
    try {
      return (parseFloat(amount) / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
      });
    } catch {
      return '₹0.00';
    }
  };

  return (
    <div className=\"min-h-[calc(100vh-4rem)] p-6\">
      {/* Page Header */}
      <div className=\"mb-8\">
        <div className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4\">
          <div>
            <h1 className=\"text-2xl font-bold text-slate-900 mb-2\">Add New Money Jar</h1>
            <p className=\"text-slate-600\">Create a save/spend/give/invest jar for a family member</p>
          </div>
          <div className=\"flex items-center gap-3\">
            <Button variant=\"outline\" onClick={() => router.push('/money_jars')}>
              Back to Money Jars
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className=\"bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6\">
          <h3 className=\"text-red-900 font-medium mb-2\">Error</h3>
          <p className=\"text-red-700\">{error}</p>
        </div>
      )}

      {/* Money Jar Form */}
      <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
        <form onSubmit={handleSubmit} className=\"space-y-6\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            <div>
              <label className=\"block text-sm font-medium text-slate-700 mb-2\">For Member *</label>
              <Select
                value={jarData.member_id}
                onValueChange={(val) => setJarData(prev => ({ ...prev, member_id: val }))}
                options={memberLoading ? [{ value: '', label: 'Loading...' }] : members.map(m => ({ value: m.id, label: m.display_name || 'Unnamed' }))}
                placeholder=\"Select a family member\"
                required
                disabled={memberLoading}
              />
            </div>
            <div>
              <label className=\"block text-sm font-medium text-slate-700 mb-2\">Jar Type *</label>
              <Select
                value={jarData.jar_type}
                onValueChange={(val) => setJarData(prev => ({ ...prev, jar_type: val }))}
                options={[
                  { value: 'save', label: 'Save' },
                  { value: 'spend', label: 'Spend' },
                  { value: 'give', label: 'Give' },
                  { value: 'invest', label: 'Invest' },
                ]}
                required
              />
            </div>
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            <div>
              <label className=\"block text-sm font-medium text-slate-700 mb-2\">Target Percentage (0-100) *</label>
              <Input
                type=\"number\"
                min=\"0\"
                max=\"100\"
                value={jarData.target_percentage}
                onValueChange={(val) => setJarData(prev => ({ ...prev, target_percentage: val }))}
                placeholder=\"e.g., 20 for 20%\"\n                required
                className=\"w-full\"\n              />\n            </div>\n            <div>\n              <label className=\"block text-sm font-medium text-slate-700 mb-2\">Goal Name (Optional)</label>\n              <Input\n                type=\"text\"\n                value={jarData.goal_name}\n                onValueChange={(val) => setJarData(prev => ({ ...prev, goal_name: val }))}\n                placeholder=\"e.g., Vacation Fund, Emergency Fund\"\n                className=\"w-full\"\n              />\n            </div>\n          </div>\n\n          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n            <div>\n              <label className=\"block text-sm font-medium text-slate-700 mb-2\">Goal Target Amount (₹) (Optional)</label>\n              <div className=\"flex items-center\">\n                <span className=\"text-slate-500 mr-2\">₹</span>\n                <Input\n                  type=\"number\"\n                  step=\"0.01\"\n                  value={jarData.goal_target_amount}\n                  onValueChange={(val) => setJarData(prev => ({ ...prev, goal_target_amount: val }))}\n                  placeholder=\"0.00\"\n                  className=\"w-full\"\n                />\n              </div>\n              <p className=\"mt-1 text-xs text-slate-500\">\n                Enter target amount in rupees (will be converted to paise for storage)\n              </p>\n            </div>\n          </div>\n\n          <div className=\"mt-8 pt-4 border-t\">\n            <Button\n              type=\"submit\"\n              disabled={loading}\n              className=\"w-full\"\n            >\n              {loading ? 'Saving...' : 'Create Money Jar'}\n            </Button>\n          </div>\n        </form>\n      </div>\n    </div>\n  );\n}\n