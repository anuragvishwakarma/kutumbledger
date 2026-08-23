// Mock next/navigation
const navMock = {
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    refresh: jest.fn()
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams()
};

jest.mock('next/navigation', () => navMock);

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn()
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lte: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  throwOnError: jest.fn().mockReturnThis()
};

// Mock the supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase
}));

// Mock UI components
const React = require('react');

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, ...props }) => {
    return React.createElement('button', { ...props, 'data-testid': 'button' }, children);
  }
}));
jest.mock('@/components/ui/Input', () => ({
  Input: ({ ...props }) => {
    return React.createElement('input', { ...props, 'data-testid': 'input' });
  }
}));
jest.mock('@/components/ui/Select', () => ({
  Select: ({ ...props }) => {
    return React.createElement('select', { ...props, 'data-testid': 'select' }, props.children);
  }
}));
jest.mock('@/components/ui/DatePicker', () => ({
  DatePicker: ({ ...props }) => {
    return React.createElement('input', { type: 'date', ...props, 'data-testid': 'date-picker' });
  }
}));
jest.mock('@/components/ui/CategorySelector', () => ({
  CategorySelector: ({ ...props }) => {
    return React.createElement('div', { ...props, 'data-testid': 'category-selector' }, props.children);
  }
}));
jest.mock('@/components/ui/Toast', () => ({
  Toast: ({ ...props }) => {
    return null; // We don't render toast in tests
  }
}));
jest.mock('sonner', () => ({
  toast: jest.fn()
}));