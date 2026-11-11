import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { 
  Search, ShieldAlert, CheckCircle2, Clock, AlertCircle, 
  Send, RefreshCw, FileText, CornerDownRight, ArrowUpRight 
} from 'lucide-react';

export const TrackComplaintPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const isHi = i18n.language === 'hi';

  const [refInput, setRefInput] = useState<string>(searchParams.get('ref') || 'GS-2026-CH-1001');
  const [complaint, setComplaint] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feedback form
  const [feedback, setFeedback] = useState('');
  const [requestReopen, setRequestReopen] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const fetchComplaint = async (trackingNum: string) => {
    if (!trackingNum.trim()) return;
    setLoading(true);
    setError(null);
    setFeedbackSuccess(null);
    try {
      const data = await api.trackComplaint(trackingNum.trim());
      setComplaint(data);
    } catch (err: any) {
      setError(err.message || 'Reference number not found.');
      setComplaint(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      setRefInput(refFromUrl);
      fetchComplaint(refFromUrl);
    } else {
      fetchComplaint('GS-2026-CH-1001');
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaint(refInput);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setFeedbackLoading(true);
    try {
      await api.submitComplaintFeedback(complaint.id, {
        feedback,
        request_reopen: requestReopen,
      });
      setFeedbackSuccess(
        requestReopen
          ? (isHi ? 'मामला पुनः खोलने का अनुरोध दर्ज किया गया।' : 'Case reopening requested successfully.')
          : (isHi ? 'आपकी प्रतिक्रिया सफलतापूर्वक दर्ज की गई।' : 'Feedback submitted successfully.')
      );
      setFeedback('');
      fetchComplaint(complaint.tracking_number);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const formatStatus = (st: string) => {
    const statusMap: Record<string, { en: string; hi: string; color: string }> = {
      submitted: { en: 'Submitted', hi: 'दर्ज (Submitted)', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      acknowledged: { en: 'Internally Acknowledged', hi: 'स्वीकृत (Acknowledged)', color: 'bg-sky-100 text-sky-800 border-sky-200' },
      under_review: { en: 'Under Review', hi: 'समीक्षाधीन (Under Review)', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      referred_to_authority: { en: 'Referred to Authority', hi: 'सक्षम प्राधिकारी को प्रेषित', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
      investigation_in_progress: { en: 'Investigation in Progress', hi: 'जांच जारी (Inquiry in Progress)', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      action_reported: { en: 'Action Taken Reported (ATR)', hi: 'कार्रवाई रिपोर्ट दर्ज (ATR)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      awaiting_citizen_verification: { en: 'Awaiting Citizen Verification', hi: 'नागरिक सत्यापन प्रतीक्षित', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      closed: { en: 'Closed', hi: 'निस्तारित / बंद (Closed)', color: 'bg-gray-100 text-gray-800 border-gray-200' },
      reopened: { en: 'Reopened by Citizen', hi: 'नागरिक द्वारा पुनः खोला गया', color: 'bg-rose-100 text-rose-800 border-rose-200' },
      escalated: { en: 'Escalated to Vigilance', hi: 'उच्च सतर्कता को अग्रेषित', color: 'bg-red-100 text-red-800 border-red-200' },
    };
    return statusMap[st] || { en: st, hi: st, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      {/* Banner */}
      <section className="bg-gradient-to-b from-[#174C3C] to-[#123D30] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('track.title')}
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            {t('track.subtitle')}
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder={t('track.inputPlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white text-gray-900 text-sm shadow-sm focus:outline-hidden focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-[#174C3C] font-semibold text-sm rounded-lg shadow transition cursor-pointer"
            >
              {t('track.trackBtn')}
            </button>
          </form>

          {/* Suggested Sample Refs */}
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-200/80">
            <span>{isHi ? 'नमूना संदर्भ संख्या:' : 'Try Sample Numbers:'}</span>
            <button
              type="button"
              onClick={() => { setRefInput('GS-2026-CH-1001'); fetchComplaint('GS-2026-CH-1001'); }}
              className="underline hover:text-amber-300 font-mono"
            >
              GS-2026-CH-1001
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => { setRefInput('GS-2026-CH-1002'); fetchComplaint('GS-2026-CH-1002'); }}
              className="underline hover:text-amber-300 font-mono"
            >
              GS-2026-CH-1002
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {loading && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md border p-8">
            <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-xs text-gray-500 font-medium">{t('common.loading')}</p>
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl shadow-md text-center text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <div className="font-semibold">{error}</div>
            <p className="text-xs text-gray-500 mt-1">
              Please verify that the complaint tracking number is typed correctly.
            </p>
          </div>
        )}

        {!loading && complaint && (
          <div className="space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b">
                <div>
                  <span className="text-[11px] font-mono uppercase text-gray-500">
                    Tracking Reference
                  </span>
                  <h2 className="text-xl font-mono font-bold text-gray-900">
                    {complaint.tracking_number}
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-3 py-1 font-semibold rounded-full border ${formatStatus(complaint.current_status).color}`}>
                    {isHi ? formatStatus(complaint.current_status).hi : formatStatus(complaint.current_status).en}
                  </span>
                  {complaint.is_conflict_flagged && (
                    <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                      <span>{t('track.conflictBadge')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Grid Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <span className="text-gray-500 block mb-0.5">{t('complaint.category')}</span>
                  <span className="font-semibold text-gray-800 capitalize">{complaint.category}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <span className="text-gray-500 block mb-0.5">{t('track.routedTo')}</span>
                  <span className="font-semibold text-emerald-900">{complaint.routed_authority_name}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <span className="text-gray-500 block mb-0.5">Incident Date / Accused</span>
                  <span className="font-semibold text-gray-800">
                    {complaint.incident_date || 'N/A'} • {complaint.accused_designation || 'Panchayat Representative'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs leading-relaxed text-gray-700 bg-emerald-50/30 p-3.5 rounded-lg border border-emerald-100">
                <strong className="block text-emerald-950 mb-1 font-semibold">
                  {isHi ? 'दर्ज शिकायत का सारांश:' : 'Grievance Substance:'}
                </strong>
                <p>{complaint.description}</p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 space-y-6">
              <h3 className="text-sm font-bold text-[#172B24] uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>{t('track.timeline')}</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                {complaint.timeline && complaint.timeline.map((step: any, idx: number) => (
                  <div key={idx} className="relative">
                    {/* Timeline bullet */}
                    <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200"></div>

                    <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/80 space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center text-xs gap-1">
                        <span className="font-bold text-emerald-900 capitalize text-sm">
                          {isHi ? formatStatus(step.new_status).hi : formatStatus(step.new_status).en}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          {new Date(step.created_at).toLocaleString()}
                        </span>
                      </div>

                      {step.remarks && (
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {step.remarks}
                        </p>
                      )}

                      {/* Official Action Taken Report (ATR) */}
                      {step.action_taken_report && (
                        <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-lg text-xs mt-2">
                          <strong className="text-emerald-900 block font-semibold mb-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{isHi ? 'आधिकारिक कार्रवाई रिपोर्ट (Action Taken Report):' : 'Official Action Taken Report (ATR):'}</span>
                          </strong>
                          <p className="text-emerald-800 leading-relaxed font-mono">
                            {step.action_taken_report}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Citizen Feedback & Reopen Section */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 space-y-4">
              <h3 className="text-sm font-bold text-[#172B24] uppercase tracking-wider flex items-center gap-2">
                <CornerDownRight className="w-4 h-4 text-amber-600" />
                <span>{t('track.citizenFeedback')}</span>
              </h3>

              <p className="text-xs text-gray-600">
                {isHi
                  ? 'यदि आप हुई कार्रवाई से संतुष्ट नहीं हैं, तो आप अपनी प्रतिक्रिया दर्ज कर सकते हैं या मामले को उच्च सतर्कता अधिकारी के समक्ष पुनः खोलने का अनुरोध कर सकते हैं।'
                  : 'If you are unsatisfied with the investigation or action taken, submit your response below or request case reopening.'}
              </p>

              {complaint.citizen_feedback && (
                <div className="bg-gray-50 border p-3 rounded-lg text-xs text-gray-700">
                  <span className="font-bold text-gray-900 block mb-1">
                    {isHi ? 'पूर्व में दर्ज प्रतिक्रिया:' : 'Previously Logged Feedback:'}
                  </span>
                  <p>{complaint.citizen_feedback}</p>
                </div>
              )}

              {feedbackSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs">
                  {feedbackSuccess}
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder={t('track.feedbackPlaceholder')}
                  className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  required
                />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-rose-800 cursor-pointer bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                    <input
                      type="checkbox"
                      checked={requestReopen}
                      onChange={(e) => setRequestReopen(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span>{t('track.requestReopen')}</span>
                  </label>

                  <button
                    type="submit"
                    disabled={feedbackLoading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#174C3C] hover:bg-[#0E3227] rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{feedbackLoading ? t('common.loading') : t('track.submitFeedback')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
