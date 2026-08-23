import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
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
        .from('goals')
        .select('*')
        .eq('family_id', memberData.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) return;

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
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('family_id', memberData.family_id);

      if (error) throw error;

      toast.success('Goal deleted successfully');
      await fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading goals</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => fetchGoals()}>
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
              Goals
            </h1>
            <p className="text-slate-600">
              Track your family's financial goals
            </p>
          </div>
          <Link href="/goals/new" className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
            Add New Goal
          </Link>
        </div>
      </div>

      {/* Goals List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {goals.length} goal{goals.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {goals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No goals found</p>
            <Link href="/goals/new" className="mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
              Create First Goal
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onDelete={handleDeleteGoal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Goal Card Component
function GoalCard({ goal, onDelete }: { 
  goal: any; 
  onDelete: (id: string) => Promise<void>; 
}) {
  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-slate-900">{goal.name}</h3>
          {goal.target_date && (
            <p className="text-xs text-slate-500 mt-1">
              Target date: {new Date(goal.target_date).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <p className="text-xs text-slate-500">Progress</p>
            <div className="w-24 h-2 bg-slate-200 rounded-full relative">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${calculateProgress(goal.current_amount, goal.target_amount)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(goal.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}