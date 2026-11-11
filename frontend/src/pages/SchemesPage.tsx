import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { EligibilityCheckerModal } from '../components/EligibilityCheckerModal';
import { ApplicationHelpModal } from '../components/ApplicationHelpModal';
import { 
  Search, Filter, CheckCircle2, FileText, ArrowRight, 
  ExternalLink, Calendar, Building2, HelpCircle, Sparkles 
} from 'lucide-react';

export const SchemesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeCheckerScheme, setActiveCheckerScheme] = useState<any | null>(null);
  const [activeHelpScheme, setActiveHelpScheme] = useState<any | null>(null);

  const categories = [
    { id: 'all', labelEn: 'All Schemes', labelHi: 'सभी योजनाएं' },
    { id: 'Housing', labelEn: 'Housing (आवास)', labelHi: 'आवास (Housing)' },
    { id: 'Sanitation', labelEn: 'Sanitation (स्वच्छता)', labelHi: 'स्वच्छता (Sanitation)' },
    { id: 'Agriculture', labelEn: 'Agriculture (कृषि)', labelHi: 'कृषि (Agriculture)' },
    { id: 'Social Security', labelEn: 'Social Security (पेंशन)', labelHi: 'सामाजिक सुरक्षा (Pension)' },
  ];

  const fetchSchemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSchemes(category, searchQuery);
      setSchemes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSchemes();
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      {/* Header Banner */}
      <section className="bg-gradient-to-b from-[#174C3C] to-[#123D30] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHi ? 'ग्रामकनेक्ट योजना निर्देशिका' : 'GramConnect Verified Directory'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('schemes.title')}
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            {t('schemes.subtitle')}
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('schemes.searchPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm shadow-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#174C3C] font-semibold text-sm rounded-lg shadow transition cursor-pointer"
            >
              {isHi ? 'खोजें' : 'Search'}
            </button>
          </form>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Category Pills */}
        <div className="bg-white p-3 rounded-xl shadow-md border border-gray-200/80 flex items-center gap-2 overflow-x-auto mb-8">
          <Filter className="w-4 h-4 text-gray-400 ml-2 shrink-0 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                category === cat.id
                  ? 'bg-[#174C3C] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isHi ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs text-gray-500 font-medium">{t('common.loading')}</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-center text-sm my-6">
            {error}
          </div>
        )}

        {!loading && !error && schemes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-700">{t('common.empty')}</h3>
            <p className="text-xs text-gray-400 mt-1">Try another category or search keyword.</p>
          </div>
        )}

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white rounded-xl border border-gray-200 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Category & Verified Badge */}
                <div className="flex justify-between items-start gap-2">
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200/60">
                    {scheme.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('schemes.verifiedDate')} {scheme.last_verified_date}</span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-bold text-[#172B24] leading-snug">
                    {isHi ? scheme.name_hi : scheme.name_en}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="line-clamp-1">{isHi ? scheme.department_hi : scheme.department_en}</span>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                  {isHi ? scheme.description_hi : scheme.description_en}
                </p>

                {/* Key Benefits Callout */}
                <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-lg text-xs">
                  <div className="font-bold text-amber-900 flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t('schemes.benefits')}</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    {isHi ? scheme.benefits_hi : scheme.benefits_en}
                  </p>
                </div>

                {/* Eligibility Summary & Docs preview */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-gray-700 block mb-0.5">
                      {t('schemes.eligibilitySummary')}:
                    </span>
                    <p className="text-gray-600 line-clamp-2">
                      {isHi ? scheme.eligibility_summary_hi : scheme.eligibility_summary_en}
                    </p>
                  </div>
                  {scheme.required_documents && scheme.required_documents.length > 0 && (
                    <div className="pt-1">
                      <span className="font-semibold text-gray-700 block mb-1">
                        {t('schemes.requiredDocs')}:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scheme.required_documents.slice(0, 4).map((doc: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
                          >
                            {doc}
                          </span>
                        ))}
                        {scheme.required_documents.length > 4 && (
                          <span className="text-[10px] text-gray-400 self-center">
                            +{scheme.required_documents.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Bar Footer */}
              <div className="bg-gray-50/80 px-6 py-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                {scheme.official_website ? (
                  <a
                    href={scheme.official_website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-500 hover:text-emerald-800 flex items-center gap-1 transition"
                  >
                    <span>{t('schemes.officialWebsite')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveHelpScheme(scheme)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#174C3C] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                  >
                    {t('schemes.requestAssistance')}
                  </button>
                  <button
                    onClick={() => setActiveCheckerScheme(scheme)}
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#174C3C] hover:bg-[#0E3227] rounded-lg shadow-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>{t('schemes.checkEligibility')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeCheckerScheme && (
        <EligibilityCheckerModal
          scheme={activeCheckerScheme}
          onClose={() => setActiveCheckerScheme(null)}
          onRequestAssistance={(scheme) => {
            setActiveCheckerScheme(null);
            setActiveHelpScheme(scheme);
          }}
        />
      )}

      {activeHelpScheme && (
        <ApplicationHelpModal
          scheme={activeHelpScheme}
          onClose={() => setActiveHelpScheme(null)}
          onSuccess={() => setActiveHelpScheme(null)}
        />
      )}
    </div>
  );
};
