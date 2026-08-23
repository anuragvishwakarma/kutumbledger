import { render, screen } from '@testing-library/react';
import CreateGoalPage from '../app/goals/new/page';

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

describe('CreateGoalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the create goal page header', async () => {
    render(<CreateGoalPage />);
    
    expect(await screen.findByText(/Add New Goal/i)).toBeInTheDocument();
    expect(await screen.findByText(/Track your family's financial goals/i)).toBeInTheDocument();
  });

  it('should handle form submission and create goal', async () => {
    render(<CreateGoalPage />);
    
    // Fill out the form
    await screen.findByLabelText(/Name/i).type('Emergency Fund');
    await screen.findByLabelText(/Target Amount (₹)/i).type('1000.00'); // 100000 paise
    await screen.findByLabelText(/Target Date (Optional)/i).type('2024-12-31');
    
    // Submit the form
    await screen.findByRole('button', { name: /Create Goal/i }).click();
    
    // Verify that the insert method was called with correct data
    const supabaseMock = require('@/lib/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('goals');
    expect(supabaseMock.from().insert).toHaveBeenCalled();
    
    // Verify success toast was shown
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Goal created successfully');
    
    // Verify redirect to goals page
    const routerMock = require('next/navigation').useRouter();
    expect(routerMock.push).toHaveBeenCalledWith('/goals');
  });

  it('should handle error state', async () => {
    // Override the mock to simulate an error on the insert call
    require('@/lib/supabase/client').supabase.from.mockImplementation(() => {
      return {
        insert: jest.fn().mockResolvedValue({ error: new Error('Database error') })
      };
    });

    render(<CreateGoalPage />);
    
    // Fill out the form
    await screen.findByLabelText(/Name/i).type('Emergency Fund');
    await screen.findByLabelText(/Target Amount (₹)/i).type('1000.00');
    await screen.findByLabelText(/Target Date (Optional)/i).type('2024-12-31');
    
    // Submit the form
    await screen.findByRole('button', { name: /Create Goal/i }).click();
    
    // Verify error toast was shown
    expect(require('sonner').toast.error).toHaveBeenCalledWith('Failed to create goal: Database error');
  });
});