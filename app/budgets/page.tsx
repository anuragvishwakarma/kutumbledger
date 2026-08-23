import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('family_id', memberData.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify ownership
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('family_id', memberData.family_id);

      if (error) throw error;

      toast.success('Budget deleted successfully');
      await fetchBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  const formatCurrency = (amount: number) => {
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
          <p className="mt-4 text-slate-500">Loading budgets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading budgets</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => fetchBudgets()}>
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
              Budgets
            </h1>
            <p className="text-slate-600">
              Set and track your family's budget goals
            </p>
          </div>
          <Link href="/budgets/new" className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
            Add New Budget
          </Link>
        </div>
      </div>

      {/* Budgets List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {budgets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No budgets found</p>
            <Link href="/budgets/new" className="mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
              Create First Budget
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Budget Card Component
function BudgetCard({ budget, onDelete }: { 
  budget: any; 
  onDelete: (id: string) => Promise<void>; 
}) {
  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getPeriodLabel = (period: string) => {
    return period === 'monthly' ? 'Monthly' : 'Yearly';
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-slate-900">{budget.category}</h3>
          <p className="text-sm text-slate-500">
            {getPeriodLabel(budget.period)} budget
          </p>
          {budget.start_date && budget.end_date && (
            <p className="text-xs text-slate-400 mt-1">
              {new Date(budget.start_date).toLocaleDateString()} - 
              {budget.end_date ? new Date(budget.end_date).toLocaleDateString() : 'Ongoing'}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(budget.amount)}
          </p>
          <p className="text-xs text-slate-500">
            {budget.period === 'monthly' ? 'per month' : 'per year'}
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(budget.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}