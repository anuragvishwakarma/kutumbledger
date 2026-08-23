import { render, screen } from '@testing-library/react';
import EditUdhaarRecordPage from '../app/udhaar_records/[id]/edit/page';

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
      if (table === 'udhaar_records') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { 
              id: 'test-record-id',
              lender_id: 'test-lender-id',
              borrower_id: 'test-borrower-id',
              amount: 10000, // 100.00 in paise
              purpose: 'Medical emergency',
              date: '2024-01-15',
              due_date: '2024-02-15',
              status: 'lent'
            }, 
            error: null 
          }),
          update: jest.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      // For family_members queries (to get lender/borrower names)
      if (table === 'family_members' && typeof table === 'string') {
        // We need to handle the case where we're querying for specific members
        // This is a simplification - in reality, we'd need to mock the join
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ 
            data: { 
              id: 'test-lender-id', 
              display_name: 'Lender Person' 
            }, 
            error: null 
          })
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
  useParams: () => ({ id: 'test-record-id' }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams()
}));

describe('EditUdhaarRecordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the edit udhaar record page header', async () => {
    render(<EditUdhaarRecordPage />);
    
    // Check for loading state initially
    expect(await screen.findByText(/Loading udhaar record.../i)).toBeInTheDocument();
    
    // After loading, should see the form with pre-filled values
    expect(await screen.findByText(/Edit Udhaar Record/i)).toBeInTheDocument();
    
    // Check that form fields are pre-filled with the record data
    // Note: We won't check the exact lender/borrower values as they come from joins
    // but we can check that the form loads
    expect(await screen.findByLabelText(/Amount (₹)/i)).toHaveValue('100.00'); // 10000 paise = 100.00
    expect(await screen.findByLabelText(/Purpose/i)).toHaveValue('Medical emergency');
    expect(await screen.findByLabelText(/Date/i)).toHaveValue('2024-01-15');
    expect(await screen.findByLabelText(/Due Date (Optional)/i)).toHaveValue('2024-02-15');
    expect(await screen.findByLabelText(/Status/i)).toHaveValue('lent');
  });

  it('should handle error when record not found', async () => {
    // Override the mock to simulate record not found
    require('@/lib/supabase/client').supabase.from.mockImplementation((table) => {
      if (table === 'family_members') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: { family_id: 'test-family-id' }, error: null })
        };
      }
      if (table === 'udhaar_records') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Udhaar record not found') }),
          update: jest.fn().mockResolvedValue({ data: [], error: new Error('Udhaar record not found') })
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
        update: jest.fn().mockResolvedValue({ data: [], error: new Error('Not found') })
      };
    });

    render(<EditUdhaarRecordPage />);
    
    // Check for loading state
    expect(await screen.findByText(/Loading udhaar record.../i)).toBeInTheDocument();
    
    // Should show error or redirect (in our implementation, we show "Udhaar Record Not Found" message)
    expect(await screen.findByText(/Udhaar Record Not Found/i)).toBeInTheDocument();
  });

  it('should handle form submission and update record', async () => {
    render(<EditUdhaarRecordPage />);
    
    // Wait for loading to finish and form to be populated
    await screen.findByText(/Edit Udhaar Record/i);
    
    // Fill out the form with new values
    await screen.findByLabelText(/Amount (₹)/i).clear();
    await screen.findByLabelText(/Amount (₹)/i).type('150.00'); // 15000 paise
    
    await screen.findByLabelText(/Purpose/i).clear();
    await screen.findByLabelText(/Purpose/i).type('Home renovation');
    
    await screen.findByLabelText(/Date/i).clear();
    await screen.findByLabelText(/Date/i).type('2024-03-01');
    
    await screen.findByLabelText(/Due Date (Optional)/i).clear();
    await screen.findByLabelText(/Due Date (Optional)/i).type('2024-04-01');
    
    await screen.findByLabelText(/Status/i).click();
    await screen.findByText(/Received/i).click();
    
    // Submit the form
    await screen.findByRole('button', { name: /Update Udhaar Record/i }).click();
    
    // Verify that the update method was called with correct data
    const supabaseMock = require('@/lib/supabase/client').supabase;
    expect(supabaseMock.from).toHaveBeenCalledWith('udhaar_records');
    expect(supabaseMock.from().update).toHaveBeenCalled();
    
    // Verify success toast was shown
    expect(require('sonner').toast.success).toHaveBeenCalledWith('Udhaar record updated successfully');
    
    // Verify redirect to udhaar records page
    const routerMock = require('next/navigation').useRouter();
    expect(routerMock.push).toHaveBeenCalledWith('/udhaar_records');
  });
});