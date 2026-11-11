import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Globe, Menu, X, User as UserIcon, LogOut, 
  FileText, AlertTriangle, Search, Activity, HelpCircle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(nextLang);
    localStorage.setItem('gramsaksham_lang', nextLang);
  };

  const handleDemoSelect = async (role: 'citizen' | 'facilitator' | 'authority' | 'admin') => {
    setDemoDropdownOpen(false);
    await demoLogin(role);
    if (role === 'admin') navigate('/dashboard/admin');
    else if (role === 'authority') navigate('/dashboard/authority');
    else if (role === 'facilitator') navigate('/dashboard/facilitator');
    else navigate('/dashboard/citizen');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#174C3C] text-white shadow-md border-b border-[#0E3227]">
      {/* Top micro-bar */}
      <div className="bg-[#0E3227] text-xs px-4 py-1 text-emerald-100/90 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>चांडिल प्रखंड पायलट (Chandil Block Pilot) • सरायकेला-खरसावां, झारखंड</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-amber-300 font-medium">हेल्पलाइन: 1800-345-6540</span>
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-xs transition cursor-pointer font-medium"
          >
            <Globe className="w-3.5 h-3.5 text-amber-300" />
            <span>{i18n.language === 'hi' ? 'English' : 'हिंदी (Hindi)'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-[#174C3C] shadow">
              <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>ग्रामसक्षम</span>
                <span className="text-xs font-normal bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded">
                  GramSaksham
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 -mt-0.5 hidden sm:block">
                {t('nav.tagline')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="text-emerald-50 hover:text-amber-300 transition">
              {t('nav.home')}
            </Link>
            <Link to="/schemes" className="text-emerald-50 hover:text-amber-300 transition flex items-center gap-1">
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>{t('nav.schemes')}</span>
            </Link>
            <Link to="/complaint" className="text-emerald-50 hover:text-amber-300 transition flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{t('nav.complaint')}</span>
            </Link>
            <Link to="/track" className="text-emerald-50 hover:text-amber-300 transition flex items-center gap-1">
              <Search className="w-4 h-4 text-sky-300" />
              <span>{t('nav.track')}</span>
            </Link>
            <Link to="/modules" className="text-emerald-50 hover:text-amber-300 transition flex items-center gap-1">
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>{t('nav.modules')}</span>
            </Link>
          </nav>

          {/* Right Actions & Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition cursor-pointer"
                title="Quickly test with seeded role accounts"
              >
                <span>⚡ डेमो खाते (Demo Roles)</span>
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-100 py-1 z-50 text-xs">
                  <div className="px-3 py-1.5 border-b font-semibold text-gray-500 uppercase tracking-wider">
                    Select Demo Persona:
                  </div>
                  <button
                    onClick={() => handleDemoSelect('citizen')}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-emerald-900">1. Citizen (सुनीता महतो)</div>
                      <div className="text-[10px] text-gray-500">Kutcha house • Chandil</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSelect('facilitator')}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-blue-900">2. Facilitator (रमेश सोरेन)</div>
                      <div className="text-[10px] text-gray-500">CSC / VLE Operator</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSelect('authority')}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-purple-900">3. Authority (बीडीओ चांडिल)</div>
                      <div className="text-[10px] text-gray-500">Block Development Officer</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleDemoSelect('admin')}
                    className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-amber-900">4. Admin (राज्य प्रशासक)</div>
                      <div className="text-[10px] text-gray-500">System & Routing Director</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={
                    user.role === 'admin'
                      ? '/dashboard/admin'
                      : user.role === 'authority'
                      ? '/dashboard/authority'
                      : user.role === 'facilitator'
                      ? '/dashboard/facilitator'
                      : '/dashboard/citizen'
                  }
                  className="bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{user.full_name} ({user.role})</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-medium text-emerald-100 hover:text-white px-3 py-1.5 rounded hover:bg-white/10 transition"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-amber-400 hover:bg-amber-300 text-[#174C3C] font-semibold text-xs px-3.5 py-1.5 rounded-md shadow-sm transition"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="text-xs font-semibold px-2 py-1 rounded bg-white/10 text-amber-300"
            >
              {i18n.language === 'hi' ? 'EN' : 'हिन्दी'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#123D30] border-t border-emerald-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-50 hover:text-amber-300 border-b border-emerald-800/50"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/schemes"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-50 hover:text-amber-300 border-b border-emerald-800/50"
          >
            {t('nav.schemes')}
          </Link>
          <Link
            to="/complaint"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-50 hover:text-amber-300 border-b border-emerald-800/50"
          >
            {t('nav.complaint')}
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-50 hover:text-amber-300 border-b border-emerald-800/50"
          >
            {t('nav.track')}
          </Link>
          <Link
            to="/modules"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-emerald-50 hover:text-amber-300 border-b border-emerald-800/50"
          >
            {t('nav.modules')}
          </Link>

          <div className="pt-2 flex flex-col gap-2">
            <div className="text-xs font-bold text-amber-300 uppercase">⚡ Quick Demo Login:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setMobileMenuOpen(false); handleDemoSelect('citizen'); }}
                className="bg-emerald-900/60 p-2 rounded text-left border border-emerald-700/50"
              >
                Citizen (नागरिक)
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleDemoSelect('facilitator'); }}
                className="bg-emerald-900/60 p-2 rounded text-left border border-emerald-700/50"
              >
                Facilitator (सहायक)
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleDemoSelect('authority'); }}
                className="bg-emerald-900/60 p-2 rounded text-left border border-emerald-700/50"
              >
                Authority (बीडीओ)
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); handleDemoSelect('admin'); }}
                className="bg-emerald-900/60 p-2 rounded text-left border border-emerald-700/50"
              >
                Admin (प्रशासक)
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-emerald-800 flex justify-between items-center">
            {user ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-emerald-200">{user.full_name} ({user.role})</span>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="text-xs text-rose-300 font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3 w-full">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium bg-emerald-800 rounded text-white"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold bg-amber-400 rounded text-[#174C3C]"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
