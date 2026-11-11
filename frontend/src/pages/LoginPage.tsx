import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const isHi = i18n.language === 'hi';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard/citizen');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: 'citizen' | 'facilitator' | 'authority' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(role);
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'authority') navigate('/dashboard/authority');
      else if (role === 'facilitator') navigate('/dashboard/facilitator');
      else navigate('/dashboard/citizen');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and title */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#174C3C] text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 font-bold" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-[#172B24]">
            {isHi ? 'ग्रामसक्षम में लॉग इन करें' : 'Sign in to GramSaksham'}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {isHi
              ? 'चांडिल प्रखंड के नागरिक, सहायक अथवा प्रशासनिक पदाधिकारी पोर्टल'
              : 'Citizen, Facilitator & Administrative Portal for Chandil'}
          </p>
        </div>

        {/* Demo Fast Login Pills */}
        <div className="bg-amber-50/70 border border-amber-300/80 rounded-xl p-4 text-xs space-y-2">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>⚡ {isHi ? 'त्वरित डेमो परीक्षण लॉगिन (1-Click Demo Personas):' : 'Instant 1-Click Demo Login:'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('citizen')}
              className="p-2 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 transition cursor-pointer"
            >
              <div className="font-semibold text-emerald-950">1. Citizen (सुनीता महतो)</div>
              <div className="text-[10px] text-gray-500">Kutcha house • Chandil</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('facilitator')}
              className="p-2 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 transition cursor-pointer"
            >
              <div className="font-semibold text-blue-950">2. Facilitator (रमेश सोरेन)</div>
              <div className="text-[10px] text-gray-500">CSC / VLE Operator</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('authority')}
              className="p-2 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 transition cursor-pointer"
            >
              <div className="font-semibold text-purple-950">3. Authority (बीडीओ)</div>
              <div className="text-[10px] text-gray-500">Block Development Officer</div>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="p-2 bg-white rounded border border-amber-200 text-left hover:bg-amber-100/50 transition cursor-pointer"
            >
              <div className="font-semibold text-amber-950">4. Admin (राज्य प्रशासक)</div>
              <div className="text-[10px] text-gray-500">System Admin & Rules</div>
            </button>
          </div>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isHi ? 'ईमेल पता (Email Address)' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="citizen@gramsaksham.in"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isHi ? 'पासवर्ड (Password)' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#174C3C] hover:bg-[#0E3227] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? t('common.loading') : (isHi ? 'लॉग इन करें' : 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 text-xs text-gray-500">
            {isHi ? 'नया नागरिक खाता बनाना चाहते हैं?' : "Don't have an account yet?"}{' '}
            <Link to="/register" className="font-semibold text-emerald-800 hover:underline">
              {isHi ? 'यहाँ पंजीकरण करें' : 'Register here'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
