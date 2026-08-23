import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function MoneyJarsPage() {
  const [moneyJars, setMoneyJars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMoneyJars();
  }, []);

  const fetchMoneyJars = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const { data, error } = await supabase
        .from('money_jars')
        .select(`
          *,
          family_members!member_id (
            display_name
          )
        `)
        .eq('family_id', (await supabase.from('family_members').select('family_id').eq('user_id', user.id).single()).data.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMoneyJars(data || []);
    } catch (err) {
      console.error('Error fetching money jars:', err);
      setError(err instanceof Error ? err.message : 'Failed to load money jars');
      setMoneyJars([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJar = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this money jar? This action cannot be undone.')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('id, role')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      // Check if user is admin/adult or if it's their own jar
      const { data: jarData, error: jarError } = await supabase
        .from('money_jars')
        .select('member_id')
        .eq('id', id)
        .single();

      if (jarError) throw jarError;

      const isOwner = jarData.member_id === memberData.id;
      const isAdmin = memberData.role === 'admin' || memberData.role === 'adult';

      if (!isOwner && !isAdmin) {
        throw new Error('You do not have permission to delete this jar');
      }

      const { error } = await supabase
        .from('money_jars')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Money jar deleted successfully');
      await fetchMoneyJars();
    } catch (err) {
      console.error('Error deleting money jar:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete money jar');
    }
  };

  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getJarTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      save: 'Save',
      spend: 'Spend',
      give: 'Give',
      invest: 'Invest'
    };
    return labels[type] || type;
  };

  const getJarTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      save: 'bg-blue-500',
      spend: 'bg-green-500',
      give: 'bg-purple-500',
      invest: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading money jars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading money jars</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => fetchMoneyJars()}>
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
              Money Jars
            </h1>
            <p className="text-slate-600">
              Manage your family's save/spend/give/invest jars
            </p>
          </div>
          <Link href="/money_jars/new" className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
            Add New Jar
          </Link>
        </div>
      </div>

      {/* Money Jars List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {moneyJars.length} money jar{moneyJars.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {moneyJars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No money jars found</p>
            <Link href="/money_jars/new" className="mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
              Create First Jar
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {moneyJars.map((jar) => (
              <MoneyJarCard
                key={jar.id}
                jar={jar}
                onDelete={handleDeleteJar}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Money Jar Card Component
function MoneyJarCard({ jar, onDelete }: { 
  jar: any; 
  onDelete: (id: string) => Promise<void>; 
}) {
  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getJarTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      save: 'Save',
      spend: 'Spend',
      give: 'Give',
      invest: 'Invest'
    };
    return labels[type] || type;
  };

  const getJarTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      save: 'bg-blue-500',
      spend: 'bg-green-500',
      give: 'bg-purple-500',
      invest: 'bg-orange-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getProgressPercentage = (current: number, target: number) => {
    return target > 0 ? Math.min((current / target) * 100, 100) : 0;
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-slate-900">
            {jar.goal_name || getJarTypeLabel(jar.jar_type)}
          </h3>
          <p className="text-sm text-slate-500">
            {getJarTypeLabel(jar.jar_type)} Jar
          </p>
          {jar.family_members?.display_name && (
            <p className="text-xs text-slate-400 mt-1">
              For: {jar.family_members.display_name}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <p className="text-xs text-slate-500">Progress</p>
            <div className="w-24 h-2 bg-slate-200 rounded-full relative">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${getProgressPercentage(jar.current_amount, jar.goal_target_amount || 0)}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formatCurrency(jar.current_amount)} / 
              {jar.goal_target_amount ? formatCurrency(jar.goal_target_amount) : 'No target'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(jar.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}