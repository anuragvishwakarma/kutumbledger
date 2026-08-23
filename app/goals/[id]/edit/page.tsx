'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DatePicker } from '@/components/ui/DatePicker';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EditGoalPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const goalId = params.id;
  
  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    target_date: '',
  });

  useEffect(() => {
    if (goalId) {
      fetchGoal();
    }
  }, [goalId]);

  const fetchGoal = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', goalId)
        .eq('family_id', (await supabase.from('family_members').select('family_id').eq('user_id', user.id).single()).data.family_id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Goal not found or access denied');

      // Convert amount from paise to rupees for form
      setGoal(data);
      setFormData({
        name: data.name,
        target_amount: (data.target_amount / 100).toString(),
        target_date: data.target_date || '',
      });
    } catch (err) {
      console.error('Error fetching goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to load goal');
      setGoal(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGoal = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify ownership before updating
      const { data: existingData, error: fetchError } = await supabase
        .from('goals')
        .select('id')
        .eq('id', goalId)
        .eq('family_id', (await supabase.from('family_members').select('family_id').eq('user_id', user.id).single()).data.family_id);

      if (fetchError) throw fetchError;
      if (!existingData) throw new Error('Goal not found or access denied');

      const goalDataToSave = {
        ...formData,
        target_amount: Math.round(parseFloat(formData.target_amount) * 100), // Convert to paise
        target_date: formData.target_date || null,
      };

      const { error } = await supabase
        .from('goals')
        .update(goalDataToSave)
        .eq('id', goalId);

      if (error) throw error;

      toast.success('Goal updated successfully');
      router.push('/goals');
    } catch (err) {
      console.error('Error updating goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      toast.error(err instanceof Error ? err.message : 'Failed to update goal');
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
          <p className="mt-4 text-slate-500">Loading goal...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading goal</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => router.push('/goals')}>
            Back to Goals
          </Button>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Goal Not Found</h2>
          <p className="text-slate-600">
            The goal you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => router.push('/goals')}>
            Back to Goals
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
              Edit Goal
            </h1>
            <p className="text-slate-600">
              Update the details of this goal
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/goals')}
            >
              Back to Goals
            </Button>
          </div>
        </div>
      </div>

      {/* Goal Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdateGoal();
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
              <Input
                type="text"
                value={formData.name}
                onValueChange={(val) => setFormData(prev => ({ ...prev, name: val }))}
                placeholder="Enter goal name"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Amount (₹) *</label>
              <div className="flex items-center">
                <span className="text-slate-500 mr-2">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.target_amount}
                  onValueChange={(val) => setFormData(prev => ({ ...prev, target_amount: val }))}
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Target Date (Optional)</label>
            <DatePicker
              value={formData.target_date}
              onValueChange={(val) => setFormData(prev => ({ ...prev, target_date: val }))}
              placeholder="Select target date (leave blank for no target date)"
            />
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Goal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}