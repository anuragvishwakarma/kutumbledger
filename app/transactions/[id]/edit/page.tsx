'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EditTransactionPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const transactionId = params.id;
  
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as const,
    amount: '',
    category: '',
    description: '',
    date: '',
    payment_method: 'upi',
    is_recurring: false,
    recurrence_rule: '',
  });

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  const fetchTransaction = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          family_members!member_id (
            name
          )
        `)
        .eq('id', transactionId)
        .eq('family_members.user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Transaction not found or access denied');

      // Convert amount from paise to rupees for form
      setTransaction(data);
      setFormData({
        type: data.type,
        amount: (data.amount / 100).toString(),
        category: data.category,
        description: data.description,
        date: data.date,
        payment_method: data.payment_method,
        is_recurring: data.is_recurring,
        recurrence_rule: data.recurrence_rule || '',
      });
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transaction');
      setTransaction(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTransaction = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify ownership before updating
      const { data: existingData, error: fetchError } = await supabase
        .from('transactions')
        .select('id')
        .eq('id', transactionId)
        .eq('family_members.user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!existingData) throw new Error('Transaction not found or access denied');

      const transactionDataToSave = {
        ...formData,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to paise
        local_timestamp: Date.now(),
        // Clear recurrence_rule if not recurring
        ...(!formData.is_recurring && { recurrence_rule: '' })
      };

      const { error } = await supabase
        .from('transactions')
        .update(transactionDataToSave)
        .eq('id', transactionId);

      if (error) throw error;

      toast.success('Transaction updated successfully');
      router.push('/transactions');
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      toast.error(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async () => {
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('family_members.user_id', user.id);

      if (error) throw error;

      toast.success('Transaction deleted successfully');
      router.push('/transactions');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete transaction');
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
          <p className="mt-4 text-slate-500">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading transaction</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => router.push('/transactions')}>
            Back to Transactions
          </Button>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Transaction Not Found</h2>
          <p className="text-slate-600">
            The transaction you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => router.push('/transactions')}>
            Back to Transactions
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
              Edit Transaction
            </h1>
            <p className="text-slate-600">
              Update the details of this transaction
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/transactions')}
            >
              Back to Transactions
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTransaction}
              className="ml-3"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateTransaction();
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
              <Select
                value={formData.type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                options={[
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                  { value: 'transfer', label: 'Transfer' },
                ]}
                required
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
            <CategorySelector
              selectedId={formData.category}
              onSelect={(categoryId) => setFormData(prev => ({ ...prev, category: categoryId }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <Input
              type="text"
              value={formData.description}
              onValueChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
              <DatePicker
                value={formData.date}
                onValueChange={(val) => setFormData(prev => ({ ...prev, date: val }))}
                placeholder="Select date"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method *</label>
              <Select
                value={formData.payment_method}
                onValueChange={(val) => setFormData(prev => ({ ...prev, payment_method: val }))}
                options={[
                  { value: 'upi', label: 'UPI' },
                  { value: 'cash', label: 'Cash' },
                  { value: 'card', label: 'Card' },
                  { value: 'bank', label: 'Bank' },
                  { value: 'other', label: 'Other' },
                ]}
                required
              />
            </div>
          </div>

          {/* Recurring Transaction Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-3 mb-4">
              <label className="flex items-center text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.is_recurring}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    is_recurring: e.target.checked,
                    recurrence_rule: e.target.checked ? formData.recurrence_rule : ''
                  }))}
                />
                Recurring transaction
              </label>
            </div>

            {formData.is_recurring && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recurrence Rule *</label>
                  <Input
                    type="text"
                    value={formData.recurrence_rule}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, recurrence_rule: val }))}
                    placeholder="e.g., FREQ=MONTHLY;BYMONTHDAY=1"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Use iCalendar RRULE format (e.g., FREQ=MONTHLY;BYMONTHDAY=1 for monthly on 1st)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}