import { render, screen } from '@testing-library/react';
import CreateBudgetPage from '../app/budgets/new/page';

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({
            resolve: jest.fn().mockResolvedValue({ data: { family_id: 'test-family-id' }, error: null })
          })
        })
      })
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

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn()
  })
}));

describe('CreateBudgetPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the create budget page header', async () => {
    render(<CreateBudgetPage />);
    
    expect(await screen.findByText(/Add New Budget/i)).toBeInTheDocument();
    expect(await screen.findByText(/Set a new budget for a specific category/i)).toBeInTheDocument();
  });

  it('should handle form submission and create budget', async () => {
    render(<CreateBudgetPage />);
    
    // Fill out the form
    await screen.findByLabelText(/Category/i).type('Groceries');
    await screen.findByLabelText(/Amount (₹)/i).type('500.00'); // 50000 paise
    await screen.findByLabelText(/Period/i).click();
    await screen.findByText(/Monthly/i).click();
    await screen.findByLabelText(/Start Date/i).type('2024-01-01');
    await screen.findByLabelText(/End Date (Optional)/i).type('2024-01-31');
    
    // Submit the form
    await screen.findByRole('button', { name: /Create Budget/i }).click();
    
    // Verify that the insert method was called with correct data
    const supabaseMock = require('@/lib/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('budgets');
    expect(supabaseMock.from().insert).toHaveBeenCalled();
    
    // Verify success toast was shown
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Budget created successfully');
    
    // Verify redirect to budgets page
    const routerMock = require('next/navigation').useRouter();
    expect(routerMock.push).toHaveBeenCalledWith('/budgets');
  });

  it('should handle error state', async () => {
    // Override the mock to simulate an error on the insert call
    require('@/lib/supabase/client').supabase.from.mockImplementation(() => {
      return {
        insert: jest.fn().mockResolvedValue({ error: new Error('Database error') })
      };
    });

    render(<CreateBudgetPage />);
    
    // Fill out the form
    await screen.findByLabelText(/Category/i).type('Groceries');
    await screen.findByLabelText(/Amount (₹)/i).type('500.00');
    await screen.findByLabelText(/Period/i).click();
    await screen.findByText(/Monthly/i).click();
    await screen.findByLabelText(/Start Date/i).type('2024-01-01');
    await screen.findByLabelText(/End Date (Optional)/i).type('2024-01-31');
    
    // Submit the form
    await screen.findByRole('button', { name: /Create Budget/i }).click();
    
    // Verify error toast was shown
    expect(require('sonner').toast.error).toHaveBeenCalledWith('Failed to create budget: Database error');
  });
});