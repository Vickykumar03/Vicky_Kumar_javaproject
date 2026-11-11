import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, AlertTriangle, FileText, Search, Activity, 
  ArrowRight, CheckCircle2, Lock, Eye, Droplet, Sprout, 
  MapPin, ShieldAlert, Sparkles, Building2, HelpCircle 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { demoLogin } = useAuth();
  const isHi = i18n.language === 'hi';

  return (
    <div className="bg-[#F8FAF8] text-[#172B24]">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#174C3C] via-[#144234] to-[#0E3227] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#0E3227]">
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subtitle & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Pilot Location Tag */}
              <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('hero.badge')}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
                {t('hero.title')}
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
                {t('hero.subtitle')}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
                <Link
                  to="/schemes"
                  className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-[#174C3C] font-bold text-sm rounded-xl shadow-lg hover:shadow-amber-400/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{t('hero.ctaSchemes')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/complaint"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>{t('hero.ctaComplaint')}</span>
                </Link>

                <Link
                  to="/track"
                  className="px-5 py-3.5 text-emerald-200 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{t('hero.ctaTrack')}</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-emerald-800/80 grid grid-cols-3 gap-3 text-xs text-emerald-200/90 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t('hero.stat1')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{t('hero.stat2')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>{t('hero.stat3')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-emerald-800/20 text-[#172B24] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      चांडिल प्रखंड लाइव रिपोर्ट
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">Chandil Pilot 2026</span>
                </div>

                {/* Sample Verified Scheme Card */}
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-emerald-950">Pradhan Mantri Awaas Yojana - Gramin</span>
                    <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-semibold px-2 py-0.5 rounded">
                      Housing Grant
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    ₹1,20,000 direct bank grant + ₹20,000 MGNREGA wages for families living in kutcha dwellings.
                  </p>
                  <Link
                    to="/schemes"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 hover:text-emerald-700"
                  >
                    <span>Check 30-Second Eligibility</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Sample Protected Grievance Card */}
                <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      <span>Smart Panchayat Vigilance</span>
                    </span>
                    <span className="font-mono text-[10px] text-amber-800">GS-2026-CH-1001</span>
                  </div>
                  <div className="text-[11px] text-amber-900">
                    Bribe demanded for PMAY-G signature • <strong>Escrow Routed to BDO Chandil</strong>
                  </div>
                  <div className="text-[10px] text-gray-500 flex justify-between pt-1">
                    <span>Status: Investigation in Progress</span>
                    <Link to="/track?ref=GS-2026-CH-1001" className="text-emerald-800 font-bold hover:underline">
                      Track Live Timeline →
                    </Link>
                  </div>
                </div>

                {/* Quick Persona Access Callout */}
                <div className="pt-2 text-center text-xs text-gray-500 border-t border-gray-100">
                  <span className="text-[11px]">Testing as an evaluator? Try 1-click Demo Roles in top bar.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROBLEM AND SOLUTION SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('problem.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B24]">
            {t('problem.title')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('problem.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-base font-bold text-gray-900">{t('problem.item1Title')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('problem.item1Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-base font-bold text-gray-900">{t('problem.item2Title')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('problem.item2Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-base font-bold text-gray-900">{t('problem.item3Title')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('problem.item3Desc')}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="text-base font-bold text-gray-900">{t('problem.item4Title')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('problem.item4Desc')}</p>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM MODULES SECTION */}
      <section className="bg-gray-100/60 py-20 px-4 sm:px-6 lg:px-8 border-y border-gray-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {t('modules.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B24]">
              {t('modules.title')}
            </h2>
            <p className="text-sm text-gray-600">
              Integrated civic tools for village welfare, complaint resolution, and public utility monitoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: GramConnect (Active MVP) */}
            <div className="bg-white rounded-xl border-2 border-emerald-600/30 shadow-md p-6 flex flex-col justify-between space-y-4 hover:border-emerald-600 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 font-bold" />
                  </div>
                  <span className="text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {t('modules.gramConnect.tag')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('modules.gramConnect.title')}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t('modules.gramConnect.desc')}
                </p>
              </div>
              <Link
                to="/schemes"
                className="pt-3 border-t text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-between"
              >
                <span>Explore 5+ Verified Schemes</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Smart Panchayat (Active MVP) */}
            <div className="bg-white rounded-xl border-2 border-amber-500/40 shadow-md p-6 flex flex-col justify-between space-y-4 hover:border-amber-500 transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 font-bold" />
                  </div>
                  <span className="text-[11px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    {t('modules.smartPanchayat.tag')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('modules.smartPanchayat.title')}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t('modules.smartPanchayat.desc')}
                </p>
              </div>
              <Link
                to="/complaint"
                className="pt-3 border-t text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center justify-between"
              >
                <span>Report Grievance Confidentially</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 3: JalWatch */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center">
                    <Droplet className="w-5 h-5 font-bold" />
                  </div>
                  <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {t('modules.jalWatch.tag')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('modules.jalWatch.title')}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t('modules.jalWatch.desc')}
                </p>
              </div>
              <Link
                to="/modules"
                className="pt-3 border-t text-xs font-bold text-sky-800 hover:text-sky-950 flex items-center justify-between"
              >
                <span>Report Water Issue</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 4: WorkVerify AI */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Eye className="w-5 h-5 font-bold" />
                  </div>
                  <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {t('modules.workVerify.tag')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('modules.workVerify.title')}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t('modules.workVerify.desc')}
                </p>
              </div>
              <Link
                to="/modules"
                className="pt-3 border-t text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-between"
              >
                <span>View Road & Drain Projects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 5: KrishiAlert */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Sprout className="w-5 h-5 font-bold" />
                  </div>
                  <span className="text-[11px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {t('modules.krishiAlert.tag')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {t('modules.krishiAlert.title')}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t('modules.krishiAlert.desc')}
                </p>
              </div>
              <Link
                to="/modules"
                className="pt-3 border-t text-xs font-bold text-amber-800 hover:text-amber-950 flex items-center justify-between"
              >
                <span>Read Weather & Crop Advisories</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {t('howItWorks.badge')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B24]">
            {t('howItWorks.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#174C3C] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-bold text-gray-900">{t('howItWorks.step1')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('howItWorks.step1Desc')}</p>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#174C3C] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-sm font-bold text-gray-900">{t('howItWorks.step2')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('howItWorks.step2Desc')}</p>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#174C3C] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-sm font-bold text-gray-900">{t('howItWorks.step3')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('howItWorks.step3Desc')}</p>
          </div>

          <div className="relative bg-white p-6 rounded-xl border border-gray-200 shadow-xs space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#174C3C] text-white text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="text-sm font-bold text-gray-900">{t('howItWorks.step4')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{t('howItWorks.step4Desc')}</p>
          </div>
        </div>
      </section>

      {/* 5. TRUST AND TRANSPARENCY SECTION */}
      <section className="bg-emerald-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
              {t('trust.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {t('trust.title')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero Conflict-of-Interest Architecture</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t('trust.point1')}
              </p>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Citizen Confidentiality & Whistleblower Safety</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t('trust.point2')}
              </p>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-bold text-xs">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Direct Statutory Desk Coordination</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t('trust.point3')}
              </p>
            </div>

            <div className="bg-white/5 p-5 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Grounded Gazettes & Statutory Rules</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {t('trust.point4')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
