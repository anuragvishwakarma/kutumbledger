'use client';

import { useState, useEffect } from 'react';
import { Link } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Recharts imports
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Dot,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ReportsPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date ranges
  const [dateRange, setDateRange] = useState('month'); // month, quarter, year
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const initializeDateRange = () => {
      const now = new Date();
      setEndDate(now.toISOString().split('T')[0]);
      
      if (dateRange === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        setStartDate(start.toISOString().split('T')[0]);
      } else if (dateRange === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        const start = new Date(now.getFullYear(), quarter * 3, 1);
        setStartDate(start.toISOString().split('T')[0]);
      } else if (dateRange === 'year') {
        const start = new Date(now.getFullYear(), 0, 1);
        setStartDate(start.toISOString().split('T')[0]);
      }
    };

    initializeDateRange();
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
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
      const familyId = memberData.family_id;

      // Fetch transactions for date range
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('family_id', familyId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (txError) throw txError;
      setTransactions(txData || []);

      // Fetch budgets
      const { data: budgetData, error: budgetError } = await supabase
        .from('budgets')
        .select('*')
        .eq('family_id', familyId);

      if (budgetError) throw budgetError;
      setBudgets(budgetData || []);

      // Fetch goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('family_id', familyId);

      if (goalsError) throw goalsError;
      setGoals(goalsData || []);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (value: string) => {
    setDateRange(value);
  };

  // Helper functions for data processing
  const getMonthlyData = () => {
    const monthlyData = {
      income: Array(12).fill(0),
      expense: Array(12).fill(0),
    };

    transactions.forEach((tx: any) => {
      const date = new Date(tx.date);
      const monthIndex = date.getMonth(); // 0-11
      const amount = tx.amount / 100; // Convert from paise

      if (tx.type === 'income') {
        monthlyData.income[monthIndex] += amount;
      } else if (tx.type === 'expense') {
        monthlyData.expense[monthIndex] += amount;
      }
    });

    return monthlyData;
  };

  const getCategoryExpenseData = () => {
    const categoryMap: Record<string, number> = {};

    transactions
      .filter((tx: any) => tx.type === 'expense')
      .forEach((tx: any) => {
        const category = tx.category || 'Uncategorized';
        const amount = tx.amount / 100;
        categoryMap[category] = (categoryMap[category] || 0) + amount;
      });

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  const getBudgetUtilization = () => {
    return budgets.map((budget: any) => {
      const spent = transactions
        .filter(
          (tx: any) =>
            tx.type === 'expense' &&
            tx.category === budget.category &&
            tx.date >= budget.start_date &&
            tx.date <= (budget.end_date || '2100-12-31')
        )
        .reduce((sum: number, tx: any) => sum + tx.amount / 100, 0);

      const budgetAmount = budget.amount / 100;
      const utilization = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;

      return {
        category: budget.category,
        budget: budgetAmount,
        spent,
        utilization,
      };
    });
  };

  const getGoalsProgress = () => {
    return goals.map((goal: any) => ({
      name: goal.name,
      target: goal.target_amount / 100,
      current: goal.current_amount / 100,
      progress:
        goal.target_amount > 0
          ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
          : 0,
    }));
  };

  const getSummaryStats = () => {
    const totalIncome = transactions
      .filter((tx: any) => tx.type === 'income')
      .reduce((sum: number, tx: any) => sum + tx.amount / 100, 0);

    const totalExpense = transactions
      .filter((tx: any) => tx.type === 'expense')
      .reduce((sum: number, tx: any) => sum + tx.amount / 100, 0);

    const netSavings = totalIncome - totalExpense;

    const activeGoals = goals.filter((g: any) => g.current_amount < g.target_amount).length;
    const completedGoals = goals.filter((g: any) => g.current_amount >= g.target_amount).length;

    return {
      totalIncome,
      totalExpense,
      netSavings,
      activeGoals,
      completedGoals,
      totalTransactions: transactions.length,
    };
  };

  if (loading) {
    return (
      <div className=\"min-h-[calc(100vh-4rem)] p-6\">
        <div className=\"text-center py-12\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-primary\"></div>
          <p className=\"mt-4 text-slate-500\">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"min-h-[calc(100vh-4rem)] p-6\">
        <div className=\"bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6\">
          <h3 className=\"text-red-900 font-medium mb-2\">Error loading reports</h3>
          <p className=\"text-red-700\">{error}</p>
          <Button variant=\"outline\" onClick={() => fetchAllData()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const monthlyData = getMonthlyData();
  const categoryExpenseData = getCategoryExpenseData();
  const budgetUtilization = getBudgetUtilization();
  const goalsProgress = getGoalsProgress();
  const summaryStats = getSummaryStats();

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return (
    <div className=\"min-h-[calc(100vh-4rem)] p-6\">
      {/* Page Header */}
      <div className=\"mb-8\">
        <div className=\"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4\">
          <div>
            <h1 className=\"text-2xl font-bold text-slate-900 mb-2\">Financial Reports</h1>
            <p className=\"text-slate-600\">Overview of your family's financial health</p>
          </div>
          <div className=\"flex items-center space-x-4\">
            <div className=\"relative\">
              <Button variant=\"outline\" onClick={() => setDateRange('month')}>
                Month
              </Button>
              <Button variant=\"outline\" onClick={() => setDateRange('quarter')}>
                Quarter
              </Button>
              <Button variant=\"outline\" onClick={() => setDateRange('year')}>
                Year
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8\">
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h3 className=\"text-lg font-medium text-slate-900 mb-2\">Total Income</h3>
          <p className=\"text-2xl font-bold text-emerald-600\">
            {summaryStats.totalIncome.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </p>
          <p className=\"text-sm text-slate-500\">This {dateRange}</p>
        </div>
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h3 className=\"text-lg font-medium text-slate-900 mb-2\">Total Expense</h3>
          <p className=\"text-2xl font-bold text-red-600\">
            {summaryStats.totalExpense.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </p>
          <p className=\"text-sm text-slate-500\">This {dateRange}</p>
        </div>
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h3 className=\"text-lg font-medium text-slate-900 mb-2\">Net Savings</h3>
          <p className=\"text-2xl font-bold\">
            {summaryStats.netSavings >= 0 ? 'text-green-600' : 'text-red-600'}
          </p>
          <p className=\"text-2xl font-bold\">
            {summaryStats.netSavings.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
            })}
          </p>
          <p className=\"text-sm text-slate-500\">This {dateRange}</p>
        </div>
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h3 className=\"text-lg font-medium text-slate-900 mb-2\">Goals Progress</h3>
          <p className=\"text-2xl font-bold text-blue-600\">
            {summaryStats.completedGoals}/{summaryStats.activeGoals + summaryStats.completedGoals}
          </p>
          <p className=\"text-sm text-slate-500\">Completed/Active</p>
        </div>
      </div>

      {/* Charts */}
      <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">
        {/* Income vs Expense Trend */}
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h2 className=\"text-xl font-bold text-slate-900 mb-4\">Income vs Expense Trend</h2>
          <ResponsiveContainer width=\"100%\" height={300}>
            <LineChart
              data={months.map((month, index) => ({
                month,
                income: monthlyData.income[index],
                expense: monthlyData.expense[index],
              }))}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray=\"3 3\" />
              <XAxis dataKey=\"month\" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend verticalAlign=\"top\" height={36} />
              <Line type=\"monotone\" dataKey=\"income\" stroke=\"#10B981\" strokeWidth={2} dot={{ r: 4 }} />
              <Line type=\"monotone\" dataKey=\"expense\" stroke=\"#EF4444\" strokeWidth={2} dot={{ r: 4 }} />
              <Dot type=\"monotone\" dataKey=\"income\" r={6} fill=\"#10B981\" />
              <Dot type=\"monotone\" dataKey=\"expense\" r={6} fill=\"#EF4444\" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense by Category */}
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h2 className=\"text-xl font-bold text-slate-900 mb-4\">Expense by Category</h2>
          <ResponsiveContainer width=\"100%\" height={300}>
            <PieChart>
              <Pie
                data={categoryExpenseData.slice(0, 6)} // Top 6 categories
                dataKey=\"amount\"
                nameKey=\"category\"
                cx=\"50%\"
                cy=\"50%\"
                innerRadius={60}
                outerRadius={120}
                labelLine={{ show: false }}
                label={{ position: 'inside', fill: '#fff', fontSize: 12 }}
              >
                {categoryExpenseData.slice(0, 6).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Budget Utilization */}
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h2 className=\"text-xl font-bold text-slate-900 mb-4\">Budget Utilization</h2>
          <ResponsiveContainer width=\"100%\" height={300}>
            <BarChart
              data={budgetUtilization}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray=\"3 3\" />
              <XAxis dataKey=\"category\" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend verticalAlign=\"top\" height={36} />
              <Bar dataKey=\"budget\" fill=\"#E5E7EB\" radius={[6, 6, 0, 0]} />
              <Bar
                dataKey=\"spent\"
                fill=\"#3B82F6\"
                radius={[6, 6, 0, 0]}
                label={{ position: 'insideBottom', fill: '#fff', fontSize: 12 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Progress */}
        <div className=\"bg-white rounded-xl p-6 shadow-sm border\">
          <h2 className=\"text-xl font-bold text-slate-900 mb-4\">Goals Progress</h2>
          <div className=\"space-y-4\">
            {goalsProgress.map((goal, index) => (
              <div key={index} className=\"flex items-center space-x-4\">
                <div className=\"w-10 h-10 rounded-full flex items-center justify-center bg-blue-50\">
                  <span className=\"text-xs font-medium text-blue-600\">
                    {index + 1}
                  </span>
                </div>
                <div className=\"flex-1\">
                  <h3 className=\"font-medium text-slate-900\">{goal.name}</h3>
                  <div className=\"flex items-center mt-1\">
                    <div className=\"w-24 h-2 bg-slate-200 rounded-full relative flex-1\">
                      <div
                        className=\"h-full bg-green-500 rounded-full\"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <span className=\"ml-2 text-xs text-slate-500\">
                      {goal.progress.toFixed(1)}%
                    </span>
                  </div>
                  <p className=\"text-sm text-slate-500 mt-1\">
                    {goal.current.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })} / {goal.target.toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className=\"bg-white rounded-xl p-6 shadow-sm border mt-8\">
        <h2 className=\"text-xl font-bold text-slate-900 mb-4\">Recent Transactions</h2>
        <div className=\"overflow-x-auto\">
          <table className=\"min-w-full divide-y divide-slate-200\">
            <thead>
              <tr className=\"bg-slate-50\">
                <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">
                  Date
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">
                  Description
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">
                  Category
                </th>
                <th className=\"px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider\">
                  Type
                </th>
                <th className=\"px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider\">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody className=\"divide-y divide-slate-200\">
              {transactions
                .slice(0, 10)
                .map((tx: any, index) => (
                  <tr key={index} className=\"hover:bg-slate-50\">
                    <td className=\"px-6 py-4 text-sm text-slate-700\">
                      {new Date(tx.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className=\"px-6 py-4 text-sm text-slate-700\">
                      {tx.description || 'No description'}
                    </td>
                    <td className=\"px-6 py-4 text-sm text-slate-700\">
                      {tx.category || 'Uncategorized'}
                    </td>
                    <td className=\"px-6 py-4 text-sm\">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'income'
                            ? 'text-emerald-600 bg-emerald-50'
                            : tx.type === 'expense'
                            ? 'text-red-600 bg-red-50'
                            : 'text-blue-600 bg-blue-50'
                        }`}
                      >
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className=\"px-6 py-4 text-sm text-right text-slate-700 font-medium\">
                      {(tx.amount / 100).toLocaleString('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                      })}
                    </td>
                  </tr>
                ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className=\"px-6 py-4 text-center text-slate-500\">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {transactions.length > 10 && (
          <div className=\"mt-4 text-right\">
            <Button variant=\"outline\" size=\"sm\" onClick={() => {}}>
              View All Transactions
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}