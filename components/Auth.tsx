
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { DumbbellIcon } from './common/Icons';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4">
      <div className="w-full max-w-md bg-dark-card rounded-lg shadow-lg p-8">
        <div className="flex flex-col items-center mb-6">
          <DumbbellIcon className="h-12 w-12 text-brand-primary mb-2" />
          <h1 className="text-3xl font-bold text-white">CrossFit PR Tracker</h1>
          <p className="text-dark-text-secondary mt-1">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleAuth}>
          <div className="space-y-4">
            <input
              className="w-full px-4 py-3 bg-gray-700 border border-dark-border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              type="email"
              placeholder="Your email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full px-4 py-3 bg-gray-700 border border-dark-border rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              type="password"
              placeholder="Your password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {isLogin && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-brand-primary focus:ring-brand-primary"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-dark-text-secondary">
                  Remember me
                </label>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              className="w-full py-3 px-4 bg-brand-primary hover:bg-red-600 rounded-md text-white font-semibold transition duration-200 disabled:bg-gray-500"
              disabled={loading}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>

        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
        {message && <p className="mt-4 text-center text-green-400">{message}</p>}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className="text-sm text-brand-secondary hover:underline"
          >
            {isLogin ? 'Need an account? Sign Up' : 'Have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
