import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { X, CheckSquare, Square, FileText, Send, CheckCircle } from 'lucide-react';

interface Props {
  scheme: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplicationHelpModal: React.FC<Props> = ({ scheme, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHi = i18n.language === 'hi';

  const [refNumber, setRefNumber] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<string[]>(scheme.required_documents || []);
  const [consent, setConsent] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDoc = (doc: string) => {
    if (selectedDocs.includes(doc)) {
      setSelectedDocs(selectedDocs.filter(d => d !== doc));
    } else {
      setSelectedDocs([...selectedDocs, doc]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setError(isHi ? 'कृपया सहमति प्रदान करें।' : 'Please check citizen consent.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.requestApplicationHelp({
        scheme_id: scheme.id,
        official_reference_number: refNumber || null,
        documents_checklist: selectedDocs,
        citizen_consent: consent,
        notes: notes || null,
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit assistance request. Please login first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-200 overflow-hidden my-8">
        <div className="bg-[#174C3C] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-amber-300 uppercase tracking-wider font-semibold">
              {isHi ? 'आवेदन सहायता अनुरोध' : 'Application Assistance Request'}
            </div>
            <h2 className="text-base font-bold">
              {isHi ? scheme.name_hi : scheme.name_en}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-800">
                {isHi ? 'सहायता अनुरोध सफलतापूर्वक दर्ज!' : 'Assistance Request Registered!'}
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {isHi
                  ? 'चांडिल प्रखंड के ग्रामसक्षम सहायक या पंचायत फैसिलिटेटर द्वारा दस्तावेज़ पूर्ण करने में सहयोग दिया जाएगा।'
                  : 'A GramSaksham facilitator or village representative will assist in completing your document submission.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!user && (
                <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200">
                  {isHi
                    ? 'कृपया सहायता अनुरोध दर्ज करने हेतु पहले नागरिक खाते से लॉग इन करें (शीर्ष मेनू से डेमो लॉगिन का उपयोग कर सकते हैं)।'
                    : 'Please log in with a citizen account to log assistance requests (you can use Demo Persona in the top bar).'}
                </div>
              )}

              {/* Document Checklist */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  {isHi ? 'आवश्यक दस्तावेज़ चेकलिस्ट (तैयार दस्तावेज़ों पर टिक करें):' : 'Documents Checklist (Check available documents):'}
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto border p-2.5 rounded-lg bg-gray-50 text-xs">
                  {scheme.required_documents?.map((doc: string, idx: number) => {
                    const isChecked = selectedDocs.includes(doc);
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleDoc(doc)}
                        className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer transition"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 shrink-0" />
                        )}
                        <span className={isChecked ? 'text-gray-900 font-medium' : 'text-gray-500'}>
                          {doc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Voluntary Ref Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHi ? 'आधिकारिक संदर्भ / आवेदन संख्या (यदि पहले से हो - ऐच्छिक)' : 'Official Reference / Acknowledgement Number (Optional)'}
                </label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="e.g. AWAAS-JH-2026-98124"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHi ? 'विशेष अनुरोध / टिप्पणी' : 'Assistance Notes or Village Landmark'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={isHi ? 'उदा: चिलगू पंचायत भवन में शिविर के दौरान जमा करना है...' : 'e.g., need assistance scanning documents at Chandil CSC...'}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {/* Consent */}
              <div className="bg-gray-50 p-2.5 rounded-lg border text-xs text-gray-600 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="consent" className="cursor-pointer">
                  {isHi
                    ? 'मैं स्वेच्छा से आवेदन प्रक्रिया में मार्गदर्शन हेतु अपनी जानकारी ग्रामसक्षम फैसिलिटेटर के साथ साझा करने की सहमति देता/देती हूँ।'
                    : 'I voluntarily consent to share my application information with an assigned facilitator for procedural guidance.'}
                </label>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                  {error}
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#174C3C] hover:bg-[#0E3227] rounded-md shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isHi ? 'अनुरोध दर्ज करें' : 'Submit Assistance Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
