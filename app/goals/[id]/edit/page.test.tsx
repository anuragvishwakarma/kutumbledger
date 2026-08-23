import { render, screen } from '@testing-library/react';
import EditGoalPage from '../app/goals/[id]/edit/page';

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
      if (table === 'goals') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { 
              id: 'test-goal-id', 
              name: 'Emergency Fund', 
              target_amount: 100000, // 1000.00 in paise
              current_amount: 25000, // 250.00 in paise
              target_date: '2024-12-31'
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
  useParams: () => ({ id: 'test-goal-id' }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams()
}));

describe('EditGoalPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the edit goal page header', async () => {
    render(<EditGoalPage />);
    
    // Check for loading state initially
    expect(await screen.findByText(/Loading goal.../i)).toBeInTheDocument();
    
    // After loading, should see the form with pre-filled values
    expect(await screen.findByText(/Edit Goal/i)).toBeInTheDocument();
    
    // Check that form fields are pre-filled with the goal data
    expect(await screen.findByLabelText(/Name/i)).toHaveValue('Emergency Fund');
    expect(await screen.findByLabelText(/Target Amount (₹)/i)).toHaveValue('1000.00'); // 100000 paise = 1000.00
    expect(await screen.findByLabelText(/Target Date (Optional)/i)).toHaveValue('2024-12-31');
  });

  it('should handle error when goal not found', async () => {
    // Override the mock to simulate goal not found
    require('@/lib/supabase/client').supabase.from.mockImplementation((table) => {
      if (table === 'family_members') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { family_id: 'test-family-id' }, error: null })
        };
      }
      if (table === 'goals') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Goal not found') }),
          update: jest.fn().mockResolvedValue({ data: [], error: new Error('Goal not found') })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        update: jest.fn().mockResolvedValue({ data: [], error: new Error('Not found') })
      };
    });

    render(<EditGoalPage />);
    
    // Check for loading state
    expect(await screen.findByText(/Loading goal.../i)).toBeInTheDocument();
    
    // Should show error or redirect (in our implementation, we show "Goal Not Found" message)
    expect(await screen.findByText(/Goal Not Found/i)).toBeInTheDocument();
  });

  it('should handle form submission and update goal', async () => {
    render(<EditGoalPage />);
    
    // Wait for loading to finish and form to be populated
    await screen.findByText(/Edit Goal/i);
    
    // Fill out the form with new values
    await screen.findByLabelText(/Name/i).clear();
    await screen.findByLabelText(/Name/i).type('Vacation Fund');
    
    await screen.findByLabelText(/Target Amount (₹)/i).clear();
    await screen.findByLabelText(/Target Amount (₹)/i).type('2000.00'); // 200000 paise
    
    await screen.findByLabelText(/Target Date (Optional)/i).clear();
    await screen.findByLabelText(/Target Date (Optional)/i).type('2025-06-30');
    
    // Submit the form
    await screen.findByRole('button', { name: /Update Goal/i }).click();
    
    // Verify that the update method was called with correct data
    const supabaseMock = require('@/lib/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('goals');
    expect(supabaseMock.from().update).toHaveBeenCalled();
    
    // Verify success toast was shown
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Goal updated successfully');
    
    // Verify redirect to goals page
    const routerMock = require('next/navigation').useRouter();
    expect(routerMock.push).toHaveBeenCalledWith('/goals');
  });
});