'use client';

import { useState } from 'react';
import { signInWithEmail } from '@/lib/auth/service';
import { useToast } from '@/components/ui/ToastManager';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showToast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithEmail(email, password);
      // On successful sign in, redirect to dashboard
      // In Next.js, we can use useRouter or redirect in server component
      // For simplicity, we'll just reload the page (in a real app, use router)
      window.location.href = '/dashboard';
      showToast('Sign in successful!', 'success');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      showToast('Sign in failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">KutumbLedger</h2>
          <p className="text-sm text-gray-500">
            Sign in to your family finance OS
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm font-medium text-green-600 hover:text-green-500">
              Forgot password?
            </a>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                loading ? 'opacity-50' : ''
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">
              {error}
            </p>
          )}
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="#" className="font-medium text-green-600 hover:text-green-500">
              Sign up
            </a>
          </p>
        </form>
        <div className="text-center text-sm text-gray-500 mt-4">
          Or sign in with
        </div>
        <div className="flex justify-center space-x-4 mt-2">
          <button
            type="button"
            onClick={() => {
              // Implement Google/Apple sign in if needed
              showToast('Social sign in not implemented yet', 'info');
            }}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md"
          >
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => {
              // Implement phone OTP sign in
              window.location.href = '/auth/verify-otp';
            }}
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded-md"
          >
            Continue with Phone
          </button>
        </div>
      </div>
    </div>
  );
}