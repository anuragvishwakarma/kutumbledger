import { render, screen } from '@testing-library/react';
import EditFestivalPlanPage from '../app/festival_plans/[id]/edit/page';

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
      if (table === 'festival_plans') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { 
              id: 'test-festival-id',
              festival_name: 'Diwali',
              year: 2024,
              total_budget: 50000, // 500.00 in paise
              categories_json: { food: 1000, decorations: 500, gifts: 2000 }, // 10.00, 5.00, 20.00 in rupees
              start_saving_month: 8,
              actual_spending: { food: 800, decorations: 300, gifts: 1500 } // 8.00, 3.00, 15.00 in rupees
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
  useParams: () => ({ id: 'test-festival-id' }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams()
}));

describe('EditFestivalPlanPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the edit festival plan page header', async () => {
    render(<EditFestivalPlanPage />);
    
    // Check for loading state initially
    expect(await screen.findByText(/Loading festival plan.../i)).toBeInTheDocument();
    
    // After loading, should see the form with pre-filled values
    expect(await screen.findByText(/Edit Festival Plan/i)).toBeInTheDocument();
    
    // Check that form fields are pre-filled with the festival plan data
    expect(await screen.findByLabelText(/Festival Name/i)).toHaveValue('Diwali');
    expect(await screen.findByLabelText(/Year/i)).toHaveValue('2024');
    expect(await screen.findByLabelText(/Total Budget (₹)/i)).toHaveValue('500.00'); // 50000 paise = 500.00
    // Check that the JSON fields are populated (we'll check for the presence of the textareas)
    expect(await screen.findByLabelText(/Start Saving Month (Optional)/i)).toHaveValue('8'); // August
    // Note: We won't check the exact JSON content as it's formatted, but we can verify the textareas have content
  });

  it('should handle error when festival plan not found', async () => {
    // Override the mock to simulate festival plan not found
    require('@/lib/supabase/client').supabase.from.mockImplementation((table) => {
      if (table === 'family_members') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { family_id: 'test-family-id' }, error: null })
        };
      }
      if (table === 'festival_plans') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Festival plan not found') }),
          update: jest.fn().mockResolvedValue({ data: [], error: new Error('Festival plan not found') })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        update: jest.fn().mockResolvedValue({ data: [], error: new Error('Not found') })
      };
    });

    render(<EditFestivalPlanPage />);
    
    // Check for loading state
    expect(await screen.findByText(/Loading festival plan.../i)).toBeInTheDocument();
    
    // Should show error or redirect (in our implementation, we show "Festival Plan Not Found" message)
    expect(await screen.findByText(/Festival Plan Not Found/i)).toBeInTheDocument();
  });

  it('should handle form submission and update festival plan', async () => {
    render(<EditFestivalPlanPage />);
    
    // Wait for loading to finish and form to be populated
    await screen.findByText(/Edit Festival Plan/i);
    
    // Fill out the form with new values
    await screen.findByLabelText(/Festival Name/i).clear();
    await screen.findByLabelText(/Festival Name/i).type('Christmas');
    
    await screen.findByLabelText(/Year/i).clear();
    await screen.findByLabelText(/Year/i).type('2025');
    
    await screen.findByLabelText(/Total Budget (₹)/i).clear();
    await screen.findByLabelText(/Total Budget (₹)/i).type('750.00'); // 75000 paise
    
    await screen.findByLabelText(/Start Saving Month (Optional)/i).click();
    await screen.findByText(/November/i).click();
    
    // Update the JSON fields - we'll simulate typing in the textareas
    const categoriesTextarea = await screen.findByLabelText(/Categories JSON (Optional)/i);
    await categoriesTextarea.clear();
    await categoriesTextarea.type('{\n  "food": 2000,\n  "decorations": 1000,\n  "gifts": 3000\n}');
    
    const spendingTextarea = await screen.findByLabelText(/Actual Spending JSON (Optional)/i);
    await spendingTextarea.clear();
    await spendingTextarea.type('{\n  "food": 1500,\n  "decorations": 500,\n  "gifts": 2000\n}');
    
    // Submit the form
    await screen.findByRole('button', { name: /Update Festival Plan/i }).click();
    
    // Verify that the update method was called with correct data
    const supabaseMock = require('@/lib/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('festival_plans');
    expect(supabaseMock.from().update).toHaveBeenCalled();
    
    // Verify success toast was shown
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Festival plan updated successfully');
    
    // Verify redirect to festival plans page
    const routerMock = require('next/navigation').useRouter();
    expect(routerMock.push).toHaveBeenCalledWith('/festival_plans');
  });
});