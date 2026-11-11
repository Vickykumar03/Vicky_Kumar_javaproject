import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { 
  X, CheckCircle, AlertCircle, HelpCircle, XCircle, 
  ArrowRight, RefreshCw, FileText, ExternalLink, ShieldCheck 
} from 'lucide-react';

interface Props {
  scheme: any;
  onClose: () => void;
  onRequestAssistance: (scheme: any) => void;
}

export const EligibilityCheckerModal: React.FC<Props> = ({ scheme, onClose, onRequestAssistance }) => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [income, setIncome] = useState<number>(72000);
  const [houseType, setHouseType] = useState<string>('kutcha');
  const [hasToilet, setHasToilet] = useState<boolean>(false);
  const [landholding, setLandholding] = useState<number>(0.5);
  const [socialCategory, setSocialCategory] = useState<string>('OBC');
  const [hasElderly, setHasElderly] = useState<boolean>(false);
  const [hasDisabled, setHasDisabled] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.assessEligibility({
        scheme_id: scheme.id,
        annual_income: Number(income),
        house_type: houseType,
        has_toilet: hasToilet,
        landholding_acres: Number(landholding),
        social_category: socialCategory,
        has_elderly_or_widow: hasElderly,
        has_differently_abled: hasDisabled,
      });
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Assessment failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'potentially_eligible':
        return (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                {isHi ? 'प्रारंभिक रूप से पात्र (Potentially Eligible)' : 'Potentially Eligible'}
              </div>
              <p className="text-xs text-emerald-700">
                {isHi
                  ? 'दिए गए विवरण के अनुसार आप इस योजना के प्राथमिक पात्रता मानकों को पूरा करते हैं।'
                  : 'Based on your criteria, your household satisfies statutory preliminary eligibility rules.'}
              </p>
            </div>
          </div>
        );
      case 'ineligible':
        return (
          <div className="bg-rose-50 border border-rose-300 text-rose-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                {isHi ? 'वर्तमान नियमों में अपात्र (Appears Ineligible)' : 'Appears Ineligible Under Available Rules'}
              </div>
              <p className="text-xs text-rose-700">
                {isHi
                  ? 'आपके कुछ विवरण इस योजना के अपवर्जन (Disqualification) मानकों में आते हैं।'
                  : 'Certain conditions in your profile trigger statutory exclusion criteria for this scheme.'}
              </p>
            </div>
          </div>
        );
      case 'requires_official_verification':
        return (
          <div className="bg-sky-50 border border-sky-300 text-sky-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-sky-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                {isHi ? 'प्रखंड भौतिक सत्यापन आवश्यक (Requires Official Verification)' : 'Requires Official Verification'}
              </div>
              <p className="text-xs text-sky-700">
                {isHi
                  ? 'आप आंशिक पात्रता पूरी करते हैं। चांडिल प्रखंड विकास कार्यालय द्वारा स्थलीय सत्यापन आवश्यक है।'
                  : 'Your household meets basic criteria, but specific exclusions require in-person verification at the Block Office.'}
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                {isHi ? 'अधिक जानकारी आवश्यक (More Information Required)' : 'More Information Required'}
              </div>
              <p className="text-xs text-amber-700">
                {isHi ? 'सटीक परिणाम हेतु कुछ महत्वपूर्ण विवरण भरने शेष हैं।' : 'Key verification points need to be completed.'}
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#174C3C] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <div className="text-xs text-amber-300 uppercase tracking-wider font-semibold">
              {isHi ? 'ग्रामकनेक्ट नियम-आधारित पात्रता जांच' : 'GramConnect Rule-Based Eligibility Assessment'}
            </div>
            <h2 className="text-lg font-bold">
              {isHi ? scheme.name_hi : scheme.name_en}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-emerald-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {!result ? (
            <form onSubmit={handleAssess} className="space-y-4">
              <div className="text-xs text-gray-500 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  {isHi
                    ? 'यह आकलन भारत सरकार एवं झारखंड सरकार के आधिकारिक मानकों पर आधारित है। ग्रामसक्षम किसी आधिकारिक स्वीकृति का दावा नहीं करता है।'
                    : 'This assessment calculates statutory eligibility against verified Central and Jharkhand rules. GramSaksham does not claim to officially approve benefits.'}
                </span>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* House Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHi ? 'वर्तमान आवास की स्थिति' : 'Current Housing Condition'}
                  </label>
                  <select
                    value={houseType}
                    onChange={(e) => setHouseType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="kutcha">{isHi ? 'कच्चा मकान (मिट्टी / खपरैल / फूस)' : 'Kutcha (Mud/Thatch wall & roof)'}</option>
                    <option value="homeless">{isHi ? 'बेघर / कोई पक्का आश्रय नहीं' : 'Homeless / No shelter'}</option>
                    <option value="semi_pucca">{isHi ? 'अर्ध-पक्का (कच्ची दीवार / टिन शेड)' : 'Semi-Pucca (Tin roof / brick)'}</option>
                    <option value="pucca">{isHi ? 'पक्का मकान (कंक्रीट आरसीसी छत)' : 'Pucca (Permanent concrete house)'}</option>
                  </select>
                </div>

                {/* Income */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHi ? 'वार्षिक पारिवारिक आय (₹)' : 'Annual Household Income (₹)'}
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    placeholder="72000"
                    min="0"
                    step="5000"
                  />
                </div>

                {/* Sanitation Toilet */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHi ? 'घर में चालू व्यक्तिगत शौचालय है?' : 'Does house have an active toilet?'}
                  </label>
                  <select
                    value={hasToilet ? 'yes' : 'no'}
                    onChange={(e) => setHasToilet(e.target.value === 'yes')}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="no">{isHi ? 'नहीं (खुले में शौच / शौचालय विहीन)' : 'No (Defecation in open / no latrine)'}</option>
                    <option value="yes">{isHi ? 'हाँ (व्यक्तिगत घरेलू शौचालय उपलब्ध है)' : 'Yes (Individual latrine available)'}</option>
                  </select>
                </div>

                {/* Landholding */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHi ? 'कृषि/आवासीय भूमि (एकड़)' : 'Landholding (Acres)'}
                  </label>
                  <input
                    type="number"
                    value={landholding}
                    onChange={(e) => setLandholding(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    step="0.1"
                    min="0"
                  />
                </div>

                {/* Social Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {isHi ? 'सामाजिक श्रेणी' : 'Social Category'}
                  </label>
                  <select
                    value={socialCategory}
                    onChange={(e) => setSocialCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="ST">{isHi ? 'अनुसूचित जनजाति (ST)' : 'Scheduled Tribe (ST)'}</option>
                    <option value="SC">{isHi ? 'अनुसूचित जाति (SC)' : 'Scheduled Caste (SC)'}</option>
                    <option value="OBC">{isHi ? 'अन्य पिछड़ा वर्ग (OBC)' : 'Other Backward Class (OBC)'}</option>
                    <option value="General">{isHi ? 'सामान्य (General)' : 'General Category'}</option>
                  </select>
                </div>

                {/* Vulnerability factors */}
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasElderly}
                      onChange={(e) => setHasElderly(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isHi ? 'परिवार में वरिष्ठ नागरिक (60+) अथवा विधवा हैं' : 'Family has senior citizen (60+) or widow'}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDisabled}
                      onChange={(e) => setHasDisabled(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>{isHi ? 'परिवार में कोई सदस्य दिव्यांग (Disabled) हैं' : 'Family member is differently-abled'}</span>
                  </label>
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded border border-rose-200">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#174C3C] hover:bg-[#0E3227] rounded-lg shadow-sm flex items-center gap-2 transition"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isHi ? 'पात्रता की गणना करें' : 'Assess Eligibility'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Results View */
            <div className="space-y-5">
              {getStatusBadge(result.status)}

              {/* Explanation in Simple Language */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs leading-relaxed">
                <span className="font-bold text-gray-800 block mb-1">
                  {isHi ? 'विश्लेषण एवं सरल व्याख्या:' : 'Explanation in Simple Language:'}
                </span>
                <p className="text-gray-700">
                  {isHi ? result.explanation_hi : result.explanation_en}
                </p>
              </div>

              {/* Satisfied Criteria */}
              {result.satisfied_criteria && result.satisfied_criteria.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHi ? 'संतुष्ट पात्रता मानक (Criteria Satisfied)' : 'Criteria Satisfied'}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {result.satisfied_criteria.map((c: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2 rounded border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0"></span>
                        <div>
                          <strong className="text-emerald-950">{c.rule}: </strong>
                          <span>{isHi ? c.text_hi : c.text_en}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unsatisfied Criteria */}
              {result.unsatisfied_criteria && result.unsatisfied_criteria.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isHi ? 'अपवर्जन मानक (Criteria Not Satisfied / Disqualifications)' : 'Criteria Not Satisfied'}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-700">
                    {result.unsatisfied_criteria.map((c: any, i: number) => (
                      <li key={i} className="flex items-start gap-2 bg-rose-50/50 p-2 rounded border border-rose-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0"></span>
                        <div>
                          <strong className="text-rose-950">{c.rule}: </strong>
                          <span>{isHi ? c.text_hi : c.text_en}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Official Source */}
              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 pt-2 border-t">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {isHi ? 'वैधानिक स्रोत: ' : 'Statutory Reference: '}
                  <strong>{result.official_source}</strong>
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  {isHi ? '← विवरण बदलें' : '← Re-assess with other inputs'}
                </button>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-initial px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
                  >
                    {t('common.close')}
                  </button>
                  {result.status === 'potentially_eligible' && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRequestAssistance(scheme);
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                    >
                      <span>{isHi ? 'आवेदन सहायता प्राप्त करें' : 'Request Application Assistance'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
