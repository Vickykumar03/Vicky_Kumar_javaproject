import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client';
import { 
  Droplet, Eye, Sprout, AlertCircle, CheckCircle2, 
  MapPin, Plus, Send, RefreshCw, Clock, ExternalLink 
} from 'lucide-react';

export const ModulesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [activeTab, setActiveTab] = useState<'jalwatch' | 'workverify' | 'krishialert'>('jalwatch');

  // JalWatch State
  const [waterReports, setWaterReports] = useState<any[]>([]);
  const [showWaterForm, setShowWaterForm] = useState(false);
  const [issueType, setIssueType] = useState('handpump_broken');
  const [landmark, setLandmark] = useState('');
  const [waterDesc, setWaterDesc] = useState('');
  const [waterLoading, setWaterLoading] = useState(false);

  // WorkVerify State
  const [projects, setProjects] = useState<any[]>([]);

  // KrishiAlert State
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [wData, pData, aData] = await Promise.all([
        api.getWaterReports(),
        api.getInfrastructureProjects(),
        api.getAgricultureAlerts(),
      ]);
      setWaterReports(wData);
      setProjects(pData);
      setAlerts(aData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWaterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWaterLoading(true);
    try {
      await api.submitWaterReport({
        issue_type: issueType,
        location_landmark: landmark,
        description: waterDesc,
      });
      setShowWaterForm(false);
      setLandmark('');
      setWaterDesc('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Please log in as a citizen to submit a water report.');
    } finally {
      setWaterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      <section className="bg-gradient-to-b from-[#174C3C] to-[#123D30] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded font-medium mb-3 border border-amber-400/30">
            <span>विस्तारित नागरिक मॉड्यूल्स (Platform Modules)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            GramSaksham Governance Modules
          </h1>
          <p className="mt-2 text-sm text-emerald-100/90 max-w-2xl">
            Specialized village utility tracking: drinking water security, public works monitoring, and agricultural advisories for Chandil Block.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* Module Switcher Tabs */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('jalwatch')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'jalwatch'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>1. JalWatch — Drinking Water ({waterReports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('workverify')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'workverify'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. WorkVerify AI — Public Works ({projects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('krishialert')}
            className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'krishialert'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>3. KrishiAlert — Agriculture & Weather ({alerts.length})</span>
          </button>
        </div>

        {/* Tab 1: JalWatch */}
        {activeTab === 'jalwatch' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-sky-600" />
                  <span>JalWatch — Rural Water Supply Grievance Redressal</span>
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Report broken handpumps, pipeline leakages, and water contamination in Chandil villages.
                </p>
              </div>
              <button
                onClick={() => setShowWaterForm(!showWaterForm)}
                className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showWaterForm ? 'Close Form' : 'Report Water Issue'}</span>
              </button>
            </div>

            {/* Submit Water Issue Form */}
            {showWaterForm && (
              <form onSubmit={handleWaterSubmit} className="bg-white rounded-xl shadow-md border border-sky-200 p-6 space-y-4 text-xs">
                <h4 className="font-bold text-sky-900 text-sm">Lodge Drinking Water Problem</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Problem Type *</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-300 bg-white"
                    >
                      <option value="handpump_broken">Broken / Non-functional Handpump (खराब चापाकल)</option>
                      <option value="pipeline_leakage">Drinking Water Pipeline Leakage (पाइपलाइन रिसाव)</option>
                      <option value="contaminated_water">Contaminated / Muddy Water (दूषित/मटमैला पानी)</option>
                      <option value="supply_interruption">Supply Interruption in Jal Jeevan Mission</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Landmark / Tola Location *</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Chilgu Primary School, Chandil"
                      className="w-full p-2.5 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={waterDesc}
                    onChange={(e) => setWaterDesc(e.target.value)}
                    rows={2}
                    placeholder="Describe how many days it has been non-functional..."
                    className="w-full p-2.5 rounded-lg border border-gray-300"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="submit"
                    disabled={waterLoading}
                    className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold rounded-lg"
                  >
                    {waterLoading ? 'Submitting...' : 'Submit Water Report'}
                  </button>
                </div>
              </form>
            )}

            {/* List of Water Reports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {waterReports.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 capitalize">
                      {item.issue_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 capitalize">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{item.location_landmark}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.description}</p>
                  <div className="text-[10px] text-gray-400 font-mono border-t pt-2">
                    Reported on {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: WorkVerify AI */}
        {activeTab === 'workverify' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-700" />
                <span>WorkVerify AI — Rural Public Works Monitoring</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Transparent oversight of village road construction, community halls, and check dams with geotagged site verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {proj.project_type}
                      </span>
                      <span className="text-xs font-bold text-emerald-900">
                        ₹{proj.sanctioned_amount.toLocaleString()} Sanctioned
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{proj.title_en}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Agency: {proj.contractor_or_agency || 'Block Works Department'}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span>Work Completed:</span>
                        <span className="text-emerald-800 font-bold">{proj.progress_percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${proj.progress_percentage}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 border-t pt-2 flex justify-between">
                      <span>Status: {proj.status}</span>
                      <span>Site Verification Active</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: KrishiAlert */}
        {activeTab === 'krishialert' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-amber-700" />
                <span>KrishiAlert — Verified Agriculture Advisories</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Grounded agro-climatic advisories sourced from Birsa Agricultural University & IMD Regional Meteorological Centre, Ranchi.
              </p>
            </div>

            <div className="space-y-4">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-6 rounded-xl border shadow-xs space-y-3 ${
                    alert.severity === 'warning'
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-amber-900 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
                      {alert.category}
                    </span>
                    <span className="text-gray-500 font-mono">
                      Source: {alert.source}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">
                    {isHi ? alert.title_hi : alert.title_en}
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {isHi ? alert.content_hi : alert.content_en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
