import { render, screen } from '@testing-library/react';
import BudgetsPage from '../app/budgets/page';

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

describe('BudgetsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the budgets page header', async () => {
    render(<BudgetsPage />);
    
    // Check for loading state initially
    expect(await screen.findByText(/Loading budgets.../i)).toBeInTheDocument();
    
    // Since we're mocking the data to return an empty array (because we didn't mock the second call to get the actual budgets),
    // we expect to see the "No budgets found" message.
    expect(await screen.findByText(/No budgets found/i)).toBeInTheDocument();
  });

  it('should handle error state', async () => {
    // Override the mock to simulate an error on the first call (getting family_id)
    require('@/lib/supabase/client').supabase.from.mockReturnValueOnce({
      select: () => ({
        eq: () => ({
          single: () => ({
            resolve: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
          })
        })
      })
    });

    render(<BudgetsPage />);
    
    // Check for loading state
    expect(await screen.findByText(/Loading budgets.../i)).toBeInTheDocument();
    
    // Check for error state
    expect(await screen.findByText(/Error loading budgets/i)).toBeInTheDocument();
    expect(await screen.findByText(/Database error/i)).toBeInTheDocument();
  });
});