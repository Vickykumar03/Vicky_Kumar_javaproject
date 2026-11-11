import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  BarChart3, Users, ShieldAlert, FileText, Settings, 
  RefreshCw, CheckCircle, Database, Shield, Lock, Eye 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isHi = i18n.language === 'hi';

  const [stats, setStats] = useState<any | null>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [authorities, setAuthorities] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'authorities' | 'logs'>('overview');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, authsData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAuthorities(),
        api.getAuditLogs(),
      ]);
      setStats(statsData);
      setUsersList(usersData);
      setAuthorities(authsData);
      setAuditLogs(logsData);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      fetchAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-16">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#172B24] to-[#0A1612] text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded font-medium mb-2 border border-amber-400/30">
              <Shield className="w-3.5 h-3.5" />
              <span>प्रशासनिक नियंत्रण केंद्र (State & District Administration)</span>
            </div>
            <h1 className="text-2xl font-bold">
              GramSaksham Administrator Console
            </h1>
            <p className="text-xs text-gray-300 mt-1">
              Live database metrics, authority routing rules, and DPDP security audit logs for Chandil Pilot.
            </p>
          </div>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-xs px-3 py-1.5 rounded-lg border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-2 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#174C3C] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 System Overview & Live Stats
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'users' ? 'bg-[#174C3C] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 User & Role Access ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('authorities')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'authorities' ? 'bg-[#174C3C] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🏛️ Authority Routing Directory ({authorities.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg transition cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#174C3C] text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            🔒 Security Audit Trail ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Overview & Actual Database Statistics */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-xs text-gray-500 block mb-1">Total Registered Citizens</span>
                <div className="text-2xl font-bold text-gray-900">{stats.total_citizens}</div>
                <span className="text-[10px] text-emerald-700">Chandil Block Resident Accounts</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-xs text-gray-500 block mb-1">Total Filed Grievances</span>
                <div className="text-2xl font-bold text-gray-900">{stats.total_complaints}</div>
                <span className="text-[10px] text-blue-700">Real Database Records</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs bg-amber-50/40 border-amber-200">
                <span className="text-xs text-amber-900 font-semibold block mb-1">Conflict Flagged (Escrow)</span>
                <div className="text-2xl font-bold text-amber-800">{stats.conflict_flagged_complaints}</div>
                <span className="text-[10px] text-amber-700">Against Mukhiya / Local Officials</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                <span className="text-xs text-gray-500 block mb-1">Active Verified Schemes</span>
                <div className="text-2xl font-bold text-gray-900">{stats.total_schemes}</div>
                <span className="text-[10px] text-emerald-700">Central & Jharkhand Gazettes</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase text-gray-700">Complaint Status Breakdown</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pending Acknowledgment:</span>
                    <strong className="text-gray-800">{stats.pending_complaints}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Under Inquiry / Review:</span>
                    <strong className="text-purple-700">{stats.under_review_complaints}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Action Taken Reported (ATR):</span>
                    <strong className="text-emerald-700">{stats.action_reported_complaints}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resolved & Closed:</span>
                    <strong className="text-gray-800">{stats.closed_complaints}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase text-gray-700">Welfare & Assistance Activity</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Eligibility Assessments Executed:</span>
                    <strong className="text-emerald-700">{stats.total_assessments}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Assistance Requests Registered:</span>
                    <strong className="text-blue-700">{stats.total_applications}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active Village Facilitators:</span>
                    <strong className="text-gray-800">{stats.total_facilitators}</strong>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs space-y-2">
                <h4 className="text-xs font-bold uppercase text-gray-700">Additional Module Reports</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">JalWatch Water Reports:</span>
                    <strong className="text-sky-700">{stats.total_water_reports}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">WorkVerify Projects Monitored:</span>
                    <strong className="text-emerald-700">{stats.total_infrastructure_projects}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">KrishiAlert Bulletins:</span>
                    <strong className="text-amber-700">Active</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Users & Roles Table */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              System Registered Accounts & Role Permissions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold border-b">
                  <tr>
                    <th className="p-3">User Name</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Current Role</th>
                    <th className="p-3">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-3 font-semibold text-gray-900">{u.full_name}</td>
                      <td className="p-3 text-gray-600 font-mono">{u.email}</td>
                      <td className="p-3 text-gray-500">{u.phone || '—'}</td>
                      <td className="p-3">
                        <span className="capitalize font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="text-xs p-1 rounded border border-gray-300 bg-white"
                        >
                          <option value="citizen">Citizen</option>
                          <option value="facilitator">Facilitator</option>
                          <option value="authority">Authority</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Authority Routing Directory */}
        {activeTab === 'authorities' && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Statutory Authority Directory & Complaint Routing Desks
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold border-b">
                  <tr>
                    <th className="p-3">Authority / Office</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Designation</th>
                    <th className="p-3">Hierarchy</th>
                    <th className="p-3">Official Email</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {authorities.map((auth) => (
                    <tr key={auth.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-900">{auth.name_en}</td>
                      <td className="p-3 text-gray-600">{auth.department}</td>
                      <td className="p-3 text-gray-700">{auth.designation}</td>
                      <td className="p-3 uppercase text-[10px] font-bold text-emerald-800">{auth.hierarchy_level}</td>
                      <td className="p-3 text-gray-500 font-mono">{auth.contact_email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Security Audit Logs */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-700" />
              <span>DPDP Compliance Security & Integrity Audit Trail</span>
            </h3>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] font-semibold border-b sticky top-0">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-3 text-gray-800">{log.user_email || 'System'}</td>
                      <td className="p-3 font-bold text-emerald-800">{log.action}</td>
                      <td className="p-3 text-gray-600">{log.target_type} ({log.target_id || '—'})</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
