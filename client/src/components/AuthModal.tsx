import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!email || !password || !fullName) {
          throw new Error('Please fill in all fields.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        if (data.session) {
          onSuccess();
          onClose();
        } else {
          setSuccessMessage('Registration successful! Check your email inbox to verify your account or sign in directly.');
          setMode('signin');
        }
      } else if (mode === 'signin') {
        if (!email || !password) {
          throw new Error('Please enter both email and password.');
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        if (data.session) {
          onSuccess();
          onClose();
        }
      } else if (mode === 'reset') {
        if (!email) {
          throw new Error('Please enter your account email.');
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin
        });
        if (error) throw error;
        setSuccessMessage('Password reset link sent to your email.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FFFFFF] rounded-3xl border border-[#DEDED5] shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-[#EFEEE7] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-block px-3 py-1 rounded-full bg-[#EFEEE7] text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
            Supabase Protected Access
          </div>
          <h3 className="text-2xl font-extrabold text-[#17191C]">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Your Career Account'}
            {mode === 'reset' && 'Reset Password'}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            {mode === 'signin' && 'Sign in to access your personalized roadmap & AI tutor.'}
            {mode === 'signup' && 'Start your personalized AI career development journey.'}
            {mode === 'reset' && 'Enter your email to receive a recovery link.'}
          </p>
        </div>

        {/* Alerts */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C] focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C] focus:bg-white transition-all"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('reset'); setErrorMessage(''); }}
                    className="text-xs font-medium text-neutral-500 hover:text-[#17191C] transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-neutral-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F7F2] border border-[#DEDED5] text-sm text-[#17191C] placeholder:text-neutral-400 focus:outline-none focus:border-[#17191C] focus:bg-white transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#C5F36A] text-[#17191C] hover:bg-[#b8e858] transition-all flex items-center justify-center space-x-2 shadow-xs hover:shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-[#17191C] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'signin' && 'Sign In to Dashboard'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'reset' && 'Send Recovery Email'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="mt-6 pt-5 border-t border-[#DEDED5] text-center text-xs text-neutral-600">
          {mode === 'signin' && (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => { setMode('signup'); setErrorMessage(''); setSuccessMessage(''); }}
                className="font-bold text-[#17191C] hover:underline"
              >
                Sign up free
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Already registered?{' '}
              <button
                onClick={() => { setMode('signin'); setErrorMessage(''); setSuccessMessage(''); }}
                className="font-bold text-[#17191C] hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
          {mode === 'reset' && (
            <p>
              Remembered your credentials?{' '}
              <button
                onClick={() => { setMode('signin'); setErrorMessage(''); setSuccessMessage(''); }}
                className="font-bold text-[#17191C] hover:underline"
              >
                Back to Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
