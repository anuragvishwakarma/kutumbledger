'use client';

import { useState } from 'react';
import { signInWithOTP, verifyOTP } from '@/lib/auth/service';

export default function VerifyOTP() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signInWithOTP(undefined, phone); // phone only
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await verifyOTP(otp, 'sms', undefined, phone);
      // On successful verification, redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {!sent ? 'Verify OTP' : 'Verify OTP Sent'}
          </h2>
          <p className="text-sm text-gray-500">
            {!sent
              ? 'Enter your phone number to receive OTP'
              : 'Enter the OTP sent to your phone number'}
          </p>
        </div>
        {!sent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your phone number"
                required
                disabled={loading}
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">OTP (6 digits)</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                inputMode="numeric"
                maxLength={6}
                required
                disabled={loading}
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setSent(false);
                  setPhone('');
                  setOtp('');
                }}
                className="text-sm font-medium text-green-600 hover:text-green-500"
              >
                Change number
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                  loading ? 'opacity-50' : ''
                }`}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">
            {error}
          </p>
        )}
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account?{' '}
          <a href="#" className="font-medium text-green-600 hover:text-green-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}