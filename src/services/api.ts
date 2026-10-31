import {
  Report,
  SearchResponse,
  Statistics,
  User,
  Dispute,
  NotificationItem,
  AuditLogItem,
} from '../types/index.ts';

const TOKEN_KEY = 'scamalert_bd_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ success: false, message: 'Server communication error' }));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data as T;
}

// Authentication
export const api = {
  auth: {
    register: (userData: { name: string; email: string; password: string; phone?: string }) =>
      request<{ success: boolean; token: string; user: User; message: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials: { email: string; password: string }) =>
      request<{ success: boolean; token: string; user: User; message: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    logout: () =>
      request<{ success: boolean; message: string }>('/api/auth/logout', { method: 'POST' }),
    getMe: () => request<{ success: boolean; user: User }>('/api/auth/me'),
  },

  // Search
  search: {
    query: (q: string, category: string = 'all', page: number = 1, limit: number = 10) =>
      request<SearchResponse>(
        `/api/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}&page=${page}&limit=${limit}`
      ),
    suggestions: (q: string) =>
      request<{ success: boolean; suggestions: Array<{ label: string; category: string; type: string }> }>(
        `/api/search/suggestions?q=${encodeURIComponent(q)}`
      ),
    history: () =>
      request<{ success: boolean; history: Array<{ query: string; category: string; timestamp: string }> }>(
        '/api/search/history'
      ),
  },

  // Reports
  reports: {
    getAll: (params: { status?: string; category?: string; limit?: number } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.category) searchParams.set('category', params.category);
      if (params.limit) searchParams.set('limit', String(params.limit));
      return request<{ success: boolean; total: number; reports: Report[] }>(
        `/api/reports?${searchParams.toString()}`
      );
    },
    getById: (id: string) => request<{ success: boolean; report: Report }>(`/api/reports/${id}`),
    create: (formData: any) =>
      request<{ success: boolean; message: string; reportId: string; report: Report }>('/api/reports', {
        method: 'POST',
        body: JSON.stringify(formData),
      }),
    getMyReports: () =>
      request<{ success: boolean; total: number; reports: Report[] }>('/api/reports/my-reports'),
    submitDispute: (reportId: string, disputeData: any) =>
      request<{ success: boolean; message: string; disputeId: string; reportStatus: string }>(
        `/api/reports/${reportId}/dispute`,
        {
          method: 'POST',
          body: JSON.stringify(disputeData),
        }
      ),
    addEvidence: (reportId: string, evidenceData: { fileUrl: string; originalFilename?: string }) =>
      request<{ success: boolean; message: string; evidence: any }>(`/api/reports/${reportId}/evidence`, {
        method: 'POST',
        body: JSON.stringify(evidenceData),
      }),
  },

  // Health and public stats
  stats: {
    get: () =>
      request<{ status: string; service: string; stats: Statistics }>('/api/health'),
  },

  // User notifications
  notifications: {
    getAll: () =>
      request<{ success: boolean; total: number; unreadCount: number; notifications: NotificationItem[] }>(
        '/api/notifications'
      ),
    markAsRead: (id: string) =>
      request<{ success: boolean; message: string }>(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      }),
    markAllRead: () =>
      request<{ success: boolean; message: string }>('/api/notifications/read-all', {
        method: 'PATCH',
      }),
  },

  // Admin & Moderation
  admin: {
    getDashboard: () =>
      request<{ success: boolean; stats: Statistics }>('/api/admin/dashboard'),
    getReports: (params: { status?: string; category?: string; search?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.set('status', params.status);
      if (params.category) searchParams.set('category', params.category);
      if (params.search) searchParams.set('search', params.search);
      return request<{ success: boolean; total: number; reports: Report[] }>(
        `/api/admin/reports?${searchParams.toString()}`
      );
    },
    updateReportStatus: (id: string, data: { status: string; reviewNotes?: string; rejectionReason?: string }) =>
      request<{ success: boolean; message: string; report: Report }>(`/api/admin/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    updateReportDetails: (id: string, data: { productOrService?: string; incidentDescription?: string; isPublic?: boolean }) =>
      request<{ success: boolean; message: string; report: Report }>(`/api/admin/reports/${id}/details`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getUsers: () =>
      request<{ success: boolean; total: number; users: User[] }>('/api/admin/users'),
    updateUserStatus: (id: string, data: { isActive?: boolean; role?: string }) =>
      request<{ success: boolean; message: string; user: any }>(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getDisputes: () =>
      request<{ success: boolean; total: number; disputes: Dispute[] }>('/api/admin/disputes'),
    resolveDispute: (id: string, data: { status: string; adminNotes?: string }) =>
      request<{ success: boolean; message: string; dispute: Dispute; report?: Report }>(
        `/api/admin/disputes/${id}/resolve`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      ),
    getAuditLogs: () =>
      request<{ success: boolean; total: number; logs: AuditLogItem[] }>('/api/admin/audit-logs'),
  },
};
