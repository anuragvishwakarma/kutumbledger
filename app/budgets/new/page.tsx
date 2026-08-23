'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function NewBudgetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetData, setBudgetData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as const,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
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

      const budgetDataToSave = {
        ...budgetData,
        family_id: memberData.family_id,
        amount: Math.round(parseFloat(budgetData.amount) * 100), // Convert to paise
        // If end_date is empty, set to null
        end_date: budgetData.end_date || null,
      };

      const { error } = await supabase
        .from('budgets')
        .insert([budgetDataToSave]);

      if (error) throw error;

      toast.success('Budget created successfully');
      router.push('/budgets');
    } catch (err) {
      console.error('Error creating budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to create budget');
      toast.error(err instanceof Error ? err.message : 'Failed to create budget');
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
    <div className="min-h-[calc(100vh-4rem)] p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Add New Budget
            </h1>
            <p className="text-slate-600">
              Set a new budget for a specific category
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/budgets')}
            >
              Back to Budgets
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Budget Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <Input
                type="text"
                value={budgetData.category}
                onValueChange={(val) => setBudgetData(prev => ({ ...prev, category: val }))}
                placeholder="Enter budget category (e.g., Groceries, Utilities)"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹) *</label>
              <div className="flex items-center">
                <span className="text-slate-500 mr-2">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  value={budgetData.amount}
                  onValueChange={(val) => setBudgetData(prev => ({ ...prev, amount: val }))}
                  placeholder="0.00"
                  required
                  className="w-full"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Enter amount in rupees (will be converted to paise for storage)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Period *</label>
              <Select
                value={budgetData.period}
                onValueChange={(val) => setBudgetData(prev => ({ ...prev, period: val }))}
                options={[
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'yearly', label: 'Yearly' },
                ]}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Date *</label>
              <DatePicker
                value={budgetData.start_date}
                onValueChange={(val) => setBudgetData(prev => ({ ...prev, start_date: val }))}
                placeholder="Select start date"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
            <DatePicker
              value={budgetData.end_date}
              onValueChange={(val) => setBudgetData(prev => ({ ...prev, end_date: val }))}
              placeholder="Select end date (leave blank for ongoing)"
            />
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}