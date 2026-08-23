import { getMonthlyData, getCategoryExpenseData, getBudgetUtilization, getGoalsProgress, getSummaryStats } from './page';

// Mock data for testing
const mockTransactions = [
  {
    id: '1',
    type: 'expense' as const,
    amount: 1000, // 10.00 INR
    category: 'Groceries',
    description: 'Weekly shopping',
    date: '2026-08-15',
    payment_method: 'upi',
    is_recurring: false,
    family_id: 'test-family-id',
    member_id: 'test-member-id',
  },
  {
    id: '2',
    type: 'income' as const,
    amount: 5000, // 50.00 INR
    category: 'Salary',
    description: 'Monthly salary',
    date: '2026-08-01',
    payment_method: 'bank',
    is_recurring: false,
    family_id: 'test-family-id',
    member_id: 'test-member-id',
  },
  {
    id: '3',
    type: 'expense' as const,
    amount: 2000, // 20.00 INR
    category: 'Utilities',
    description: 'Electricity bill',
    date: '2026-08-10',
    payment_method: 'bank',
    is_recurring: false,
    family_id: 'test-family-id',
    member_id: 'test-member-id',
  }
];

const mockBudgets = [
  {
    id: 'b1',
    category: 'Groceries',
    amount: 5000, // 50.00 INR
    period: 'monthly',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    family_id: 'test-family-id',
  },
  {
    id: 'b2',
    category: 'Utilities',
    amount: 3000, // 30.00 INR
    period: 'monthly',
    start_date: '2026-08-01',
    end_date: '2026-08-31',
    family_id: 'test-family-id',
  }
];

const mockGoals = [
  {
    id: 'g1',
    name: 'Vacation Fund',
    target_amount: 10000, // 100.00 INR
    current_amount: 2500, // 25.00 INR
    target_date: '2026-12-31',
    family_id: 'test-family-id',
  },
  {
    id: 'g2',
    name: 'Emergency Fund',
    target_amount: 20000, // 200.00 INR
    current_amount: 20000, // 200.00 INR (completed)
    target_date: '2026-06-30',
    family_id: 'test-family-id',
  }
];

describe('Reports Page Helper Functions', () => {
  describe('getMonthlyData', () => {
    it('should aggregate income and expenses by month', () => {
      const result = getMonthlyData(mockTransactions);
      
      // August is month 7 (0-indexed)
      expect(result.income[7]).toBe(50); // 5000 paise = 50.00 INR
      expect(result.expense[7]).toBe(30); // (1000 + 2000) paise = 30.00 INR
      // Other months should be 0
      expect(result.income.filter((v, i) => i !== 7).every(v => v === 0)).toBe(true);
      expect(result.expense.filter((v, i) => i !== 7).every(v => v === 0)).toBe(true);
    });
  });

  describe('getCategoryExpenseData', () => {
    it('should group expenses by category and sum amounts', () => {
      const result = getCategoryExpenseData(mockTransactions);
      
      // Should have two categories: Groceries and Utilities
      expect(result.length).toBe(2);
      
      const groceries = result.find(item => item.category === 'Groceries');
      const utilities = result.find(item => item.category === 'Utilities');
      
      expect(groceries?.amount).toBe(10); // 1000 paise = 10.00 INR
      expect(utilities?.amount).toBe(20); // 2000 paise = 20.00 INR
    });
  });

  describe('getBudgetUtilization', () => {
    it('should calculate budget utilization percentage', () => {
      const result = getBudgetUtilization(mockBudgets, mockTransactions);
      
      // Groceries: spent 1000 of 5000 = 20%
      // Utilities: spent 2000 of 3000 = 66.67%
      expect(result.length).toBe(2);
      
      const groceries = result.find(item => item.category === 'Groceries');
      const utilities = result.find(item => item.category === 'Utilities');
      
      expect(groceries?.spent).toBe(10); // 1000 paise = 10.00 INR
      expect(groceries?.budget).toBe(50); // 5000 paise = 50.00 INR
      expect(groceries?.utilization).toBeCloseTo(20);
      
      expect(utilities?.spent).toBe(20); // 2000 paise = 20.00 INR
      expect(utilities?.budget).toBe(30); // 3000 paise = 30.00 INR
      expect(utilities?.utilization).toBeCloseTo(66.67);
    });
  });

  describe('getGoalsProgress', () => {
    it('should calculate goal progress percentage', () => {
      const result = getGoalsProgress(mockGoals);
      
      expect(result.length).toBe(2);
      
      const vacation = result.find(item => item.name === 'Vacation Fund');
      const emergency = result.find(item => item.name === 'Emergency Fund');
      
      expect(vacation?.target).toBe(100); // 10000 paise = 100.00 INR
      expect(vacation?.current).toBe(25); // 2500 paise = 25.00 INR
      expect(vacation?.progress).toBe(25);
      
      expect(emergency?.target).toBe(200); // 20000 paise = 200.00 INR
      expect(emergency?.current).toBe(200); // 20000 paise = 200.00 INR
      expect(emergency?.progress).toBe(100);
    });
  });

  describe('getSummaryStats', () => {
    it('should calculate summary statistics', () => {
      const result = getSummaryStats(mockTransactions, mockBudgets, mockGoals);
      
      expect(result.totalIncome).toBe(50); // 5000 paise
      expect(result.totalExpense).toBe(30); // 3000 paise
      expect(result.netSavings).toBe(20); // 2000 paise
      expect(result.activeGoals).toBe(1); // Vacation fund is active
      expect(result.completedGoals).toBe(1); // Emergency fund is completed
      expect(result.totalTransactions).toBe(3);
    });
  });
});