'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function NewGoalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [goalData, setGoalData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's family ID
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const goalDataToSave = {
        ...goalData,
        family_id: memberData.family_id,
        target_amount: Math.round(parseFloat(goalData.target_amount) * 100), // Convert to paise
        current_amount: 0,
      };

      const { error } = await supabase
        .from('goals')
        .insert([goalDataToSave]);

      if (error) throw error;

      toast.success('Goal created successfully');
      router.push('/goals');
    } catch (err) {
      console.error('Error creating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      toast.error(err instanceof Error ? err.message : 'Failed to create goal');
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
            <h1 className=\"text-2xl font-bold text-slate-900 mb-2\">Add New Goal</h1>
            <p className=\"text-slate-600\">Set a new financial goal for your family</p>
          </div>
          <div className=\"flex items-center gap-3\">
            <Button variant=\"outline\" onClick={() => router.push('/goals')}>
              Back to Goals
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

      {/* Goal Form */}
      <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
        <form onSubmit={handleSubmit} className=\"space-y-6\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            <div>
              <label className=\"block text-sm font-medium text-slate-700 mb-2\">Goal Name *</label>
              <Input
                type=\"text\"
                value={goalData.name}
                onValueChange={(val) => setGoalData(prev => ({ ...prev, name: val }))}
                placeholder=\"Enter goal name (e.g., Vacation, Emergency Fund)\"
                required
                className=\"w-full\"
              />
            </div>
            <div>
              <label className=\"block text-sm font-medium text-slate-700 mb-2\">Target Amount (₹) *</label>
              <div className=\"flex items-center\">
                <span className=\"text-slate-500 mr-2\">₹</span>
                <Input
                  type=\"number\"
                  step=\"0.01\"
                  value={goalData.target_amount}
                  onValueChange={(val) => setGoalData(prev => ({ ...prev, target_amount: val }))}
                  placeholder=\"0.00\"
                  required
                  className=\"w-full\"
                />
              </div>
              <p className=\"mt-1 text-xs text-slate-500\">
                Enter target amount in rupees (will be converted to paise for storage)
              </p>
            </div>
          </div>

          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            <div>
              <label className=\"block text-sm font-medium text-slate-700 mb-2\">Target Date (Optional)</label>
              <DatePicker
                value={goalData.target_date}
                onValueChange={(val) => setGoalData(prev => ({ ...prev, target_date: val }))}
                placeholder=\"Select target date\"
              />
            </div>
          </div>

          <div className=\"mt-8 pt-4 border-t\">
            <Button
              type=\"submit\"
              disabled={loading}
              className=\"w-full\"
            >
              {loading ? 'Saving...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}