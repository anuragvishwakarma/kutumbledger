import { render, screen } from '@testing-library/react';
import MoneyJarsPage from '../app/money_jars/page';

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

describe('MoneyJarsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the money jars page header', async () => {
    render(<MoneyJarsPage />);
    
    // Check for loading state initially
    expect(await screen.findByText(/Loading money jars.../i)).toBeInTheDocument();
    
    // Since we're mocking the data to return an empty array, we expect to see the "No money jars found" message.
    expect(await screen.findByText(/No money jars found/i)).toBeInTheDocument();
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

    render(<MoneyJarsPage />);
    
    // Check for loading state
    expect(await screen.findByText(/Loading money jars.../i)).toBeInTheDocument();
    
    // Check for error state
    expect(await screen.findByText(/Error loading money jars/i)).toBeInTheDocument();
    expect(await screen.findByText(/Database error/i)).toBeInTheDocument();
  });
});