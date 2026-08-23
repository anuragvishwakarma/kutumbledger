'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function EditFestivalPlanPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const planId = params.id;
  
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    festival_name: '',
    year: '',
    total_budget: '',
    categories_json: '',
    start_saving_month: '',
    actual_spending: '',
  });

  useEffect(() => {
    if (planId) {
      fetchPlan();
    }
  }, [planId]);

  const fetchPlan = async () => {
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
        .eq('id', planId)
        .eq('family_id', memberData.family_id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Festival plan not found or access denied');

      setPlan(data);
      setFormData({
        festival_name: data.festival_name,
        year: data.year.toString(),
        total_budget: (data.total_budget / 100).toString(),
        categories_json: JSON.stringify(data.categories_json, null, 2),
        start_saving_month: data.start_saving_month ? data.start_saving_month.toString() : '',
        actual_spending: JSON.stringify(data.actual_spending, null, 2),
      });
    } catch (err) {
      console.error('Error fetching festival plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load festival plan');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify ownership before updating
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (memberError) throw memberError;

      const planDataToSave = {
        ...formData,
        total_budget: Math.round(parseFloat(formData.total_budget) * 100), // Convert to paise
        year: parseInt(formData.year, 10),
        categories_json: formData.categories_json ? JSON.parse(formData.categories_json) : {},
        start_saving_month: formData.start_saving_month ? parseInt(formData.start_saving_month, 10) : null,
        actual_spending: formData.actual_spending ? JSON.parse(formData.actual_spending) : {},
      };

      const { error } = await supabase
        .from('festival_plans')
        .update(planDataToSave)
        .eq('id', planId);

      if (error) throw error;

      toast.success('Festival plan updated successfully');
      router.push('/festival_plans');
    } catch (err) {
      console.error('Error updating festival plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to update festival plan');
      toast.error(err instanceof Error ? err.message : 'Failed to update festival plan');
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
          <p className="mt-4 text-slate-500">Loading festival plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
          <h3 className="text-red-900 font-medium mb-2">Error loading festival plan</h3>
          <p className="text-red-700">{error}</p>
          <Button variant="outline" onClick={() => router.push('/festival_plans')}>
            Back to Festival Plans
          </Button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Festival Plan Not Found</h2>
          <p className="text-slate-600">
            The festival plan you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => router.push('/festival_plans')}>
            Back to Festival Plans
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
              Edit Festival Plan
            </h1>
            <p className="text-slate-600">
              Update the details of this festival plan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => router.push('/festival_plans')}
            >
              Back to Festival Plans
            </Button>
          </div>
        </div>
      </div>

      {/* Festival Plan Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdatePlan();
        }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Festival Name *</label>
              <Input
                type="text"
                value={formData.festival_name}
                onValueChange={(val) => setFormData(prev => ({ ...prev, festival_name: val }))}
                placeholder="Enter festival name (e.g., Diwali, Christmas)"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Year *</label>
              <Input
                type="number"
                min="2000"
                max="2100"
                value={formData.year}
                onValueChange={(val) => setFormData(prev => ({ ...prev, year: val }))}
                placeholder="2024"
                required
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget (₹) *</label>
            <div className="flex items-center">
              <span className="text-slate-500 mr-2">₹</span>
              <Input
                type="number"
                step="0.01"
                value={formData.total_budget}
                onValueChange={(val) => setFormData(prev => ({ ...prev, total_budget: val }))}
                placeholder="0.00"
                required
                className="w-full"
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Enter total budget in rupees (will be converted to paise for storage)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Saving Month (Optional)</label>
              <Select
                value={formData.start_saving_month}
                onValueChange={(val) => setFormData(prev => ({ ...prev, start_saving_month: val }))}
                options={[
                  { value: '1', label: 'January' },
                  { value: '2', label: 'February' },
                  { value: '3', label: 'March' },
                  { value: '4', label: 'April' },
                  { value: '5', label: 'May' },
                  { value: '6', label: 'June' },
                  { value: '7', label: 'July' },
                  { value: '8', label: 'August' },
                  { value: '9', label: 'September' },
                  { value: '10', label: 'October' },
                  { value: '11', label: 'November' },
                  { value: '12', label: 'December' },
                ]}
                placeholder="Select month to start saving"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Categories JSON (Optional)</label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Provide a sample JSON structure
                  const sample = {
                    food: 0,
                    decorations: 0,
                    gifts: 0,
                    travel: 0,
                    entertainment: 0,
                    other: 0
                  };
                  setFormData(prev => ({ ...prev, categories_json: JSON.stringify(sample, null, 2) }));
                }}
              >
                Load Sample
              </Button>
            </div>
            <textarea
              value={formData.categories_json}
              onChange={(e) => setFormData(prev => ({ ...prev, categories_json: e.target.value }))}
              placeholder='{\n  "food": 0,\n  "decorations": 0,\n  "gifts": 0,\n  ...\n}'
              className="w-full min-h-[100px] border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={saving}
            />
            <p className="mt-1 text-xs text-slate-500">
              JSON object mapping categories to budgeted amounts (in rupees)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Actual Spending JSON (Optional)</label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Provide a sample JSON structure
                  const sample = {
                    food: 0,
                    decorations: 0,
                    gifts: 0,
                    travel: 0,
                    entertainment: 0,
                    other: 0
                  };
                  setFormData(prev => ({ ...prev, actual_spending: JSON.stringify(sample, null, 2) }));
                }}
              >
                Load Sample
              </Button>
            </div>
            <textarea
              value={formData.actual_spending}
              onChange={(e) => setFormData(prev => ({ ...prev, actual_spending: e.target.value }))}
              placeholder='{\n  "food": 0,\n  "decorations": 0,\n  "gifts": 0,\n  ...\n}'
              className="w-full min-h-[100px] border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={saving}
            />
            <p className="mt-1 text-xs text-slate-500">
              JSON object mapping categories to actual spent amounts (in rupees)
            </p>
          </div>

          <div className="mt-8 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Festival Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}