import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function UdhaarRecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchFamilyMembers();
    fetchRecords();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('family_members')
        .select('id, display_name')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      // Now get all family members for the same family
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('id, display_name')
        .eq('family_id', data.family_id);

      if (membersError) throw membersError;
      setFamilyMembers(membersData || []);
    } catch (err) {
      console.error('Error fetching family members:', err);
      // We don't set error here because we still want to try to fetch records
      setFamilyMembers([]);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the user's family_id
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      // Fetch udhaar records with lender and borrower details
      const { data, error } = await supabase
        .from('udhaar_records')
        .select(`
          *,
          lender:family_members!lender_id(display_name),
          borrower:family_members!borrower_id(display_name)
        `)
        .eq('family_id', memberData.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching udhaar records:', err);
      setError(err instanceof Error ? err.message : 'Failed to load udhaar records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this udhaar record? This action cannot be undone.')) return;

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
        .from('udhaar_records')
        .delete()
        .eq('id', id)
        .eq('family_id', memberData.family_id);

      if (error) throw error;

      toast.success('Udhaar record deleted successfully');
      await fetchRecords();
    } catch (err) {
      console.error('Error deleting udhaar record:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete udhaar record');
    }
  };

  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      lent: 'Lent',
      received: 'Received',
      partial: 'Partial',
      written_off: 'Written Off'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      lent: 'bg-blue-500',
      received: 'bg-green-500',
      partial: 'bg-amber-500',
      written_off: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading udhaar records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading udhaar records</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => fetchRecords()}>
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
              Udhaar Records
            </h1>
            <p className="text-slate-600">
              Track lending and borrowing within the family
            </p>
          </div>
          <Link href="/udhaar_records/new" className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
            Add New Record
          </Link>
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {records.length} udhaar record{records.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No udhaar records found</p>
            <Link href="/udhaar_records/new" className="mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md">
              Create First Record
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <UdhaarRecordCard
                key={record.id}
                record={record}
                onDelete={handleDeleteRecord}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Udhaar Record Card Component
function UdhaarRecordCard({ record, onDelete }: { 
  record: any; 
  onDelete: (id: string) => Promise<void>; 
}) {
  const formatCurrency = (amount: number) => {
    return (amount / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      lent: 'Lent',
      received: 'Received',
      partial: 'Partial',
      written_off: 'Written Off'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      lent: 'bg-blue-500',
      received: 'bg-green-500',
      partial: 'bg-amber-500',
      written_off: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 text-xs">
              💰
            </div>
            <div>
              <h3 className="font-medium text-slate-900">
                {record.lender?.display_name} → {record.borrower?.display_name}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {record.purpose || 'No purpose specified'}
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="flex flex-col items-end">
            <p className="text-xs text-slate-500">Amount</p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(record.amount)}
            </p>
          </div>
          <div className="mt-2">
            <p className="text-xs text-slate-500">Date</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date(record.date).toLocaleDateString()}
            </p>
          </div>
          {record.due_date && (
            <div className="mt-2">
              <p className="text-xs text-slate-500">Due Date</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(record.due_date).toLocaleDateString()}
              </p>
            </div>
          )}
          <div className="mt-2">
            <p className="text-xs text-slate-500">Status</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}20`}>
              {getStatusLabel(record.status)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onDelete(record.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}