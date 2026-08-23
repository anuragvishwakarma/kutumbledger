'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EditBudgetPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const budgetId = params.id;
  
  const [budget, setBudget] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    amount: '',
    period: 'monthly' as const,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (budgetId) {
      fetchBudget();
    }
  }, [budgetId]);

  const fetchBudget = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', budgetId)
        .eq('family_id', (await supabase.from('family_members').select('family_id').eq('user_id', user.id).single()).data.family_id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Budget not found or access denied');

      // Convert amount from paise to rupees for form
      setBudget(data);
      setFormData({
        category: data.category,
        amount: (data.amount / 100).toString(),
        period: data.period,
        start_date: data.start_date,
        end_date: data.end_date || '',
      });
    } catch (err) {
      console.error('Error fetching budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to load budget');
      setBudget(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify ownership before updating
      const { data: existingData, error: fetchError } = await supabase
        .from('budgets')
        .select('id')
        .eq('id', budgetId)
        .eq('family_id', (await supabase.from('family_members').select('family_id').eq('user_id', user.id).single()).data.family_id);

      if (fetchError) throw fetchError;
      if (!existingData) throw new Error('Budget not found or access denied');

      const budgetDataToSave = {
        ...formData,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to paise
        // If end_date is empty, set to null
        end_date: formData.end_date || null,
      };

      const { error } = await supabase
        .from('budgets')
        .update(budgetDataToSave)
        .eq('id', budgetId);

      if (error) throw error;

      toast.success('Budget updated successfully');
      router.push('/budgets');
    } catch (err) {
      console.error('Error updating budget:', err);
      setError(err instanceof Error ? err.message : 'Failed to update budget');
      toast.error(err instanceof Error ? err.message : 'Failed to update budget');
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading budget...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading budget</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => router.push('/budgets')}>
            Back to Budgets
          </Button>
        </div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Budget Not Found</h2>
          <p className="text-slate-600">
            The budget you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => router.push('/budgets')}>
            Back to Budgets
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
              Edit Budget
            </h1>
            <p className="text-slate-600">
              Update the details of this budget
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

      {/* Budget Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateBudget();
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
              <Input
                type="text"
                value={formData.category}
                onValueChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                placeholder="Enter budget category"
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
                  value={formData.amount}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, amount: val }))}
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
                value={formData.period}
                onValueChange={(val) => setFormData(prev => ({ ...prev, period: val }))}
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
                value={formData.start_date}
                onValueChange={(val) => setFormData(prev => ({ ...prev, start_date: val }))}
                placeholder="Select start date"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date (Optional)</label>
            <DatePicker
              value={formData.end_date}
              onValueChange={(val) => setFormData(prev => ({ ...prev, end_date: val }))}
              placeholder="Select end date (leave blank for ongoing)"
            />
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Budget'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}