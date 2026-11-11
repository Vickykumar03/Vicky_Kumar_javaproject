const API_BASE = '/api/v1';

export function getAuthToken(): string | null {
  return localStorage.getItem('gramsaksham_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('gramsaksham_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('gramsaksham_token');
  localStorage.removeItem('gramsaksham_user');
}

export function getStoredUser(): any | null {
  const user = localStorage.getItem('gramsaksham_user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user: any): void {
  localStorage.setItem('gramsaksham_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) =>
    request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<any>('/auth/me'),

  // Geography
  getGeographyTree: () => request<any[]>('/geography/tree'),
  getPanchayats: () => request<any[]>('/geography/panchayats'),

  // Schemes
  getSchemes: (category?: string, query?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (query) params.append('q', query);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<any[]>(`/schemes${qs}`);
  },
  getSchemeById: (id: string) => request<any>(`/schemes/${id}`),
  assessEligibility: (data: any) =>
    request<any>('/schemes/assess', { method: 'POST', body: JSON.stringify(data) }),
  getMyAssessments: () => request<any[]>('/schemes/assessments/my'),

  // Applications
  requestApplicationHelp: (data: any) =>
    request<any>('/applications', { method: 'POST', body: JSON.stringify(data) }),
  getMyApplications: () => request<any[]>('/applications/my'),
  getApplicationDetails: (id: string) => request<any>(`/applications/${id}`),
  updateApplicationStatus: (id: string, data: any) =>
    request<any>(`/applications/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Complaints
  submitComplaint: (data: any) =>
    request<any>('/complaints', { method: 'POST', body: JSON.stringify(data) }),
  uploadEvidence: (complaintId: string, formData: FormData) =>
    request<any>(`/complaints/${complaintId}/evidence`, { method: 'POST', body: formData }),
  trackComplaint: (trackingNumber: string) =>
    request<any>(`/complaints/track/${encodeURIComponent(trackingNumber)}`),
  getMyComplaints: () => request<any[]>('/complaints/my'),
  submitComplaintFeedback: (complaintId: string, data: { feedback: string; request_reopen: boolean }) =>
    request<any>(`/complaints/${complaintId}/feedback`, { method: 'POST', body: JSON.stringify(data) }),
  escalateComplaint: (complaintId: string, data: { reason: string; escalate_to_authority_id: string }) =>
    request<any>(`/complaints/${complaintId}/escalate`, { method: 'POST', body: JSON.stringify(data) }),

  // Citizen Dashboard & Profile
  getCitizenDashboard: () => request<any>('/citizen/dashboard-summary'),
  updateCitizenProfile: (data: any) =>
    request<any>('/citizen/profile', { method: 'PUT', body: JSON.stringify(data) }),
  updateHousehold: (data: any) =>
    request<any>('/citizen/household', { method: 'PUT', body: JSON.stringify(data) }),

  // Authority
  getAuthorityComplaints: () => request<any[]>('/authority/complaints'),
  updateAuthorityStatus: (complaintId: string, data: any) =>
    request<any>(`/authority/complaints/${complaintId}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAdminUsers: () => request<any[]>('/admin/users'),
  updateUserRole: (userId: string, role: string) =>
    request<any>(`/admin/users/${userId}/role?role=${encodeURIComponent(role)}`, { method: 'PUT' }),
  getAuthorities: () => request<any[]>('/admin/authorities'),
  createAuthority: (data: any) =>
    request<any>('/admin/authorities', { method: 'POST', body: JSON.stringify(data) }),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),

  // Modules
  getWaterReports: () => request<any[]>('/modules/jalwatch'),
  submitWaterReport: (data: any) =>
    request<any>('/modules/jalwatch', { method: 'POST', body: JSON.stringify(data) }),
  getInfrastructureProjects: () => request<any[]>('/modules/workverify'),
  getAgricultureAlerts: () => request<any[]>('/modules/krishialert'),
};
