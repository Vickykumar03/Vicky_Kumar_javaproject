import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  ShieldAlert, CheckCircle2, Clock, FileText, 
  RefreshCw, Send, AlertTriangle, Eye, X, Building 
} from 'lucide-react';

export const AuthorityDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHi = i18n.language === 'hi';

  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any | null>(null);

  // Status update form
  const [newStatus, setNewStatus] = useState<string>('investigation_in_progress');
  const [actionReport, setActionReport] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await api.getAuthorityComplaints();
      setComplaints(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setUpdating(true);
    try {
      await api.updateAuthorityStatus(selectedComplaint.id, {
        new_status: newStatus,
        action_taken_report: actionReport || null,
        remarks: remarks || null,
      });
      setSelectedComplaint(null);
      setActionReport('');
      setRemarks('');
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#4C1D95] to-[#2E1065] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-purple-400/20 text-purple-300 text-xs px-2.5 py-0.5 rounded font-medium mb-2 border border-purple-400/30">
              <Building className="w-3.5 h-3.5" />
              <span>प्रशासनिक निगरानी एवं सतर्कता डेस्क (Vigilance & Authority Desk)</span>
            </div>
            <h1 className="text-2xl font-bold">
              {user?.full_name || 'Block Development Officer'} (Chandil)
            </h1>
            <p className="text-xs text-purple-100/90 mt-1">
              Review grievances filed against Panchayat administration with conflict-of-interest isolation.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
                <span>Assigned Grievance Investigation Queue</span>
              </h2>
              <span className="text-xs text-gray-500">
                Total assigned complaints: {complaints.length}
              </span>
            </div>
            <button
              onClick={fetchComplaints}
              className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading complaints...</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400 bg-gray-50 rounded-lg">
              No pending complaints assigned to your administrative desk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold border-b">
                  <tr>
                    <th className="p-3">Reference No.</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Accused Person / Post</th>
                    <th className="p-3">Amount Demanded</th>
                    <th className="p-3">Conflict Safeguard</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-purple-50/20">
                      <td className="p-3 font-mono font-bold text-gray-900">{c.tracking_number}</td>
                      <td className="p-3 capitalize font-medium">{c.category.replace(/_/g, ' ')}</td>
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{c.accused_name || 'Designated Official'}</div>
                        <div className="text-[10px] text-gray-500">{c.accused_designation}</div>
                      </td>
                      <td className="p-3 font-semibold text-gray-900">
                        {c.amount_demanded > 0 ? `₹${c.amount_demanded.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3">
                        {c.is_conflict_flagged ? (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                            Escrow Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">Standard</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded font-semibold capitalize">
                          {c.current_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="px-3 py-1 bg-purple-800 hover:bg-purple-900 text-white rounded font-medium text-xs flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
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

      {/* Review & Status Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden my-8">
            <div className="bg-purple-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <span className="text-xs text-purple-200 uppercase font-mono">
                  Reviewing: {selectedComplaint.tracking_number}
                </span>
                <h3 className="text-base font-bold capitalize">
                  {selectedComplaint.category.replace(/_/g, ' ')} ({selectedComplaint.scheme_or_service || 'Public Service'})
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 text-purple-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Accused & Incident Summary */}
              <div className="bg-gray-50 p-4 rounded-lg border space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block">Accused Official / Intermediary:</span>
                    <strong className="text-gray-900">{selectedComplaint.accused_name || 'Designated Rep'} ({selectedComplaint.accused_designation})</strong>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Alleged Amount Demanded:</span>
                    <strong className="text-rose-700">₹{selectedComplaint.amount_demanded.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="pt-2 border-t text-gray-700">
                  <span className="text-gray-500 block mb-1">Citizen Statement:</span>
                  <p className="bg-white p-2.5 rounded border border-gray-200 leading-relaxed">
                    {selectedComplaint.description}
                  </p>
                </div>
              </div>

              {/* Action Taken Report (ATR) Update Form */}
              <form onSubmit={handleStatusUpdate} className="space-y-4 pt-2 border-t">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px] text-purple-900">
                  Submit Official Action Taken Report (ATR)
                </h4>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Update Status To</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-gray-300 bg-white"
                  >
                    <option value="under_review">Under Formal Review</option>
                    <option value="investigation_in_progress">Investigation in Progress (Show Cause Issued)</option>
                    <option value="action_reported">Action Reported (Recovery / Disciplinary Notice)</option>
                    <option value="closed">Closed (Resolution Complete & Verified)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Formal Action Taken Report (ATR - Visible to Citizen on Timeline)
                  </label>
                  <textarea
                    value={actionReport}
                    onChange={(e) => setActionReport(e.target.value)}
                    rows={3}
                    placeholder="e.g. Inquiry committee conducted spot verification in Chilgu Panchayat. Show cause notice served to accused representative. Installment credited to beneficiary."
                    className="w-full p-2.5 rounded-lg border border-gray-300 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Internal Confidential Vigilance Remarks
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Internal reference notes for Chandil BDO / ACB file"
                    className="w-full p-2.5 rounded-lg border border-gray-300"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className="px-4 py-2 rounded text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-purple-800 text-white font-semibold rounded-lg hover:bg-purple-900 shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{updating ? 'Submitting...' : 'Submit Action Report'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
