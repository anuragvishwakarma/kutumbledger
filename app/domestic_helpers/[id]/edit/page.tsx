'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EditDomesticHelperPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const helperId = params.id;
  
  const [helper, setHelper] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'maid' as const,
    base_salary: '',
    festival_bonus_pct: '',
    advances: '',
    payment_method: 'cash' as const,
    upi_id: '',
    bank_account: '',
    is_active: true,
  });

  useEffect(() => {
    if (helperId) {
      fetchHelper();
    }
  }, [helperId]);

  const fetchHelper = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Only admins can edit helpers
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('role, family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;
      if (memberData.role !== 'admin') {
        throw new Error('Only admins can edit domestic helpers');
      }

      const { data, error } = await supabase
        .from('domestic_helpers')
        .select('*')
        .eq('id', helperId)
        .eq('family_id', memberData.family_id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Helper not found or access denied');

      setHelper(data);
      setFormData({
        name: data.name,
        role: data.role,
        base_salary: (data.base_salary / 100).toString(),
        festival_bonus_pct: data.festival_bonus_pct.toString(),
        advances: (data.advances / 100).toString(),
        payment_method: data.payment_method,
        upi_id: data.upi_id || '',
        bank_account: data.bank_account || '',
        is_active: data.is_active,
      });
    } catch (err) {
      console.error('Error fetching domestic helper:', err);
      setError(err instanceof Error ? err.message : 'Failed to load helper');
      setHelper(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHelper = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify admin ownership before updating
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('role, family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;
      if (memberData.role !== 'admin') {
        throw new Error('Only admins can edit domestic helpers');
      }

      const helperDataToSave = {
        ...formData,
        base_salary: Math.round(parseFloat(formData.base_salary) * 100),
        festival_bonus_pct: parseInt(formData.festival_bonus_pct, 10),
        advances: Math.round(parseFloat(formData.advances) * 100),
        payment_method: formData.payment_method,
        upi_id: formData.upi_id || null,
        bank_account: formData.bank_account || null,
        is_active: formData.is_active,
      };

      const { error } = await supabase
        .from('domestic_helpers')
        .update(helperDataToSave)
        .eq('id', helperId);

      if (error) throw error;

      toast.success('Domestic helper updated successfully');
      router.push('/domestic_helpers');
    } catch (err) {
      console.error('Error updating domestic helper:', err);
      setError(err instanceof Error ? err.message : 'Failed to update helper');
      toast.error(err instanceof Error ? err.message : 'Failed to update helper');
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-500">Loading domestic helper...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading domestic helper</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => router.push('/domestic_helpers')}>
            Back to Domestic Helpers
          </Button>
        </div>
      </div>
    );
  }

  if (!helper) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Domestic Helper Not Found</h2>
          <p className="text-slate-600">
            The domestic helper you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => router.push('/domestic_helpers')}>
            Back to Domestic Helpers
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
              Edit Domestic Helper
            </h1>
            <p className="text-slate-600">
              Update the details of this domestic helper
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/domestic_helpers')}
            >
              Back to Domestic Helpers
            </Button>
          </div>
        </div>
      </div>

      {/* Helper Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateHelper();
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
              <Input
                type="text"
                value={formData.name}
                onValueChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                placeholder="Enter helper's name"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Role *</label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                options={[
                  { value: 'maid', label: 'Maid' },
                  { value: 'cook', label: 'Cook' },
                  { value: 'driver', label: 'Driver' },
                  { value: 'nanny', label: 'Nanny' },
                  { value: 'gardener', label: 'Gardener' },
                  { value: 'other', label: 'Other' },
                ]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Base Salary (₹) *</label>
              <div className="flex items-center">
                <span className="text-slate-500 mr-2">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.base_salary}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, base_salary: val }))}
                  placeholder="0.00"
                  required
                  className="w-full"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Enter salary in rupees (will be converted to paise for storage)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Festival Bonus (%) *</label>
              <Input
                type="number"
                min="0"
                max="200"
                value={formData.festival_bonus_pct}
                onValueChange={(val) => setFormData(prev => ({ ...prev, festival_bonus_pct: val }))}
                placeholder="0-200"
                required
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500">
                Percentage of base salary as festival bonus
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Advances (₹) *</label>
              <div className="flex items-center">
                <span className="text-slate-500 mr-2">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.advances}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, advances: val }))}
                  placeholder="0.00"
                  required
                  className="w-full"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Enter advances in rupees (will be converted to paise for storage)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method *</label>
              <Select
                value={formData.payment_method}
                onValueChange={(val) => setFormData(prev => ({ ...prev, payment_method: val }))}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'bank', label: 'Bank Transfer' },
                ]}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">UPI ID (Optional)</label>
              <Input
                type="text"
                value={formData.upi_id}
                onValueChange={(val) => setFormData(prev => ({ ...prev, upi_id: val }))}
                placeholder="Enter UPI ID (if payment method is UPI)"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Bank Account (Optional)</label>
              <Input
                type="text"
                value={formData.bank_account}
                onValueChange={(val) => setFormData(prev => ({ ...prev, bank_account: val }))}
                placeholder="Enter bank account details (if payment method is bank)"
                className="w-full"
              />
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-primary rounded focus:ring-primary"
              />
            </div>
            <span className="text-slate-700">Active</span>
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Domestic Helper'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}