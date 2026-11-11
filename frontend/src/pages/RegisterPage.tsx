import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Phone, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const isHi = i18n.language === 'hi';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        full_name: fullName,
        email,
        phone,
        password,
        role,
        preferred_language: i18n.language,
      });
      navigate('/dashboard/citizen');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#174C3C] text-amber-400 flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-8 h-8 font-bold" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold text-[#172B24]">
            {isHi ? 'ग्रामसक्षम नागरिक पंजीकरण' : 'Create Your GramSaksham Account'}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {isHi ? 'चांडिल प्रखंड के निवासियों हेतु निःशुल्क नागरिक खाता' : 'Citizen account for Chandil Block, Jharkhand'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isHi ? 'पूरा नाम (Full Name) *' : 'Full Name *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder={isHi ? 'उदा: सुनीता महतो' : 'e.g. Sunita Mahato'}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isHi ? 'ईमेल पता (Email Address) *' : 'Email Address *'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="citizen@example.com"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isHi ? 'मोबाइल नंबर (Phone Number)' : 'Mobile Phone (Optional)'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isHi ? 'पासवर्ड (Password) *' : 'Password (min. 6 characters) *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {isHi ? 'भूमिका (Role)' : 'Account Role'}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              <option value="citizen">{isHi ? 'नागरिक (Citizen - Rural Resident)' : 'Citizen (Rural Resident)'}</option>
              <option value="facilitator">{isHi ? 'सहायक / वीएलई (Facilitator / CSC Operator)' : 'Facilitator / CSC Operator'}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#174C3C] hover:bg-[#0E3227] text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? t('common.loading') : (isHi ? 'खाता बनाएं' : 'Create Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center pt-2 text-xs text-gray-500">
            {isHi ? 'पहले से खाता है?' : 'Already have an account?'}{' '}
            <Link to="/login" className="font-semibold text-emerald-800 hover:underline">
              {isHi ? 'यहाँ लॉग इन करें' : 'Sign In'}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
