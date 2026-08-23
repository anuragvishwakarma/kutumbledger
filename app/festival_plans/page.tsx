import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function FestivalPlansPage() {
  const [festivalPlans, setFestivalPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFestivalPlans();
  }, []);

  const fetchFestivalPlans = async () => {
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
        .from('festival_plans')
        .select('*')
        .eq('family_id', memberData.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFestivalPlans(data || []);
    } catch (err) {
      console.error('Error fetching festival plans:', err);
      setError(err instanceof Error ? err.message : 'Failed to load festival plans');
      setFestivalPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFestivalPlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this festival plan? This action cannot be undone.')) return;

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
        .from('festival_plans')
        .delete()
        .eq('id', id)
        .eq('family_id', memberData.family_id);

      if (error) throw error;

      toast.success('Festival plan deleted successfully');
      await fetchFestivalPlans();
    } catch (err) {
      console.error('Error deleting festival plan:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete festival plan');
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
          <p className="mt-4 text-slate-500">Loading festival plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading festival plans</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => fetchFestivalPlans()}>
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
              Festival Plans
            </h1>
            <p className="text-slate-600">
              Plan and track your family's festival expenses
            </p>
          </div>
          <Link href="/festival_plans/new" className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
            Add New Festival Plan
          </Link>
        </div>
      </div>

      {/* Festival Plans List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {festivalPlans.length} festival plan{festivalPlans.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {festivalPlans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No festival plans found</p>
            <Link href="/festival_plans/new" className="mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
              Create First Festival Plan
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {festivalPlans.map((plan) => (
              <FestivalPlanCard
                key={plan.id}
                plan={plan}
                onDelete={handleDeleteFestivalPlan}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Festival Plan Card Component
function FestivalPlanCard({ plan, onDelete }: { 
  plan: any; 
  onDelete: (id: string) => Promise<void>; 
}) {
  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-slate-900">{plan.festival_name}</h3>
          <p className="text-sm text-slate-500">
            Year: {plan.year}
          </p>
          {plan.start_saving_month && (
            <p className="text-xs text-slate-500 mt-1">
              Start saving from month: {plan.start_saving_month}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(plan.total_budget)}
          </p>
          <p className="text-xs text-slate-500">
            Total Budget
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(plan.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}