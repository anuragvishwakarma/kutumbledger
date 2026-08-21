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
    { href: '/dashboard', label: 'Dashboard', icon: '���������������������������������������������🏠', roles: ['admin', 'adult', 'dependent', 'child'] as const },
    { href: '/dashboard/onboarding', label: 'Tutorial', icon: '���������������������������������������������📚', roles: ['admin', 'adult', 'dependent', 'child'] as const },
    { href: '/dashboard/transactions', label: 'Transactions', icon: '���������������������������������������������💳', roles: ['admin', 'adult', 'dependent'] as const },
    { href: '/dashboard/family', label: 'Family', icon: '���������������������������������������������👨‍���������������������������������������������👩‍���������������������������������������������👧‍���������������������������������������������👦', roles: ['admin', 'adult'] as const },
    { href: '/dashboard/helpers', label: 'Helpers', icon: '���������������������������������������������👨‍���������������������💼', roles: ['admin'] as const },
    { href: '/dashboard/festival', label: 'Festival', icon: '���������������������������������������������🎪', roles: ['admin'] as const },
    { href: '/dashboard/udhaar', label: 'Udhaar', icon: '���������������������������������������������🤝', roles: ['admin'] as const },
    { href: '/dashboard/exports', label: 'Exports', icon: '���������������������������������������������������������������������������������������������📤', roles: ['admin', 'adult'] as const },
    { href: "/dashboard/settings", label: "Settings", icon: "��������������������������������������������������������������������������������������������������������������������������������������������������������������������������������������⚙������������������������������������������������������������������������", roles: ["admin", "adult", "dependent", "child"] as const },
    { href: '/dashboard/jars', label: 'Jars', icon: '���������������������������������������������������������������������������������������������🏦', roles: ['admin', 'adult', 'dependent', 'child'] as const }
  ];

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter(item =>
    item.roles.includes(userRole as any)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center space-x-3">
                <span className="text-xl font-semibold text-gray-800">KutumbLedger</span>
              </Link>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-4">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">���������������������������������������������👤</span>
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
                className="text-sm font-medium text-red-600 hover:text-red-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}