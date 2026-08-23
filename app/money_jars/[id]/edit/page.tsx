'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EditMoneyJarPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jarId = params.id;
  
  const [jar, setJar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    target_percentage: '',
    current_amount: '',
    goal_name: '',
    goal_target_amount: '',
  });

  useEffect(() => {
    if (jarId) {
      fetchJar();
    }
  }, [jarId]);

  const fetchJar = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('money_jars')
        .select(`
          *,
          family_members!member_id (
            display_name
          )
        `)
        .eq('id', jarId)
        .eq('family_members.user_id', user.id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Money jar not found or access denied');

      // Convert amounts from paise to rupees for form
      setJar(data);
      setFormData({
        target_percentage: data.target_percentage.toString(),
        current_amount: (data.current_amount / 100).toString(),
        goal_name: data.goal_name || '',
        goal_target_amount: data.goal_target_amount ? (data.goal_target_amount / 100).toString() : '',
      });
    } catch (err) {
      console.error('Error fetching money jar:', err);
      setError(err instanceof Error ? err.message : 'Failed to load money jar');
      setJar(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJar = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify ownership before updating
      const { data: existingData, error: fetchError } = await supabase
        .from('money_jars')
        .select('id')
        .eq('id', jarId)
        .eq('family_members.user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!existingData) throw new Error('Money jar not found or access denied');

      const jarDataToSave = {
        ...formData,
        target_percentage: parseInt(formData.target_percentage, 10),
        current_amount: Math.round(parseFloat(formData.current_amount) * 100), // Convert to paise
        goal_name: formData.goal_name || null,
        goal_target_amount: formData.goal_target_amount 
          ? Math.round(parseFloat(formData.goal_target_amount) * 100) // Convert to paise
          : null,
      };

      const { error } = await supabase
        .from('money_jars')
        .update(jarDataToSave)
        .eq('id', jarId);

      if (error) throw error;

      toast.success('Money jar updated successfully');
      router.push('/money_jars');
    } catch (err) {
      console.error('Error updating money jar:', err);
      setError(err instanceof Error ? err.message : 'Failed to update money jar');
      toast.error(err instanceof Error ? err.message : 'Failed to update money jar');
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
          <p className="mt-4 text-slate-500">Loading money jar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading money jar</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => router.push('/money_jars')}>
            Back to Money Jars
          </Button>
        </div>
      </div>
    );
  }

  if (!jar) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Money Jar Not Found</h2>
          <p className="text-slate-600">
            The money jar you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => router.push('/money_jars')}>
            Back to Money Jars
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
              Edit Money Jar
            </h1>
            <p className="text-slate-600">
              Update the details of this money jar
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/money_jars')}
            >
              Back to Money Jars
            </Button>
          </div>
        </div>
      </div>

      {/* Money Jar Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateJar();
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jar For</label>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                  {jar.family_members?.display_name?.charAt(0) ?? '?'}
                </div>
                <span className="text-slate-500">{jar.family_members?.display_name}</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Jar Type</label>
              <Select
                value={jar.jar_type}
                disabled
                options={[
                  { value: 'save', label: 'Save' },
                  { value: 'spend', label: 'Spend' },
                  { value: 'give', label: 'Give' },
                  { value: 'invest', label: 'Invest' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Percentage (%) *</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.target_percentage}
                onValueChange={(val) => setFormData(prev => ({ ...prev, target_percentage: val }))}
                placeholder="0-100"
                required
                className="w-full"
              />
              <p className="mt-1 text-xs text-slate-500">
                Percentage of income to allocate to this jar
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Current Amount (₹) *</label>
              <div className="flex items-center">
                <span className="text-slate-500 mr-2">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.current_amount}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, current_amount: val }))}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Name (Optional)</label>
              <Input
                type="text"
                value={formData.goal_name}
                onValueChange={(val) => setFormData(prev => ({ ...prev, goal_name: val }))}
                placeholder="Enter goal name (e.g., Vacation, Emergency Fund)"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Goal Target Amount (₹) (Optional)</label>
              <div className="flex items-center">
                <span className="text-slate-500 mr-2">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.goal_target_amount}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, goal_target_amount: val }))}
                  placeholder="0.00"
                  className="w-full"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Enter target amount in rupees (leave blank for no target)
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Money Jar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}