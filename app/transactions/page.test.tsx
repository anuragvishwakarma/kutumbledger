import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TransactionsPage from '../transactions/page';

// Mock Supabase
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: () => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    }),
  },
}));

const { supabase } = require('@/lib/supabase/client');

describe('TransactionsPage', () => {
  const mockUser = { id: 'test-user-id' };
  const mockMemberData = { id: 'test-member-id', family_id: 'test-family-id' };
  const mockTransactions = [
    {
      id: 'tx1',
      type: 'expense',
      amount: 1000, // 10.00 INR in paise
      category: 'Groceries',
      description: 'Weekly shopping',
      date: '2026-08-20',
      payment_method: 'upi',
      is_recurring: false,
      family_id: 'test-family-id',
      member_id: 'test-member-id',
      created_at: '2026-08-20T10:00:00Z',
    },
    {
      id: 'tx2',
      type: 'income',
      amount: 5000, // 50.00 INR in paise
      category: 'Salary',
      description: 'Monthly salary',
      date: '2026-08-01',
      payment_method: 'bank',
      is_recurring: false,
      family_id: 'test-family-id',
      member_id: 'test-member-id',
      created_at: '2026-08-01T09:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock auth user
    supabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    // Mock family member lookup
    supabase.from().eq().single.mockResolvedValueOnce({
      data: mockMemberData,
      error: null,
    });
    // Mock transactions fetch
    supabase.from().eq().order.mockResolvedValueOnce({
      data: mockTransactions,
      error: null,
    });
  });

  it('displays loading state initially', async () => {
    // Override mock to simulate loading delay
    supabase.from().eq().order.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ data: mockTransactions, error: null });
        }, 10);
      });
    });

    render(<TransactionsPage />);

    // Should show loading spinner
    expect(screen.getByRole('status')).toHaveText('Loading transactions...');
  });

  it('renders transactions list when data is loaded', async () => {
    render(<TransactionsPage />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Weekly shopping')).toBeInTheDocument();
      expect(screen.getByText('Monthly salary')).toBeInTheDocument();
    });

    // Check transaction cards
    const transactionCards = screen.getAllByRole('region');
    expect(transactionCards).toHaveLength(2);

    // Check amounts are displayed correctly (converted from paise)
    expect(screen.getByText('₹10.00')).toBeInTheDocument();
    expect(screen.getByText('₹50.00')).toBeInTheDocument();

    // Check transaction types
    expect(screen.getByText('EXPENSE')).toBeInTheDocument();
    expect(screen.getByText('INCOME')).toBeInTheDocument();
  });

  it('filters transactions by type', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Weekly shopping')).toBeInTheDocument();
    });

    // Click expense filter
    const expenseOption = screen.getByLabelText('Type').closest('div');
    await userEvent.selectOptions(screen.getByLabelText('Type'), 'expense');

    // Should only show expense transaction
    await waitFor(() => {
      expect(screen.getByText('Weekly shopping')).toBeInTheDocument();
      expect(screen.queryByText('Monthly salary')).not.toBeInTheDocument();
    });
  });

  it('shows create transaction modal', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Add New Transaction')).toBeInTheDocument();
    });

    // Click add transaction button
    const addButton = screen.getByRole('link', { name: /Add New Transaction/i });
    await userEvent.click(addButton);

    // Should show modal
    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount (₹)')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock error in transactions fetch
    supabase.from().eq().order.mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });

    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Error loading transactions')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('deletes transaction with confirmation', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Weekly shopping')).toBeInTheDocument();
    });

    // Mock delete response
    supabase.from().delete().eq().mockResolvedValueOnce({
      error: null,
    });

    // Click delete button on first transaction
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    // Should show confirmation dialog (browser alert)
    // Note: jsdom doesn't actually show alerts, but we can verify the delete was called
    await waitFor(() => {
      expect(supabase.from().delete().eq).toHaveBeenCalledWith('id', 'tx1');
    });
  });
});