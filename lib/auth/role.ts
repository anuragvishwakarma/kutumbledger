export type FamilyRole = 'admin' | 'adult' | 'dependent' | 'child';

// Role hierarchy: higher index means more permissions
export const ROLE_HIERARCHY: Record<FamilyRole, number> = {
  child: 0,
  dependent: 1,
  adult: 2,
  admin: 3
};

// Check if user has at least the minimum required role
export function hasRole(userRole: FamilyRole, requiredRole: FamilyRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Get accessible modules based on role
export function getAccessibleModules(userRole: FamilyRole) {
  const accessible: string[] = [];

  // All roles can see their own transactions and basic info
  accessible.push('transactions', 'dashboard');

  // Based on role
  switch (userRole) {
    case 'child':
      accessible.push('jars'); // Money jars only
      break;
    case 'dependent':
      accessible.push('transactions', 'dashboard', 'jars', 'family'); // Limited family view
      break;
    case 'adult':
      accessible.push(
        'transactions',
        'dashboard',
        'jars',
        'family',
        'helpers' // Can see domestic helpers but not manage them
      );
      break;
    case 'admin':
      accessible.push(
        'transactions',
        'dashboard',
        'family',
        'helpers',
        'festival',
        'udhaar',
        'jars',
        'settings' // Full access
      );
      break;
  }

  return accessible;
}

// Check if user can access a specific module
export function canAccessModule(userRole: FamilyRole, module: string): boolean {
  const accessible = getAccessibleModules(userRole);
  return accessible.includes(module);
}

// Get role display name
export function getRoleDisplayName(role: FamilyRole): string {
  switch (role) {
    case 'admin':
      return 'Admin (Family CFO)';
    case 'adult':
      return 'Adult Earner';
    case 'dependent':
      return 'Dependent';
    case 'child':
      return 'Child';
    default:
      return role;
  }
}

// Get role description
export function getRoleDescription(role: FamilyRole): string {
  switch (role) {
    case 'admin':
      return 'Can see all transactions, budgets, helpers, festivals, and manage family settings';
    case 'adult':
      return 'Can see own transactions, kids spending, and basic family info';
    case 'dependent':
      return 'Can see limited family info and own transactions';
    case 'child':
      return 'Can only see and manage money jars';
    default:
      return 'Unknown role';
  }
}