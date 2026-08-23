'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { CategorySelector } from '@/components/ui/CategorySelector';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as const,
    amount: '',
    category: '',
    description: '',
    date: '',
    payment_method: 'upi',
    is_recurring: false,
  });

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('transactions')
        .select(`
          *,
          family_members!member_id (
            name,
            avatar_url
          )
        `)
        .order('date', { ascending: false });

      if (filterType !== 'all') {
        query = query.eq('type', filterType);
      }

      if (filterDate) {
        query = query.eq('date', filterDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    setCreating(true);
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

      const transactionData = {
        ...newTransaction,
        family_id: memberData.family_id,
        member_id: memberData.id,
        amount: Math.round(parseFloat(newTransaction.amount) * 100), // Convert to paise
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        local_timestamp: Date.now(),
      };

      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);

      if (error) throw error;

      toast.success('Transaction created successfully');
      setNewTransaction({
        type: 'expense' as const,
        amount: '',
        category: '',
        description: '',
        date: '',
        payment_method: 'upi',
        is_recurring: false,
      });
      await fetchTransactions();
    } catch (err) {
      console.error('Error creating transaction:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create transaction');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTransaction = async (id: string) => {
    // Implementation for updating transaction
    toast.info('Update functionality coming soon');
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
      await fetchTransactions();
    } catch (err) {
      console.error('Error deleting transaction:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete transaction');
    }
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading transactions</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => fetchTransactions()}>
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Transactions</h1>
        <p className="text-slate-600">
          View and manage all family transactions
        </p>
        <Link href="/transactions/new" className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Transaction
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
            <Select
              value={filterType}
              onValueChange={setFilterType}
              options={[
                { value: 'all', label: 'All' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' },
                { value: 'transfer', label: 'Transfer' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <DatePicker
              value={filterDate}
              onValueChange={setFilterDate}
              placeholder="Select date"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => fetchTransactions()} variant="outline">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No transactions found</p>
            <Link href="/transactions/new" className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors font-medium">
              Add First Transaction
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onDelete={handleDeleteTransaction}
                onEdit={handleUpdateTransaction}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Transaction Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Add New Transaction
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateTransaction();
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(val) => setNewTransaction(prev => ({ ...prev, type: val }))}
                    options={[
                      { value: 'income', label: 'Income' },
                      { value: 'expense', label: 'Expense' },
                      { value: 'transfer', label: 'Transfer' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Amount (₹)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onValueChange={(val) => setNewTransaction(prev => ({ ...prev, amount: val }))}
                    placeholder="Enter amount"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                <CategorySelector
                  selectedId={newTransaction.category}
                  onSelect={(categoryId) => setNewTransaction(prev => ({ ...prev, category: categoryId }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <Input
                  type="text"
                  value={newTransaction.description}
                  onValueChange={(val) => setNewTransaction(prev => ({ ...prev, description: val }))}
                  placeholder="Enter description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <DatePicker
                    value={newTransaction.date}
                    onValueChange={(val) => setNewTransaction(prev => ({ ...prev, date: val }))}
                    placeholder="Select date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
                  <Select
                    value={newTransaction.payment_method}
                    onValueChange={(val) => setNewTransaction(prev => ({ ...prev, payment_method: val }))}
                    options={[
                      { value: 'upi', label: 'UPI' },
                      { value: 'cash', label: 'Cash' },
                      { value: 'card', label: 'Card' },
                      { value: 'bank', label: 'Bank' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newTransaction.is_recurring}
                    onChange={(e) => setNewTransaction(prev => ({ ...prev, is_recurring: e.target.checked }))}
                  />
                  Recurring transaction
                </label>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setCreating(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!newTransaction.amount || !newTransaction.category || !newTransaction.date}
                  className="bg-primary text-white hover:bg-primary/90"
                >
                  Add Transaction
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Transaction Card Component
function TransactionCard({ transaction, onDelete, onEdit }: { 
  transaction: any; 
  onDelete: (id: string) => Promise<void>; 
  onEdit: (id: string) => Promise<void>; 
}) {
  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'income': return 'text-emerald-600 bg-emerald-50';
      case 'expense': return 'text-red-600 bg-red-50';
      case 'transfer': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'income': return '📈';
      case 'expense': return '📉';
      case 'transfer': return '🔄';
      default: return '💰';
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className={`${getTypeColor(transaction.type)} flex items-center justify-center h-10 w-10 rounded-lg`}>
            {getTypeIcon(transaction.type)}
          </div>
          <div>
            <h3 className="font-medium text-slate-900">{transaction.description || 'No description'}</h3>
            <p className="text-sm text-slate-500">{transaction.category}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-900">
            {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(transaction.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
      
      {transaction.family_members && (
        <div className="flex items-center space-x-3 text-sm text-slate-600">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            {transaction.family_members.avatar_url ? (
              <img 
                src={transaction.family_members.avatar_url} 
                alt={transaction.family_members.name} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-slate-200 text-slate-500 text-xs font-medium">
                {transaction.family_members.name?.charAt(0) ?? '?'}
              </div>
            )}
          </div>
          <span>{transaction.family_members.name}</span>
        </div>
      )}
      
      <div className="mt-4 flex justify-between text-xs text-slate-500">
        <span>Payment: {transaction.payment_method?.toUpperCase()}</span>
        <span>{transaction.is_recurring ? '🔁 Recurring' : '📝 One-time'}</span>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onEdit(transaction.id)}
        >
          Edit
        </Button>
        <Button 
          variant="destructive"
          size="sm"
          onClick={() => onDelete(transaction.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}