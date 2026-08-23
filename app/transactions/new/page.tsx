'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function NewTransactionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState({
    type: 'expense' as const,
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'upi',
    is_recurring: false,
    recurrence_rule: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's family member ID
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('id, family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const transactionDataToSave = {
        ...transactionData,
        family_id: memberData.family_id,
        member_id: memberData.id,
        amount: Math.round(parseFloat(transactionData.amount) * 100), // Convert to paise
        local_timestamp: Date.now(),
        // Remove empty recurrence_rule if not recurring
        ...(!transactionData.is_recurring && { recurrence_rule: '' })
      };

      const { error } = await supabase
        .from('transactions')
        .insert([transactionDataToSave]);

      if (error) throw error;

      toast.success('Transaction created successfully');
      router.push('/transactions');
    } catch (err) {
      console.error('Error creating transaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
      toast.error(err instanceof Error ? err.message : 'Failed to create transaction');
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
              Add New Transaction
            </h1>
            <p className="text-slate-600">
              Record a new income, expense, or transfer for your family
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/transactions')}
            >
              Back to Transactions
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

      {/* Transaction Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Type *</label>
              <Select
                value={transactionData.type}
                onValueChange={(val) => setTransactionData(prev => ({ ...prev, type: val }))}
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
                  value={transactionData.amount}
                  onValueChange={(val) => setTransactionData(prev => ({ ...prev, amount: val }))}
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
              selectedId={transactionData.category}
              onSelect={(categoryId) => setTransactionData(prev => ({ ...prev, category: categoryId }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <Input
              type="text"
              value={transactionData.description}
              onValueChange={(val) => setTransactionData(prev => ({ ...prev, description: val }))}
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date *</label>
              <DatePicker
                value={transactionData.date}
                onValueChange={(val) => setTransactionData(prev => ({ ...prev, date: val }))}
                placeholder="Select date"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method *</label>
              <Select
                value={transactionData.payment_method}
                onValueChange={(val) => setTransactionData(prev => ({ ...prev, payment_method: val }))}
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
                  checked={transactionData.is_recurring}
                  onChange={(e) => setTransactionData(prev => ({ 
                    ...prev, 
                    is_recurring: e.target.checked,
                    recurrence_rule: e.target.checked ? transactionData.recurrence_rule : ''
                  }))}
                />
                Recurring transaction
              </label>
            </div>

            {transactionData.is_recurring && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Recurrence Rule *</label>
                  <Input
                    type="text"
                    value={transactionData.recurrence_rule}
                    onValueChange={(val) => setTransactionData(prev => ({ ...prev, recurrence_rule: val }))}
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
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Saving...' : 'Add Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}