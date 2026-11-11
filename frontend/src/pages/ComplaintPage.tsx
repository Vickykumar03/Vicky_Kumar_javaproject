import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { 
  AlertTriangle, ShieldAlert, FileUp, CheckCircle, 
  Copy, ExternalLink, ArrowRight, Lock, MapPin, Info 
} from 'lucide-react';

export const ComplaintPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isHi = i18n.language === 'hi';

  const [panchayats, setPanchayats] = useState<any[]>([]);
  const [selectedPanchayatId, setSelectedPanchayatId] = useState<string>('');
  const [villages, setVillages] = useState<any[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string>('');

  // Form State
  const [category, setCategory] = useState<string>('bribery');
  const [schemeOrService, setSchemeOrService] = useState<string>('PMAY-G (आवास योजना)');
  const [incidentDate, setIncidentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [accusedName, setAccusedName] = useState<string>('');
  const [accusedDesignation, setAccusedDesignation] = useState<string>('Mukhiya');
  const [amountDemanded, setAmountDemanded] = useState<number | ''>(10000);
  const [paymentMade, setPaymentMade] = useState<boolean>(false);
  const [confidentiality, setConfidentiality] = useState<string>('confidential');
  const [description, setDescription] = useState<string>('');

  // Evidence file
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Load geography
  useEffect(() => {
    async function loadGeography() {
      try {
        const tree = await api.getGeographyTree();
        if (tree && tree.length > 0 && tree[0].blocks && tree[0].blocks.length > 0) {
          const chandilBlock = tree[0].blocks.find((b: any) => b.name_en === 'Chandil') || tree[0].blocks[0];
          setPanchayats(chandilBlock.panchayats || []);
          if (chandilBlock.panchayats && chandilBlock.panchayats.length > 0) {
            setSelectedPanchayatId(chandilBlock.panchayats[0].id);
            setVillages(chandilBlock.panchayats[0].villages || []);
            if (chandilBlock.panchayats[0].villages.length > 0) {
              setSelectedVillageId(chandilBlock.panchayats[0].villages[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load geography tree', err);
      }
    }
    loadGeography();
  }, []);

  const handlePanchayatChange = (pId: string) => {
    setSelectedPanchayatId(pId);
    const found = panchayats.find((p) => p.id === pId);
    if (found && found.villages) {
      setVillages(found.villages);
      if (found.villages.length > 0) {
        setSelectedVillageId(found.villages[0].id);
      }
    } else {
      setVillages([]);
      setSelectedVillageId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError(isHi ? 'कृपया शिकायत का विवरण दर्ज करें।' : 'Please enter description of grievance.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const complaintRes = await api.submitComplaint({
        category,
        scheme_or_service: schemeOrService,
        panchayat_id: selectedPanchayatId || null,
        village_id: selectedVillageId || null,
        incident_date: incidentDate,
        accused_name: accusedName || null,
        accused_designation: accusedDesignation || null,
        amount_demanded: amountDemanded ? Number(amountDemanded) : 0,
        payment_made: paymentMade,
        confidentiality,
        description,
      });

      // Upload evidence if attached
      if (evidenceFile && complaintRes.id) {
        const formData = new FormData();
        formData.append('file', evidenceFile);
        formData.append('description', 'Submitted along with grievance form');
        try {
          await api.uploadEvidence(complaintRes.id, formData);
        } catch (uploadErr) {
          console.warn('Evidence upload notice', uploadErr);
        }
      }

      setSubmittedData(complaintRes);
    } catch (err: any) {
      setError(err.message || 'Failed to submit grievance');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (submittedData?.tracking_number) {
      navigator.clipboard.writeText(submittedData.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      {/* Banner */}
      <section className="bg-gradient-to-b from-[#174C3C] to-[#123D30] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isHi ? 'स्मार्ट पंचायत नागरिक सतर्कता' : 'Smart Panchayat Anti-Corruption Desk'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('complaint.title')}
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            {t('complaint.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Safety & Conflict-of-Interest Guarantee Callout */}
        <div className="bg-amber-50 border-2 border-amber-300/80 rounded-xl p-4 sm:p-5 shadow-sm mb-6 flex items-start gap-3.5 text-amber-950">
          <ShieldAlert className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-sm text-amber-900">
              {t('complaint.noticeTitle')}
            </h3>
            <p className="leading-relaxed text-amber-900/90">
              {t('complaint.noticeDesc')}
            </p>
          </div>
        </div>

        {submittedData ? (
          /* Submission Success Card */
          <div className="bg-white rounded-xl shadow-lg border border-emerald-200 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {t('complaint.successTitle')}
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto">
                {isHi
                  ? 'आपकी शिकायत सुरक्षित रूप से दर्ज कर ली गई है। निम्नलिखित संदर्भ संख्या को सुरक्षित रखें:'
                  : 'Your complaint has been securely registered. Keep the following reference number safe for status tracking:'}
              </p>
            </div>

            {/* Tracking Reference Pill */}
            <div className="inline-flex items-center gap-3 bg-gray-50 border-2 border-dashed border-emerald-400 px-6 py-3 rounded-xl">
              <span className="font-mono text-lg font-bold text-emerald-900 tracking-wider">
                {submittedData.tracking_number}
              </span>
              <button
                onClick={copyToClipboard}
                className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'कॉपी' : 'Copy')}</span>
              </button>
            </div>

            {/* Routing Details */}
            <div className="bg-emerald-50/60 border border-emerald-200 p-4 rounded-xl max-w-lg mx-auto text-left text-xs space-y-1.5 text-emerald-950">
              <div className="flex justify-between">
                <span className="text-gray-600">{isHi ? 'सक्षम जांच प्राधिकारी:' : 'Investigating Authority:'}</span>
                <span className="font-semibold">{submittedData.routed_authority_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isHi ? 'हितों के टकराव की स्थिति:' : 'Conflict Safeguard:'}</span>
                <span className="font-semibold text-emerald-800">
                  {submittedData.is_conflict_flagged
                    ? (isHi ? 'सुरक्षित (आरोपी प्रतिनिधि बाहर)' : 'Escrow Protected (Accused Excluded)')
                    : (isHi ? 'सामान्य प्रशासनिक संज्ञान' : 'Administrative Desk')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{isHi ? 'गोपनीयता स्तर:' : 'Confidentiality:'}</span>
                <span className="font-semibold capitalize">{submittedData.confidentiality}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                onClick={() => navigate(`/track?ref=${encodeURIComponent(submittedData.tracking_number)}`)}
                className="px-6 py-2.5 bg-[#174C3C] hover:bg-[#0E3227] text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <span>{isHi ? 'लाइव टाइमलाइन पर ट्रैक करें' : 'Track on Live Timeline'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setSubmittedData(null); setDescription(''); }}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition"
              >
                {isHi ? 'अन्य शिकायत दर्ज करें' : 'Lodge Another Grievance'}
              </button>
            </div>
          </div>
        ) : (
          /* Grievance Submission Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 space-y-6">
            {/* Step 1: Category & Scheme */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider pb-2 border-b flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">1</span>
                <span>{isHi ? 'शिकायत का विषय एवं संबंधित सेवा' : 'Grievance Nature & Associated Service'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.category')} *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="bribery">{isHi ? 'रिश्वत की मांग / भ्रष्टाचार (Bribery / Corruption)' : 'Bribery & Corruption'}</option>
                    <option value="signature_money">{isHi ? 'हस्ताक्षर या सत्यापन के लिए धन की मांग' : 'Money Demanded for Official Signatures'}</option>
                    <option value="pmay_rejection">{isHi ? 'आवास योजना (PMAY-G) में अनुचित अस्वीकृति' : 'Unfair PMAY-G Housing Rejection'}</option>
                    <option value="sanitation_rejection">{isHi ? 'शौचालय (SBM-G) प्रोत्साहन राशि में बाधा' : 'Unfair Sanitation Scheme Rejection'}</option>
                    <option value="missing_names">{isHi ? 'पात्र लाभार्थी सूची से नाम गायब करना' : 'Missing Beneficiary Names'}</option>
                    <option value="misuse_of_funds">{isHi ? 'सार्वजनिक धन / 15वें वित्त आयोग का दुरुपयोग' : 'Misuse of Public Village Funds'}</option>
                    <option value="negligence">{isHi ? 'पंचायत कार्यालय की अनुपस्थिति या लापरवाही' : 'Panchayat Administrative Negligence'}</option>
                    <option value="other">{isHi ? 'अन्य प्रशासनिक समस्या' : 'Other Administrative Problem'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.schemeOrService')}
                  </label>
                  <input
                    type="text"
                    value={schemeOrService}
                    onChange={(e) => setSchemeOrService(e.target.value)}
                    placeholder="e.g. PMAY-G, SBM-G, Abua Awas, Death/Birth Certificate"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Location in Chandil */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider pb-2 border-b flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                <span>{isHi ? 'घटना का स्थान (चांडिल प्रखंड)' : 'Incident Location (Chandil Block Pilot)'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.panchayat')} *
                  </label>
                  <select
                    value={selectedPanchayatId}
                    onChange={(e) => handlePanchayatChange(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    {panchayats.map((p) => (
                      <option key={p.id} value={p.id}>
                        {isHi ? p.name_hi : p.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.village')}
                  </label>
                  <select
                    value={selectedVillageId}
                    onChange={(e) => setSelectedVillageId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    {villages.map((v) => (
                      <option key={v.id} value={v.id}>
                        {isHi ? v.name_hi : v.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.incidentDate')}
                  </label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Person Complained Against */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider pb-2 border-b flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">3</span>
                <span>{isHi ? 'किसके विरुद्ध शिकायत है? (आरोपी का विवरण)' : 'Person / Official Alleged Against'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.accusedName')}
                  </label>
                  <input
                    type="text"
                    value={accusedName}
                    onChange={(e) => setAccusedName(e.target.value)}
                    placeholder={isHi ? 'नाम (यदि ज्ञात हो)' : 'Name (if known)'}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.accusedDesignation')} *
                  </label>
                  <select
                    value={accusedDesignation}
                    onChange={(e) => setAccusedDesignation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Mukhiya">{isHi ? 'मुखिया (Gram Panchayat Mukhiya)' : 'Gram Panchayat Mukhiya'}</option>
                    <option value="Panchayat Secretary">{isHi ? 'पंचायत सचिव (Panchayat Secretary)' : 'Panchayat Secretary'}</option>
                    <option value="Rojgar Sevak">{isHi ? 'रोजगार सेवक (MGNREGA Rojgar Sevak)' : 'MGNREGA Rojgar Sevak'}</option>
                    <option value="Ward Member">{isHi ? 'वार्ड सदस्य (Ward Member)' : 'Ward Member'}</option>
                    <option value="Block Development Officer">{isHi ? 'प्रखंड स्तरीय कर्मचारी' : 'Block Level Staff'}</option>
                    <option value="Contractor / Intermediary">{isHi ? 'बिचौलिया / दलाल / ठेकेदार' : 'Intermediary / Contractor'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.amountDemanded')}
                  </label>
                  <input
                    type="number"
                    value={amountDemanded}
                    onChange={(e) => setAmountDemanded(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="10000"
                    min="0"
                    step="500"
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t('complaint.paymentMade')}
                  </label>
                  <div className="flex items-center gap-4 pt-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMade"
                        checked={!paymentMade}
                        onChange={() => setPaymentMade(false)}
                      />
                      <span>{isHi ? 'नहीं (मांग की गई परंतु भुगतान नहीं किया)' : 'No (Demanded but refused)'}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMade"
                        checked={paymentMade}
                        onChange={() => setPaymentMade(true)}
                      />
                      <span>{isHi ? 'हाँ (मजबूरी में भुगतान करना पड़ा)' : 'Yes (Forced to pay)'}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Description & Evidence */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider pb-2 border-b flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">4</span>
                <span>{isHi ? 'घटना का विवरण एवं साक्ष्य' : 'Incident Details & Evidence'}</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('complaint.description')} *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={t('complaint.descriptionPlaceholder')}
                  className="w-full text-xs p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  required
                />
              </div>

              {/* Optional Evidence Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {isHi ? 'साक्ष्य संलग्न करें (ऐच्छिक - फ़ोटो, पर्ची, ऑडियो या दस्तावेज़)' : 'Attach Evidence (Optional - JPG, PNG, PDF, Audio)'}
                </label>
                <div className="border border-dashed border-gray-300 rounded-lg p-3 bg-gray-50 flex items-center gap-3">
                  <FileUp className="w-5 h-5 text-gray-400 shrink-0" />
                  <input
                    type="file"
                    onChange={(e) => setEvidenceFile(e.target.files ? e.target.files[0] : null)}
                    className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              {/* Confidentiality Preference */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t('complaint.confidentiality')} *</span>
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-start gap-2.5 p-2 rounded-lg border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-emerald-50/40">
                    <input
                      type="radio"
                      name="confidentiality"
                      value="confidential"
                      checked={confidentiality === 'confidential'}
                      onChange={(e) => setConfidentiality(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="text-gray-900 block">{t('complaint.confidential')}</strong>
                      <span className="text-[11px] text-gray-500">
                        {isHi
                          ? 'आपकी पहचान आरोपी गांव प्रतिनिधि से गुप्त रखी जाएगी, केवल जांच अधिकारी जानेंगे।'
                          : 'Your identity is strictly withheld from local accused representatives.'}
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 p-2 rounded-lg border border-gray-200 bg-gray-50/50 cursor-pointer hover:bg-emerald-50/40">
                    <input
                      type="radio"
                      name="confidentiality"
                      value="anonymous"
                      checked={confidentiality === 'anonymous'}
                      onChange={(e) => setConfidentiality(e.target.value)}
                      className="mt-0.5"
                    />
                    <div>
                      <strong className="text-gray-900 block">{t('complaint.anonymous')}</strong>
                      <span className="text-[11px] text-gray-500">
                        {isHi ? 'कोई व्यक्तिगत जानकारी एकत्र नहीं की जाएगी।' : 'No personal details recorded.'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            <div className="pt-4 border-t flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-[#174C3C] hover:bg-[#0E3227] text-white font-bold text-sm rounded-lg shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span>{loading ? t('common.loading') : t('complaint.submit')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
