'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function DomesticHelpersPage() {
  const [helpers, setHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHelpers();
  }, []);

  const fetchHelpers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Only admins can view helpers
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('role, family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;
      if (memberData.role !== 'admin') {
        throw new Error('Only admins can view domestic helpers');
      }

      const { data, error } = await supabase
        .from('domestic_helpers')
        .select('*')
        .eq('family_id', memberData.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHelpers(data || []);
    } catch (err) {
      console.error('Error fetching domestic helpers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load domestic helpers');
      setHelpers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHelper = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this domestic helper? This action cannot be undone.')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify admin
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('role, family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;
      if (memberData.role !== 'admin') {
        throw new Error('Only admins can delete domestic helpers');
      }

      const { error } = await supabase
        .from('domestic_helpers')
        .delete()
        .eq('id', id)
        .eq('family_id', memberData.family_id);

      if (error) throw error;

      toast.success('Domestic helper deleted successfully');
      await fetchHelpers();
    } catch (err) {
      console.error('Error deleting domestic helper:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete domestic helper');
    }
  };

  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      maid: 'Maid',
      cook: 'Cook',
      driver: 'Driver',
      nanny: 'Nanny',
      gardener: 'Gardener',
      other: 'Other',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className=\"min-h-[calc(100vh-4rem)] p-6\">
        <div className=\"text-center py-12\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-primary\"></div>
          <p className=\"mt-4 text-slate-500\">Loading domestic helpers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"min-h-[calc(100vh-4rem)] p-6\">
        <div className=\"bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6\">
          <h3 className=\"text-red-900 font-medium mb-2\">Error loading domestic helpers</h3>
          <p className=\"text-red-700\">{error}</p>
          <Button variant=\"outline\" onClick={() => fetchHelpers()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-[calc(100vh-4rem)] p-6\">
      {/* Page Header */}
      <div className=\"mb-8\">
        <div className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4\">
          <div>
            <h1 className=\"text-2xl font-bold text-slate-900 mb-2\">Domestic Helpers</h1>
            <p className=\"text-slate-600\">Manage your family's domestic staff</p>
          </div>
          <Link href=\"/domestic_helpers/new\" className=\"bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md\">
            Add New Helper
          </Link>
        </div>
      </div>

      {/* Helpers List */}
      <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
        <div className=\"mb-4\">
          <h2 className=\"text-lg font-semibold text-slate-900\">
            {helpers.length} domestic helper{helpers.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {helpers.length === 0 ? (
          <div className=\"text-center py-12\">
            <p className=\"text-slate-500\">No domestic helpers found</p>
            <Link href=\"/domestic_helpers/new\" className=\"mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md\">
              Add First Helper
            </Link>
          </div>
        ) : (
          <div className=\"space-y-4\">
            {helpers.map((helper) => (
              <HelperCard
                key={helper.id}
                helper={helper}
                onDelete={handleDeleteHelper}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Card Component
function HelperCard({ helper, onDelete }: { 
  helper: any; 
  onDelete: (id: string) => Promise<void>; 
}) {
  const formatAmount = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      maid: 'Maid',
      cook: 'Cook',
      driver: 'Driver',
      nanny: 'Nanny',
      gardener: 'Gardener',
      other: 'Other',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      maid: 'bg-blue-500',
      cook: 'bg-green-500',
      driver: 'bg-purple-500',
      nanny: 'bg-orange-500',
      gardener: 'bg-pink-500',
      other: 'bg-gray-500',
    };
    return colors[role] || 'bg-gray-500';
  };

  return (
    <div className=\"border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow\">
      <div className=\"flex justify-between items-start mb-3\">
        <div className=\"flex-1\">
          <h3 className=\"font-medium text-slate-900\">{helper.name}</h3>
          <p className=\"text-sm text-slate-500\">{getRoleLabel(helper.role)}</p>
          {helper.base_salary && (
            <p className=\"text-xs text-slate-400 mt-1\">Base Salary: {formatAmount(helper.base_salary)}</p>
          )}
        </div>
        <div className=\"text-right\">
          <div className=\"flex flex-col items-end\">
            <p className=\"text-xs text-slate-500\">Status</p>
            <div className=\"w-8 h-8 rounded-full flex items-center justify-center\">
              {helper.is_active ? (
                <span className=\"text-xs font-medium text-green-600\">Active</span>
              ) : (
                <span className=\"text-xs font-medium text-red-600\">Inactive</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {helper.upi_id || helper.bank_account && (
        <div className=\"mt-4 flex justify-between text-xs text-slate-500\">
          <span>Payment: {helper.payment_method?.toUpperCase()}</span>
          <span>{helper.upi_id || helper.bank_account}</span>
        </div>
      )}

      <div className=\"mt-4 flex justify-end\">
        <Button 
          variant=\"outline\" 
          size=\"sm\"
          onClick={() => onDelete(helper.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}