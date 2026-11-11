import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  User, CheckCircle2, AlertTriangle, FileText, Activity, 
  ArrowRight, ShieldCheck, Clock, Settings, Home, Bell 
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHi = i18n.language === 'hi';

  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await api.getCitizenDashboard();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load citizen dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#174C3C] to-[#123D30] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded font-medium mb-2 border border-amber-400/30">
              <Home className="w-3.5 h-3.5" />
              <span>{isHi ? 'नागरिक पोर्टल • चांडिल प्रखंड' : 'Citizen Dashboard • Chandil Block'}</span>
            </div>
            <h1 className="text-2xl font-bold">
              {isHi ? `नमस्ते, ${user?.full_name || 'नागरिक'} जी` : `Welcome, ${user?.full_name || 'Citizen'}`}
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1">
              {isHi
                ? 'अपने परिवार की योजना पात्रता, आवेदन स्थिति एवं दर्ज शिकायतों की लाइव निगरानी करें।'
                : 'Manage your welfare eligibility, track scheme applications, and monitor filed grievances.'}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/schemes"
              className="bg-amber-400 hover:bg-amber-300 text-[#174C3C] text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              {t('hero.ctaSchemes')}
            </Link>
            <Link
              to="/complaint"
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-lg border border-white/20 transition"
            >
              {t('hero.ctaComplaint')}
            </Link>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* Profile Completion Card */}
        {summary && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-gray-700">
                  {isHi ? 'पारिवारिक प्रोफाइल पूर्णता (Profile Completion)' : 'Household Profile Completeness'}
                </span>
                <span className="font-bold text-emerald-800">{summary.profile_completion}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${summary.profile_completion}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                {isHi
                  ? 'सटीक योजना अनुशंसा और स्वतः पात्रता आकलन हेतु अपनी प्रोफाइल पूर्ण रखें।'
                  : 'Complete your profile for automated eligibility checks.'}
              </p>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">{isHi ? 'मेरी पात्रता जांच' : 'Assessments'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_assessments}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">{isHi ? 'सहायता आवेदन' : 'Applications'}</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_applications}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">{isHi ? 'दर्ज शिकायतें' : 'Grievances'}</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{summary.total_complaints}</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">{isHi ? 'विजिलेंस सुरक्षा' : 'Conflict Safeguard'}</span>
                <ShieldCheck className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-sm font-bold text-purple-900">{isHi ? '100% सक्रिय' : '100% Active'}</div>
            </div>
          </div>
        )}

        {/* Two-Column Section: Complaints & Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Complaints */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{isHi ? 'मेरी दर्ज शिकायतें' : 'My Filed Grievances'}</span>
              </h2>
              <Link to="/complaint" className="text-xs text-emerald-700 font-semibold hover:underline">
                {isHi ? '+ नई शिकायत' : '+ New Complaint'}
              </Link>
            </div>

            {summary?.recent_complaints?.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 rounded-lg">
                {isHi ? 'कोई सक्रिय शिकायत दर्ज नहीं है।' : 'No complaints logged yet.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary?.recent_complaints?.map((c: any) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-lg border border-gray-100 hover:border-emerald-200 bg-gray-50/50 hover:bg-emerald-50/20 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-900">{c.tracking_number}</span>
                        {c.is_conflict_flagged && (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.2 rounded border border-amber-300">
                            Conflict Escrow
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 capitalize">
                        {c.category} • {c.incident_date || 'Recent'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-gray-700 capitalize bg-white px-2 py-1 rounded border shadow-2xs">
                        {c.status.replace(/_/g, ' ')}
                      </span>
                      <Link
                        to={`/track?ref=${encodeURIComponent(c.tracking_number)}`}
                        className="text-xs text-emerald-700 hover:text-emerald-900 p-1"
                        title="View Live Timeline"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{isHi ? 'आवेदन सहायता अनुरोध' : 'Scheme Applications'}</span>
              </h2>
              <Link to="/schemes" className="text-xs text-emerald-700 font-semibold hover:underline">
                {isHi ? 'योजनाएं खोजें →' : 'Find Schemes →'}
              </Link>
            </div>

            {summary?.recent_applications?.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 bg-gray-50 rounded-lg">
                {isHi ? 'कोई सक्रिय आवेदन अनुरोध नहीं है।' : 'No assistance requests yet.'}
              </div>
            ) : (
              <div className="space-y-2.5">
                {summary?.recent_applications?.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        {isHi ? a.scheme_name_hi : a.scheme_name_en}
                      </h4>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Ref: {a.official_reference_number || 'GramSaksham Assistance'}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 capitalize">
                      {a.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Eligibility Assessments */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{isHi ? 'हाल के पात्रता आकलन (Eligibility Assessments History)' : 'Recent Eligibility Assessments'}</span>
          </h2>

          {summary?.recent_assessments?.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-lg">
              {isHi
                ? 'अभी तक कोई पात्रता जांच नहीं की गई है। सरकारी योजनाओं की पात्रता जांचने हेतु योजना निर्देशिका देखें।'
                : 'No eligibility assessments run yet. Use GramConnect to test your eligibility.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {summary?.recent_assessments?.map((asmt: any) => (
                <div key={asmt.id} className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/40 space-y-2">
                  <div className="font-bold text-xs text-gray-800 line-clamp-1">
                    {isHi ? asmt.scheme_name_hi : asmt.scheme_name_en}
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className={`px-2 py-0.5 rounded font-semibold ${
                      asmt.status === 'potentially_eligible'
                        ? 'bg-emerald-100 text-emerald-800'
                        : asmt.status === 'ineligible'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {asmt.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-400 font-mono">
                      {new Date(asmt.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
