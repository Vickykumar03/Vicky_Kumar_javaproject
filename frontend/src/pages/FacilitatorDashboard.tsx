import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Users, FileCheck, CheckCircle2, Clock, FileText, RefreshCw, Send } from 'lucide-react';

export const FacilitatorDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHi = i18n.language === 'hi';

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('submitted_to_office');
  const [notes, setNotes] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await api.getMyApplications();
      setApplications(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setUpdating(true);
    try {
      await api.updateApplicationStatus(selectedApp.id, {
        status: newStatus,
        notes,
      });
      setSelectedApp(null);
      setNotes('');
      fetchApps();
    } catch (err: any) {
      alert(err.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      <section className="bg-gradient-to-b from-[#1E3A8A] to-[#172554] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-blue-400/20 text-blue-300 text-xs px-2.5 py-0.5 rounded font-medium mb-2 border border-blue-400/30">
              <Users className="w-3.5 h-3.5" />
              <span>{isHi ? 'ग्रामसक्षम सहायक / वीएलई डैशबोर्ड' : 'Facilitator & Village Assistant Desk'}</span>
            </div>
            <h1 className="text-2xl font-bold">
              {user?.full_name || 'Village Facilitator'} (CSC Chandil)
            </h1>
            <p className="text-xs text-blue-100/90 mt-1">
              Assist rural citizens in verifying documents, uploading files, and tracking applications.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>Assigned Citizen Welfare Applications (Chandil Block)</span>
            </h2>
            <button
              onClick={fetchApps}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 bg-gray-50 rounded-lg">
              No application assistance requests currently in your queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold border-b">
                  <tr>
                    <th className="p-3">Scheme Name</th>
                    <th className="p-3">Reference / Token</th>
                    <th className="p-3">Documents Check</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-blue-50/20">
                      <td className="p-3 font-semibold text-gray-900">{app.scheme_name_en}</td>
                      <td className="p-3 font-mono text-gray-600">{app.official_reference_number || 'N/A'}</td>
                      <td className="p-3 text-gray-500">{app.documents_checklist?.length || 0} items verified</td>
                      <td className="p-3">
                        <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-semibold capitalize">
                          {app.current_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-medium text-xs cursor-pointer"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Update Application: {selectedApp.scheme_name_en}
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 bg-white"
                >
                  <option value="assistance_requested">Assistance Requested</option>
                  <option value="documents_pending">Documents Pending from Citizen</option>
                  <option value="submitted_to_office">Submitted to Chandil Block Office</option>
                  <option value="under_scrutiny">Under Technical Scrutiny</option>
                  <option value="approved">Approved / Sanctioned</option>
                  <option value="rejected">Rejected with Reasons</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Progress Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Verified Aadhaar and land receipt; submitted to Chandil BDO housing desk..."
                  className="w-full p-2.5 rounded-lg border border-gray-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-3 py-1.5 rounded text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-1.5 bg-blue-700 text-white font-semibold rounded hover:bg-blue-800"
                >
                  {updating ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
