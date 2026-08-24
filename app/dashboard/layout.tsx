'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getRoleDisplayName } from '@/lib/auth/role';

// Mock user role - in real app, this would come from auth context or user data
function getMockUserRole(): 'admin' | 'adult' | 'dependent' | 'child' {
  // For demo purposes, we'll simulate different roles based on a seed
  // In real app, this would be fetched from user profile
  const roleSeed = localStorage.getItem('mockUserRole') || 'admin';
  return roleSeed as 'admin' | 'adult' | 'dependent' | 'child';
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<'admin' | 'adult' | 'dependent' | 'child'>('admin');
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    setUserRole(getMockUserRole());
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    // Skip check for onboarding page itself and auth pages
    if (!pathname || (pathname.includes('/onboarding') || pathname.startsWith('/auth'))) {
      return;
    }

    const completed = localStorage.getItem('kutumbLedgerOnboardingComplete');
    if (!completed && pathname.startsWith('/dashboard')) {
      // Redirect to onboarding if not completed
      router.push('/dashboard/onboarding');
    }
  }, [pathname, router]);

  const roleDisplayName = getRoleDisplayName(userRole);

  // Define navigation items
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['admin', 'adult', 'dependent', 'child'] as const },
    { href: '/dashboard/onboarding', label: 'Tutorial', icon: '📚', roles: ['admin', 'adult', 'dependent', 'child'] as const },
    { href: '/dashboard/transactions', label: 'Transactions', icon: '💳', roles: ['admin', 'adult', 'dependent'] as const },
    { href: '/dashboard/family', label: 'Family', icon: '👨‍👩‍👧‍👦', roles: ['admin', 'adult'] as const },
    { href: '/dashboard/helpers', label: 'Helpers', icon: '👨‍💼', roles: ['admin'] as const },
    { href: '/dashboard/festival', label: 'Festival', icon: '🎪', roles: ['admin'] as const },
    { href: '/dashboard/udhaar', label: 'Udhaar', icon: '🤝', roles: ['admin'] as const },
    { href: '/dashboard/exports', label: 'Exports', icon: '📤', roles: ['admin', 'adult'] as const },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️', roles: ['admin', 'adult', 'dependent', 'child'] as const },
    { href: '/dashboard/jars', label: 'Jars', icon: '🏦', roles: ['admin', 'adult', 'dependent', 'child'] as const }
  ];

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item =>
    item.roles.includes(userRole as any)
  );

  // Handle sidebar toggle for mobile
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`w-64 bg-white shadow-md flex-shrink-0 ${!isSidebarOpen && 'translate-x-full'} transition-transform duration-300 lg:translate-x-0`}>
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-gray-800">KutumbLedger</span>
            </Link>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1 px-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium 
                  ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-600'}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer to push bottom content down */}
        <div className="mt-auto pb-4">
          <div className="flex items-center space-x-2 px-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">👤</span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-800">{roleDisplayName}</p>
              <p className="text-xs text-gray-500">Family CFO</p>
            </div>
          </div>
          <button
            onClick={() => {
              // In real app, this would sign out
              localStorage.removeItem('mockUserRole');
              window.location.href = '/auth/login';
            }}
            className="w-full text-left text-sm font-medium text-red-600 hover:text-red-500 px-4 py-2"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}