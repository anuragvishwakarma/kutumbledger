import { useState } from 'react';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // In real app, this would call Supabase auth
    // For now, just simulate
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    alert('Login successful! (Demo)');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email or Phone Number
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter email or phone number"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter password"
          required
        />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <span className="ml-2">Remember me</span>
        </label>
        <a href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
          Forgot password?
        </a>
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'bg-indigo-400' : ''
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
      <div className="text-center text-sm text-gray-500">
        Or continue with
      </div>
      <div className="flex justify-center mt-2">
        <button
          className="mr-2 h-10 w-10 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          G
        </button>
        <button
          className="ml-2 h-10 w-10 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          F
        </button>
      </div>
    </form>
  );
}
