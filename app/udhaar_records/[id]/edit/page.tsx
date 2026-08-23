'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EditUdhaarRecordPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const recordId = params.id;
  
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    lender_id: '',
    borrower_id: '',
    amount: '',
    purpose: '',
    date: '',
    due_date: '',
    status: 'lent' as const,
  });
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    if (recordId) {
      fetchRecord();
    }
  }, [recordId]);

  const fetchRecord = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's family_id for validation
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      // Fetch the record with lender and borrower details
      const { data, error } = await supabase
        .from('udhaar_records')
        .select(`
          *,
          lender:family_members!lender_id(display_name),
          borrower:family_members!borrower_id(display_name)
        `)
        .eq('id', recordId)
        .eq('family_id', memberData.family_id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Udhaar record not found or access denied');

      // Fetch all family members for dropdowns
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('id, display_name')
        .eq('family_id', memberData.family_id)
        .order('display_name');

      if (membersError) throw membersError;
      setFamilyMembers(membersData || []);

      setRecord(data);
      setFormData({
        lender_id: data.lender_id,
        borrower_id: data.borrower_id,
        amount: (data.amount / 100).toString(),
        purpose: data.purpose || '',
        date: data.date,
        due_date: data.due_date || '',
        status: data.status,
      });
    } catch (err) {
      console.error('Error fetching udhaar record:', err);
      setError(err instanceof Error ? err.message : 'Failed to load record');
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's family_id for validation
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      // Verify ownership before updating
      const { data: existingData, error: fetchError } = await supabase
        .from('udhaar_records')
        .select('id')
        .eq('id', recordId)
        .eq('family_id', memberData.family_id);

      if (fetchError) throw fetchError;
      if (!existingData) throw new Error('Udhaar record not found or access denied');

      const recordDataToSave = {
        ...formData,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to paise
        date: formData.date,
        due_date: formData.due_date || null,
        status: formData.status,
      };

      const { error } = await supabase
        .from('udhaar_records')
        .update(recordDataToSave)
        .eq('id', recordId);

      if (error) throw error;

      toast.success('Udhaar record updated successfully');
      router.push('/udhaar_records');
    } catch (err) {
      console.error('Error updating udhaar record:', err);
      setError(err instanceof Error ? err.message : 'Failed to update record');
      toast.error(err instanceof Error ? err.message : 'Failed to update record');
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      lent: 'Lent',
      received: 'Received',
      partial: 'Partial',
      written_off: 'Written Off'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading udhaar record...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading udhaar record</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => router.push('/udhaar_records')}>
            Back to Udhaar Records
          </Button>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Udhaar Record Not Found</h2>
          <p className="text-slate-600">
            The udhaar record you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => router.push('/udhaar_records')}>
            Back to Udhaar Records
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
              Edit Udhaar Record
            </h1>
            <p className="text-slate-600">
              Update the details of this lending/borrowing record
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/udhaar_records')}
            >
              Back to Udhaar Records
            </Button>
          </div>
        </div>
      </div>

      {/* Udhaar Record Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateRecord();
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Lender *</label>
              <Select
                value={formData.lender_id}
                onValueChange={(val) => setFormData(prev => ({ ...prev, lender_id: val }))}
                options={familyMembers.map(member => ({
                  value: member.id,
                  label: member.display_name
                }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Borrower *</label>
              <Select
                value={formData.borrower_id}
                onValueChange={(val) => setFormData(prev => ({ ...prev, borrower_id: val }))}
                options={familyMembers.map(member => ({
                  value: member.id,
                  label: member.display_name
                }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Purpose (Optional)</label>
              <Input
                type="text"
                value={formData.purpose}
                onValueChange={(val) => setFormData(prev => ({ ...prev, purpose: val }))}
                placeholder="Enter purpose (e.g., medical emergency, business investment)"
                className="w-full"
              />
            </div>
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
              <label className="block text-sm font-medium text-slate-700 mb-2">Due Date (Optional)</label>
              <DatePicker
                value={formData.due_date}
                onValueChange={(val) => setFormData(prev => ({ ...prev, due_date: val }))}
                placeholder="Select due date (leave blank for no due date)"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
              options={[
                { value: 'lent', label: 'Lent' },
                { value: 'received', label: 'Received' },
                { value: 'partial', label: 'Partial' },
                { value: 'written_off', label: 'Written Off' },
              ]}
              required
            />
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Udhaar Record'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}