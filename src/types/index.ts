export type UserRole = 'user' | 'moderator' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  unreadNotificationsCount?: number;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export type ReportCategory =
  | 'phone'
  | 'whatsapp'
  | 'facebook'
  | 'website'
  | 'bkash'
  | 'nagad'
  | 'rocket'
  | 'other';

export type ReportStatus =
  | 'pending_review'
  | 'under_review'
  | 'verified_incident'
  | 'disputed'
  | 'rejected';

export interface EvidenceFile {
  id: string;
  originalFilename: string;
  storageKey?: string;
  mimeType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface ReportIdentifiers {
  phone?: string;
  whatsapp?: string;
  facebookPageName?: string;
  facebookUrl?: string;
  websiteUrl?: string;
  bkashNumber?: string;
  nagadNumber?: string;
  rocketNumber?: string;
  normalizedSearchTokens?: string[];
}

export interface Report {
  id: string;
  reportId: string;
  submittedBy: {
    userId?: string;
    name: string;
    email?: string;
    isAnonymous?: boolean;
  };
  category: ReportCategory;
  identifiers: ReportIdentifiers;
  primaryIdentifier?: string;
  rawIdentifier?: string;
  productOrService: string;
  transactionAmount: number;
  transactionDate: string;
  paymentMethod: string;
  transactionReference?: string;
  incidentDescription: string;
  evidenceFiles: EvidenceFile[];
  status: ReportStatus;
  reviewNotes?: string;
  rejectionReason?: string;
  corroboratingCount: number;
  disputeCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResultItem {
  id: string;
  reportId: string;
  category: ReportCategory;
  productOrService: string;
  primaryIdentifier: string;
  rawIdentifier?: string;
  identifiers: ReportIdentifiers;
  status: ReportStatus;
  corroboratingReportsCount: number;
  disputeCount: number;
  evidenceCount: number;
  hasEvidence: boolean;
  transactionAmountBDT: number;
  lastReportDate: string;
  incidentSummary: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  normalizedQuery: string;
  category: string;
  total: number;
  page: number;
  totalPages: number;
  results: SearchResultItem[];
  disclaimer: string;
}

export interface Statistics {
  totalReports: number;
  verifiedIncidents: number;
  pendingReports: number;
  underReviewReports: number;
  disputedReports: number;
  totalSearches: number;
  communityMembers: number;
  totalAmountLossBDT: number;
  totalUsers?: number;
  totalDisputes?: number;
  pendingDisputes?: number;
  auditLogsCount?: number;
}

export interface Dispute {
  id: string;
  disputeId: string;
  reportId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantRole: string;
  reason: string;
  details: string;
  supportingEvidence: Array<{
    id: string;
    originalFilename: string;
    fileUrl: string;
  }>;
  status: 'pending' | 'under_review' | 'resolved_upheld' | 'resolved_removed';
  adminNotes?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'report_status' | 'dispute_update' | 'admin_alert' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  targetType: 'report' | 'user' | 'dispute' | 'system';
  description: string;
  metadata?: any;
  createdAt: string;
}
