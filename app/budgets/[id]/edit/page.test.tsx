import { render, screen } from '@testing-library/react';
import EditBudgetPage from '../app/budgets/[id]/edit/page';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
    },
    from: jest.fn().mockImplementation((table) => {
      if (table === 'family_members') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { family_id: 'test-family-id' }, error: null })
        };
      }
      if (table === 'budgets') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { 
              id: 'test-budget-id', 
              category: 'Groceries', 
              amount: 50000, // 500.00 in paise
              period: 'monthly',
              start_date: '2024-01-01',
              end_date: '2024-01-31'
            }, 
            error: null 
          }),
          update: jest.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        update: jest.fn().mockResolvedValue({ data: [], error: new Error('Not found') })
      };
    })
  }
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}));

// Mock useRouter and useParams from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn()
  }),
  useParams: () => ({ id: 'test-budget-id' }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams()
}));

describe('EditBudgetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the edit budget page header', async () => {
    render(<EditBudgetPage />);
    
    // Check for loading state initially
    expect(await screen.findByText(/Loading budget.../i)).toBeInTheDocument();
    
    // After loading, should see the form with pre-filled values
    expect(await screen.findByText(/Edit Budget/i)).toBeInTheDocument();
    
    // Check that form fields are pre-filled with the budget data
    expect(await screen.findByLabelText(/Category/i)).toHaveValue('Groceries');
    expect(await screen.findByLabelText(/Amount (₹)/i)).toHaveValue('500.00'); // 50000 paise = 500.00
    expect(await screen.findByLabelText(/Period/i)).toHaveValue('monthly');
    expect(await screen.findByLabelText(/Start Date/i)).toHaveValue('2024-01-01');
    expect(await screen.findByLabelText(/End Date (Optional)/i)).toHaveValue('2024-01-31');
  });

  it('should handle error when budget not found', async () => {
    // Override the mock to simulate budget not found
    require('@/lib/supabase/client').supabase.from.mockImplementation((table) => {
      if (table === 'family_members') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { family_id: 'test-family-id' }, error: null })
        };
      }
      if (table === 'budgets') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Budget not found') }),
          update: jest.fn().mockResolvedValue({ data: [], error: new Error('Budget not found') })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        update: jest.fn().mockResolvedValue({ data: [], error: new Error('Not found') })
      };
    });

    render(<EditBudgetPage />);
    
    // Check for loading state
    expect(await screen.findByText(/Loading budget.../i)).toBeInTheDocument();
    
    // Should show error or redirect (in our implementation, we show "Budget Not Found" message)
    expect(await screen.findByText(/Budget Not Found/i)).toBeInTheDocument();
  });

  it('should handle form submission and update budget', async () => {
    render(<EditBudgetPage />);
    
    // Wait for loading to finish and form to be populated
    await screen.findByText(/Edit Budget/i);
    
    // Fill out the form with new values
    await screen.findByLabelText(/Category/i).clear();
    await screen.findByLabelText(/Category/i).type('Utilities');
    
    await screen.findByLabelText(/Amount (₹)/i).clear();
    await screen.findByLabelText(/Amount (₹)/i).type('75.00'); // 7500 paise
    
    await screen.findByLabelText(/Period/i).click();
    await screen.findByText(/Yearly/i).click();
    
    await screen.findByLabelText(/Start Date/i).clear();
    await screen.findByLabelText(/Start Date/i).type('2024-01-01');
    
    await screen.findByLabelText(/End Date (Optional)/i).clear();
    await screen.findByLabelText(/End Date (Optional)/i).type('2024-12-31');
    
    // Submit the form
    await screen.findByRole('button', { name: /Update Budget/i }).click();
    
    // Verify that the update method was called with correct data
    const supabaseMock = require('@/lib/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('budgets');
    expect(supabaseMock.from().update).toHaveBeenCalled();
    
    // Verify success toast was shown
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Budget updated successfully');
    
    // Verify redirect to budgets page
    const routerMock = require('next/navigation').useRouter();
    expect(routerMock.push).toHaveBeenCalledWith('/budgets');
  });
});