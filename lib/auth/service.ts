import { createSupabaseClient } from '@/lib/supabase/client';

export const supabase = createSupabaseClient();

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data.user;
}

// Sign in with OTP (email or phone)
export async function signInWithOTP(email?: string, phone?: string) {
  if (email) {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) throw error;
    return data;
  }

  if (phone) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) throw error;
    return data;
  }

  throw new Error('Either email or phone must be provided');
}

// Verify OTP token
export async function verifyOTP(token: string, type: 'email' | 'sms' = 'email', email?: string, phone?: string) {
  const params = {
    token,
    type,
    ...(type === 'email' && { email: email ?? undefined }),
    ...(type === 'sms' && { phone: phone ?? undefined }),
  };

  const { data, error } = await supabase.auth.verifyOtp(params as any);

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Get current user
export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// Update user password
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  });

  if (error) throw error;
  return data.user;
}

// Update user email
export async function updateEmail(email: string) {
  const { data, error } = await supabase.auth.updateUser({
    email,
  });

  if (error) throw error;
  return data.user;
}

// Send magic link (email)
export async function sendMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

// Send OTP via SMS
export async function sendOTPBySMS(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) throw error;
  return data;
}