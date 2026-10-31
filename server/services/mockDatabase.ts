import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.ts';
import { ReportModel } from '../models/Report.ts';
import { DisputeModel } from '../models/Dispute.ts';
import { AuditLogModel } from '../models/AuditLog.ts';
import { NotificationModel } from '../models/Notification.ts';
import { normalizeBDPhone, normalizeFacebook, normalizeWebsite } from './normalizer.ts';

export interface DBUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'moderator' | 'admin';
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface DBReport {
  id: string;
  reportId: string;
  submittedBy: {
    userId?: string;
    name: string;
    email: string;
    isAnonymous?: boolean;
  };
  category: 'phone' | 'whatsapp' | 'facebook' | 'website' | 'bkash' | 'nagad' | 'rocket' | 'other';
  identifiers: {
    phone?: string;
    whatsapp?: string;
    facebookPageName?: string;
    facebookUrl?: string;
    websiteUrl?: string;
    bkashNumber?: string;
    nagadNumber?: string;
    rocketNumber?: string;
    normalizedSearchTokens: string[];
  };
  productOrService: string;
  transactionAmount: number;
  transactionDate: string;
  paymentMethod: string;
  transactionReference?: string;
  incidentDescription: string;
  evidenceFiles: Array<{
    id: string;
    originalFilename: string;
    storageKey: string;
    mimeType: string;
    fileSize: number;
    fileUrl: string;
    uploadedAt: string;
  }>;
  status: 'pending_review' | 'under_review' | 'verified_incident' | 'disputed' | 'rejected';
  reviewNotes?: string;
  rejectionReason?: string;
  corroboratingCount: number;
  disputeCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DBDispute {
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

export interface DBAuditLog {
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

export interface DBNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'report_status' | 'dispute_update' | 'admin_alert' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

class InAppDataStore {
  public users: DBUser[] = [];
  public reports: DBReport[] = [];
  public disputes: DBDispute[] = [];
  public auditLogs: DBAuditLog[] = [];
  public notifications: DBNotification[] = [];
  public searchCount: number = 14820;
  public searchHistory: Array<{ query: string; category: string; timestamp: string }> = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminPass = bcrypt.hashSync('admin123456', salt);
    const modPass = bcrypt.hashSync('moderator123456', salt);
    const userPass = bcrypt.hashSync('user123456', salt);

    // Initial users
    this.users = [
      {
        id: 'usr_admin_01',
        name: 'Tanvir Ahmed (Admin)',
        email: 'admin@scamalertbd.com',
        passwordHash: adminPass,
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        phone: '01711000001',
        isVerified: true,
        isActive: true,
        createdAt: '2026-01-10T10:00:00Z',
      },
      {
        id: 'usr_mod_01',
        name: 'Sadia Rahman (Moderator)',
        email: 'moderator@scamalertbd.com',
        passwordHash: modPass,
        role: 'moderator',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
        phone: '01811000002',
        isVerified: true,
        isActive: true,
        createdAt: '2026-01-15T12:00:00Z',
      },
      {
        id: 'usr_user_01',
        name: 'Rahim Chowdhury',
        email: 'rahim@example.com',
        passwordHash: userPass,
        role: 'user',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
        phone: '01911000003',
        isVerified: true,
        isActive: true,
        createdAt: '2026-02-01T09:30:00Z',
      },
    ];

    // Helper to generate search tokens
    const generateTokens = (identifiers: any): string[] => {
      const tokens = new Set<string>();
      if (identifiers.phone) {
        const norm = normalizeBDPhone(identifiers.phone);
        if (norm.canonical) tokens.add(norm.canonical);
        if (norm.normalized) tokens.add(norm.normalized);
      }
      if (identifiers.whatsapp) {
        const norm = normalizeBDPhone(identifiers.whatsapp);
        if (norm.canonical) tokens.add(norm.canonical);
      }
      if (identifiers.bkashNumber) {
        const norm = normalizeBDPhone(identifiers.bkashNumber);
        if (norm.canonical) tokens.add(norm.canonical);
      }
      if (identifiers.nagadNumber) {
        const norm = normalizeBDPhone(identifiers.nagadNumber);
        if (norm.canonical) tokens.add(norm.canonical);
      }
      if (identifiers.rocketNumber) {
        const norm = normalizeBDPhone(identifiers.rocketNumber);
        if (norm.canonical) tokens.add(norm.canonical);
      }
      if (identifiers.facebookPageName) {
        tokens.add(normalizeFacebook(identifiers.facebookPageName));
      }
      if (identifiers.facebookUrl) {
        tokens.add(normalizeFacebook(identifiers.facebookUrl));
      }
      if (identifiers.websiteUrl) {
        tokens.add(normalizeWebsite(identifiers.websiteUrl));
      }
      return Array.from(tokens).filter(Boolean);
    };

    // Reports with realistic Bangladeshi online fraud patterns
    this.reports = [
      {
        id: 'rep_001',
        reportId: 'SBD-2026-89102',
        submittedBy: {
          userId: 'usr_user_01',
          name: 'Rahim Chowdhury',
          email: 'rahim@example.com',
          isAnonymous: false,
        },
        category: 'bkash',
        identifiers: {
          phone: '01711987654',
          whatsapp: '01711987654',
          facebookPageName: 'Gadget Mart BD Official',
          facebookUrl: 'https://facebook.com/gadgetmartbd.official',
          websiteUrl: 'https://gadgetmartbd-shop.com',
          bkashNumber: '01711987654',
          nagadNumber: '',
          rocketNumber: '',
          normalizedSearchTokens: generateTokens({
            phone: '01711987654',
            whatsapp: '01711987654',
            facebookPageName: 'Gadget Mart BD Official',
            facebookUrl: 'https://facebook.com/gadgetmartbd.official',
            websiteUrl: 'https://gadgetmartbd-shop.com',
            bkashNumber: '01711987654',
          }),
        },
        productOrService: 'iPhone 15 Pro Max (Pre-order)',
        transactionAmount: 4500,
        transactionDate: '2026-02-18T14:30:00Z',
        paymentMethod: 'bKash Send Money',
        transactionReference: 'BK9X8721LA',
        incidentDescription:
          'Seller advertised an iPhone 15 Pro Max at 65,000 BDT claiming seasonal clearance stock from Singapore. Asked for 4,500 BDT advance booking and courier delivery charge via bKash personal number. Immediately after transaction receipt was sent, seller blocked phone number, WhatsApp and Facebook messenger. Multiple buyers reported identical behavior.',
        evidenceFiles: [
          {
            id: 'ev_01',
            originalFilename: 'bKash_Transfer_Screenshot_BK9X8721LA.png',
            storageKey: 'evidence/rep_001/bkash_trx.png',
            mimeType: 'image/png',
            fileSize: 342000,
            fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
            uploadedAt: '2026-02-18T15:00:00Z',
          },
          {
            id: 'ev_02',
            originalFilename: 'WhatsApp_Chat_Blocked_Proof.png',
            storageKey: 'evidence/rep_001/whatsapp_chat.png',
            mimeType: 'image/png',
            fileSize: 420000,
            fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
            uploadedAt: '2026-02-18T15:05:00Z',
          },
        ],
        status: 'verified_incident',
        reviewNotes:
          'Verified with 4 independent corroborating complaints. Police General Diary (GD) number filed at Dhanmondi Model Thana.',
        corroboratingCount: 4,
        disputeCount: 0,
        isPublic: true,
        createdAt: '2026-02-18T15:10:00Z',
        updatedAt: '2026-02-19T11:00:00Z',
      },
      {
        id: 'rep_002',
        reportId: 'SBD-2026-89103',
        submittedBy: {
          name: 'Tanzina Sultana',
          email: 'tanzina.s@gmail.com',
          isAnonymous: true,
        },
        category: 'facebook',
        identifiers: {
          phone: '01822334455',
          whatsapp: '01822334455',
          facebookPageName: 'Authentic Sneaker BD Outlet',
          facebookUrl: 'https://facebook.com/authenticsneakerbd',
          websiteUrl: '',
          bkashNumber: '',
          nagadNumber: '01822334455',
          rocketNumber: '',
          normalizedSearchTokens: generateTokens({
            phone: '01822334455',
            whatsapp: '01822334455',
            facebookPageName: 'Authentic Sneaker BD Outlet',
            facebookUrl: 'https://facebook.com/authenticsneakerbd',
            nagadNumber: '01822334455',
          }),
        },
        productOrService: 'Nike Air Jordan 1 High OG',
        transactionAmount: 3200,
        transactionDate: '2026-02-22T11:15:00Z',
        paymentMethod: 'Nagad Send Money',
        transactionReference: '7NA99102X',
        incidentDescription:
          'Ordered Nike sneakers advertised as 100% genuine import with cash on delivery. Seller demanded 50% advance (3,200 BDT) claiming Steadfast courier security deposit. After payment, received a torn box with fake plastic slippers. Seller deleted comments on Facebook and changed page name.',
        evidenceFiles: [
          {
            id: 'ev_03',
            originalFilename: 'Fake_Product_Received.jpg',
            storageKey: 'evidence/rep_002/product.jpg',
            mimeType: 'image/jpeg',
            fileSize: 512000,
            fileUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
            uploadedAt: '2026-02-22T12:00:00Z',
          },
        ],
        status: 'verified_incident',
        reviewNotes: 'Merchant page has high negative fraud reports. Nagad number confirmed flagged.',
        corroboratingCount: 2,
        disputeCount: 0,
        isPublic: true,
        createdAt: '2026-02-22T12:30:00Z',
        updatedAt: '2026-02-23T09:40:00Z',
      },
      {
        id: 'rep_003',
        reportId: 'SBD-2026-89104',
        submittedBy: {
          name: 'Kamrul Hasan',
          email: 'kamrul.it@outlook.com',
          isAnonymous: false,
        },
        category: 'rocket',
        identifiers: {
          phone: '01933445566',
          whatsapp: '01933445566',
          facebookPageName: 'Daraz Task Affiliate Hub',
          facebookUrl: '',
          websiteUrl: 'https://daraz-vip-tasks-bd.xyz',
          bkashNumber: '',
          nagadNumber: '',
          rocketNumber: '019334455667',
          normalizedSearchTokens: generateTokens({
            phone: '01933445566',
            whatsapp: '01933445566',
            websiteUrl: 'https://daraz-vip-tasks-bd.xyz',
            rocketNumber: '019334455667',
          }),
        },
        productOrService: 'Part-time Online Review Job Deposit',
        transactionAmount: 12000,
        transactionDate: '2026-02-25T16:00:00Z',
        paymentMethod: 'Rocket (DBBL MFS)',
        transactionReference: 'RCK810234',
        incidentDescription:
          'Contacted via WhatsApp offering daily 1500 BDT income by liking Daraz products. Asked for deposit into Rocket account to unlock higher VIP task commission. Deposited 12,000 BDT. Once deposit made, account was frozen and they asked for 30,000 BDT more to withdraw funds.',
        evidenceFiles: [
          {
            id: 'ev_04',
            originalFilename: 'Rocket_Statement_Proof.pdf',
            storageKey: 'evidence/rep_003/statement.pdf',
            mimeType: 'application/pdf',
            fileSize: 180000,
            fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
            uploadedAt: '2026-02-25T16:45:00Z',
          },
        ],
        status: 'under_review',
        reviewNotes: 'Initial evidence submitted. Moderator verifying DBBL transaction ID with complainant.',
        corroboratingCount: 1,
        disputeCount: 0,
        isPublic: true,
        createdAt: '2026-02-25T17:00:00Z',
        updatedAt: '2026-02-26T10:15:00Z',
      },
      {
        id: 'rep_004',
        reportId: 'SBD-2026-89105',
        submittedBy: {
          name: 'Nusrat Jahan',
          email: 'nusrat.j@yahoo.com',
          isAnonymous: false,
        },
        category: 'phone',
        identifiers: {
          phone: '01799887766',
          whatsapp: '01799887766',
          facebookPageName: 'Deshi Fashion Boutique BD',
          facebookUrl: 'https://facebook.com/deshifashionboutique',
          websiteUrl: '',
          bkashNumber: '01799887766',
          nagadNumber: '',
          rocketNumber: '',
          normalizedSearchTokens: generateTokens({
            phone: '01799887766',
            whatsapp: '01799887766',
            facebookPageName: 'Deshi Fashion Boutique BD',
            facebookUrl: 'https://facebook.com/deshifashionboutique',
            bkashNumber: '01799887766',
          }),
        },
        productOrService: 'Silk Saree & Three Piece Set',
        transactionAmount: 2800,
        transactionDate: '2026-02-14T10:00:00Z',
        paymentMethod: 'bKash Merchant',
        transactionReference: 'BK110298',
        incidentDescription:
          'Buyer claimed that package had not arrived after 10 days and phone was switched off.',
        evidenceFiles: [],
        status: 'disputed',
        reviewNotes:
          'Seller submitted RedX tracking ID showing parcel was in courier transit and was successfully received on Feb 26. Under review for resolution.',
        corroboratingCount: 1,
        disputeCount: 1,
        isPublic: true,
        createdAt: '2026-02-20T10:00:00Z',
        updatedAt: '2026-02-26T15:20:00Z',
      },
      {
        id: 'rep_005',
        reportId: 'SBD-2026-89106',
        submittedBy: {
          name: 'Shakil Anwar',
          email: 'shakil.anwar@gmail.com',
          isAnonymous: false,
        },
        category: 'website',
        identifiers: {
          phone: '01300112233',
          whatsapp: '01300112233',
          facebookPageName: 'Electronics Wholesaler BD',
          facebookUrl: '',
          websiteUrl: 'https://electronicwholesalerbd.com',
          bkashNumber: '01300112233',
          nagadNumber: '01300112233',
          rocketNumber: '',
          normalizedSearchTokens: generateTokens({
            phone: '01300112233',
            whatsapp: '01300112233',
            websiteUrl: 'https://electronicwholesalerbd.com',
            bkashNumber: '01300112233',
            nagadNumber: '01300112233',
          }),
        },
        productOrService: 'Smart TV 43 inch',
        transactionAmount: 8500,
        transactionDate: '2026-02-28T09:00:00Z',
        paymentMethod: 'bKash Send Money',
        transactionReference: 'BK5541999',
        incidentDescription:
          'Website offered wholesale pricing on smart TVs. Ordered 1 unit with advance payment. Website domain was taken down the next day.',
        evidenceFiles: [
          {
            id: 'ev_05',
            originalFilename: 'Domain_Whois_Payment_Receipt.png',
            storageKey: 'evidence/rep_005/domain.png',
            mimeType: 'image/png',
            fileSize: 220000,
            fileUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
            uploadedAt: '2026-02-28T09:30:00Z',
          },
        ],
        status: 'pending_review',
        reviewNotes: 'Pending initial review by moderation team.',
        corroboratingCount: 1,
        disputeCount: 0,
        isPublic: false, // Pending review is not public by default
        createdAt: '2026-02-28T09:35:00Z',
        updatedAt: '2026-02-28T09:35:00Z',
      },
    ];

    // Seed dispute
    this.disputes = [
      {
        id: 'disp_001',
        disputeId: 'DISP-2026-0041',
        reportId: 'SBD-2026-89105',
        claimantName: 'Farhana Akter (Owner, Deshi Fashion)',
        claimantEmail: 'deshifashionboutique@gmail.com',
        claimantPhone: '01799887766',
        claimantRole: 'seller',
        reason: 'Customer received product, courier delay due to national holiday',
        details:
          'The customer reported us on Feb 20 while parcel was delayed at RedX hub during Election week. Tracking number REDX-BD-891277 shows delivered on Feb 26 with customer signature. We request this report be removed or marked resolved as false allegation.',
        supportingEvidence: [
          {
            id: 'disp_ev_01',
            originalFilename: 'RedX_Proof_Of_Delivery.pdf',
            fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
          },
        ],
        status: 'pending',
        adminNotes: 'Moderator assigned to contact customer to confirm delivery acknowledgment.',
        createdAt: '2026-02-27T11:00:00Z',
      },
    ];

    // Notifications
    this.notifications = [
      {
        id: 'notif_001',
        userId: 'usr_user_01',
        title: 'Report SBD-2026-89102 Verified',
        message: 'Your report against Gadget Mart BD (bKash: 01711987654) has been verified and marked as a Verified Incident.',
        type: 'report_status',
        isRead: false,
        link: '/report/SBD-2026-89102',
        createdAt: '2026-02-19T11:00:00Z',
      },
      {
        id: 'notif_002',
        userId: 'usr_user_01',
        title: 'New Corroborating Report Added',
        message: '3 other community members reported the same seller. Thank you for protecting the community.',
        type: 'admin_alert',
        isRead: true,
        link: '/report/SBD-2026-89102',
        createdAt: '2026-02-20T14:10:00Z',
      },
    ];

    // Audit logs
    this.auditLogs = [
      {
        id: 'log_001',
        adminId: 'usr_admin_01',
        adminName: 'Tanvir Ahmed (Admin)',
        action: 'VERIFY_REPORT',
        targetId: 'SBD-2026-89102',
        targetType: 'report',
        description: 'Verified incident after receiving 4 corroborating complaints with police GD receipt.',
        createdAt: '2026-02-19T11:00:00Z',
      },
      {
        id: 'log_002',
        adminId: 'usr_mod_01',
        adminName: 'Sadia Rahman (Moderator)',
        action: 'MARK_DISPUTED',
        targetId: 'SBD-2026-89105',
        targetType: 'report',
        description: 'Marked report status as disputed following courier POD submission by merchant.',
        createdAt: '2026-02-27T11:30:00Z',
      },
    ];
  }

  // Search logic supporting Bangladeshi formats
  public searchReports(query: string, categoryFilter?: string) {
    this.searchCount++;
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) {
      return [];
    }

    // Record search history
    this.searchHistory.unshift({
      query,
      category: categoryFilter || 'all',
      timestamp: new Date().toISOString(),
    });
    if (this.searchHistory.length > 50) this.searchHistory.pop();

    // Normalizations
    const phoneNorm = normalizeBDPhone(query);
    const fbNorm = normalizeFacebook(query);
    const webNorm = normalizeWebsite(query);

    return this.reports.filter((rep) => {
      // Category filter check
      if (categoryFilter && categoryFilter !== 'all' && rep.category !== categoryFilter) {
        // Also check if category matches specific identifier field
        const cat = categoryFilter.toLowerCase();
        let matchesField = false;
        if (cat === 'bkash' && rep.identifiers.bkashNumber) matchesField = true;
        if (cat === 'nagad' && rep.identifiers.nagadNumber) matchesField = true;
        if (cat === 'rocket' && rep.identifiers.rocketNumber) matchesField = true;
        if (cat === 'phone' && rep.identifiers.phone) matchesField = true;
        if (cat === 'whatsapp' && rep.identifiers.whatsapp) matchesField = true;
        if (cat === 'facebook' && (rep.identifiers.facebookPageName || rep.identifiers.facebookUrl)) matchesField = true;
        if (cat === 'website' && rep.identifiers.websiteUrl) matchesField = true;

        if (!matchesField) return false;
      }

      // Check tokens
      const tokens = rep.identifiers.normalizedSearchTokens || [];

      // 1. Phone / MFS canonical match
      if (phoneNorm.canonical && tokens.includes(phoneNorm.canonical)) {
        return true;
      }

      // 2. Facebook normalized match
      if (fbNorm && tokens.some((t) => t.includes(fbNorm) || fbNorm.includes(t))) {
        return true;
      }

      // 3. Website normalized match
      if (webNorm && tokens.some((t) => t.includes(webNorm) || webNorm.includes(t))) {
        return true;
      }

      // 4. Report ID exact match
      if (rep.reportId.toLowerCase() === cleanQuery) {
        return true;
      }

      // 5. Partial text match on raw identifiers or title/description
      const idValues = [
        rep.identifiers.phone,
        rep.identifiers.whatsapp,
        rep.identifiers.facebookPageName,
        rep.identifiers.facebookUrl,
        rep.identifiers.websiteUrl,
        rep.identifiers.bkashNumber,
        rep.identifiers.nagadNumber,
        rep.identifiers.rocketNumber,
        rep.productOrService,
        rep.reportId,
      ]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase());

      return idValues.some((val) => val.includes(cleanQuery));
    });
  }

  // Get statistics
  public getStatistics() {
    const verified = this.reports.filter((r) => r.status === 'verified_incident').length;
    const underReview = this.reports.filter((r) => r.status === 'under_review').length;
    const pending = this.reports.filter((r) => r.status === 'pending_review').length;
    const disputed = this.reports.filter((r) => r.status === 'disputed').length;
    const totalAmount = this.reports
      .filter((r) => r.status === 'verified_incident' || r.status === 'under_review')
      .reduce((sum, r) => sum + (r.transactionAmount || 0), 0);

    return {
      totalReports: this.reports.length,
      verifiedIncidents: verified,
      pendingReports: pending,
      underReviewReports: underReview,
      disputedReports: disputed,
      totalSearches: this.searchCount,
      communityMembers: this.users.length + 3840,
      totalAmountLossBDT: totalAmount,
    };
  }

  // Synchronize collections with MongoDB Atlas upon connection
  public async syncWithMongoDB() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      console.log('[Database] Synchronizing collections with MongoDB Atlas...');

      // 1. Users
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('[Database] Seeding initial users into MongoDB Atlas...');
        const userDocs = this.users.map((u) => ({
          name: u.name,
          email: u.email,
          password: u.passwordHash,
          role: u.role,
          avatar: u.avatar || '',
          phone: u.phone || '',
          isVerified: u.isVerified,
          isActive: u.isActive,
        }));
        await UserModel.insertMany(userDocs);
        console.log(`[Database] Successfully seeded ${userDocs.length} users into MongoDB Atlas.`);
      } else {
        const dbUsers = await UserModel.find().lean();
        this.users = dbUsers.map((u: any) => ({
          id: u._id.toString(),
          name: u.name,
          email: u.email,
          passwordHash: u.password,
          role: u.role,
          avatar: u.avatar || '',
          phone: u.phone || '',
          isVerified: u.isVerified,
          isActive: u.isActive,
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        }));
        console.log(`[Database] Loaded ${this.users.length} users from MongoDB Atlas.`);
      }

      // 2. Reports
      const reportCount = await ReportModel.countDocuments();
      if (reportCount === 0) {
        console.log('[Database] Seeding initial scam reports into MongoDB Atlas...');
        const reportDocs = this.reports.map((r) => ({
          reportId: r.reportId,
          submittedBy: r.submittedBy,
          category: r.category,
          identifiers: r.identifiers,
          productOrService: r.productOrService,
          transactionAmount: r.transactionAmount,
          transactionDate: new Date(r.transactionDate),
          paymentMethod: r.paymentMethod,
          transactionReference: r.transactionReference,
          incidentDescription: r.incidentDescription,
          evidenceFiles: r.evidenceFiles.map((ev) => ({
            ...ev,
            uploadedAt: new Date(ev.uploadedAt),
          })),
          status: r.status,
          reviewNotes: r.reviewNotes,
          rejectionReason: r.rejectionReason,
          corroboratingCount: r.corroboratingCount,
          disputeCount: r.disputeCount,
          isPublic: r.isPublic,
        }));
        await ReportModel.insertMany(reportDocs);
        console.log(`[Database] Successfully seeded ${reportDocs.length} scam reports into MongoDB Atlas.`);
      } else {
        const dbReports = await ReportModel.find().sort({ createdAt: -1 }).lean();
        this.reports = dbReports.map((r: any) => ({
          id: r._id.toString(),
          reportId: r.reportId,
          submittedBy: r.submittedBy,
          category: r.category,
          identifiers: r.identifiers,
          productOrService: r.productOrService,
          transactionAmount: r.transactionAmount,
          transactionDate: r.transactionDate ? new Date(r.transactionDate).toISOString() : new Date().toISOString(),
          paymentMethod: r.paymentMethod,
          transactionReference: r.transactionReference,
          incidentDescription: r.incidentDescription,
          evidenceFiles: (r.evidenceFiles || []).map((ev: any) => ({
            ...ev,
            uploadedAt: ev.uploadedAt ? new Date(ev.uploadedAt).toISOString() : new Date().toISOString(),
          })),
          status: r.status,
          reviewNotes: r.reviewNotes,
          rejectionReason: r.rejectionReason,
          corroboratingCount: r.corroboratingCount || 1,
          disputeCount: r.disputeCount || 0,
          isPublic: r.isPublic !== false,
          createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
        }));
        console.log(`[Database] Loaded ${this.reports.length} scam reports from MongoDB Atlas.`);
      }

      // 3. Disputes
      const disputeCount = await DisputeModel.countDocuments();
      if (disputeCount === 0 && this.disputes.length > 0) {
        await DisputeModel.insertMany(
          this.disputes.map((d) => ({
            disputeId: d.disputeId,
            reportId: d.reportId,
            claimantName: d.claimantName,
            claimantEmail: d.claimantEmail,
            claimantPhone: d.claimantPhone,
            claimantRole: d.claimantRole,
            reason: d.reason,
            details: d.details,
            supportingEvidence: d.supportingEvidence || [],
            status: d.status,
            adminNotes: d.adminNotes,
          }))
        );
      } else if (disputeCount > 0) {
        const dbDisputes = await DisputeModel.find().sort({ createdAt: -1 }).lean();
        this.disputes = dbDisputes.map((d: any) => ({
          id: d._id.toString(),
          disputeId: d.disputeId,
          reportId: d.reportId,
          claimantName: d.claimantName,
          claimantEmail: d.claimantEmail,
          claimantPhone: d.claimantPhone,
          claimantRole: d.claimantRole,
          reason: d.reason,
          details: d.details,
          supportingEvidence: d.supportingEvidence || [],
          status: d.status,
          adminNotes: d.adminNotes,
          createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        }));
      }

      // 4. Audit Logs
      const logCount = await AuditLogModel.countDocuments();
      if (logCount === 0 && this.auditLogs.length > 0) {
        await AuditLogModel.insertMany(
          this.auditLogs.map((l) => ({
            adminId: l.adminId,
            adminName: l.adminName,
            action: l.action,
            targetId: l.targetId,
            targetType: l.targetType,
            description: l.description,
          }))
        );
      } else if (logCount > 0) {
        const dbLogs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(100).lean();
        this.auditLogs = dbLogs.map((l: any) => ({
          id: l._id.toString(),
          adminId: l.adminId,
          adminName: l.adminName,
          action: l.action,
          targetId: l.targetId,
          targetType: l.targetType,
          description: l.description,
          createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        }));
      }

      // 5. Notifications
      const notifCount = await NotificationModel.countDocuments();
      if (notifCount === 0 && this.notifications.length > 0) {
        await NotificationModel.insertMany(
          this.notifications.map((n) => ({
            userId: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.isRead,
            link: n.link,
          }))
        );
      } else if (notifCount > 0) {
        const dbNotifs = await NotificationModel.find().sort({ createdAt: -1 }).limit(100).lean();
        this.notifications = dbNotifs.map((n: any) => ({
          id: n._id.toString(),
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.isRead,
          link: n.link,
          createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
        }));
      }

      console.log('[Database] MongoDB Atlas collections synchronized successfully.');
    } catch (err: any) {
      console.error('[Database] MongoDB sync error:', err.message);
    }
  }

  // Persistence methods to write through to MongoDB Atlas
  public async persistUser(user: DBUser) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await UserModel.findOneAndUpdate(
        { email: user.email },
        {
          name: user.name,
          email: user.email,
          password: user.passwordHash,
          role: user.role,
          avatar: user.avatar || '',
          phone: user.phone || '',
          isVerified: user.isVerified,
          isActive: user.isActive,
        },
        { upsert: true, new: true }
      );
    } catch (err: any) {
      console.error('[Database] Error persisting user to MongoDB Atlas:', err.message);
    }
  }

  public async persistReport(report: DBReport) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await ReportModel.findOneAndUpdate(
        { reportId: report.reportId },
        {
          reportId: report.reportId,
          submittedBy: report.submittedBy,
          category: report.category,
          identifiers: report.identifiers,
          productOrService: report.productOrService,
          transactionAmount: report.transactionAmount,
          transactionDate: new Date(report.transactionDate),
          paymentMethod: report.paymentMethod,
          transactionReference: report.transactionReference,
          incidentDescription: report.incidentDescription,
          evidenceFiles: (report.evidenceFiles || []).map((ev) => ({
            ...ev,
            uploadedAt: new Date(ev.uploadedAt),
          })),
          status: report.status,
          reviewNotes: report.reviewNotes,
          rejectionReason: report.rejectionReason,
          corroboratingCount: report.corroboratingCount,
          disputeCount: report.disputeCount,
          isPublic: report.isPublic,
        },
        { upsert: true, new: true }
      );
    } catch (err: any) {
      console.error('[Database] Error persisting report to MongoDB Atlas:', err.message);
    }
  }

  public async persistDispute(dispute: DBDispute) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await DisputeModel.findOneAndUpdate(
        { disputeId: dispute.disputeId },
        {
          disputeId: dispute.disputeId,
          reportId: dispute.reportId,
          claimantName: dispute.claimantName,
          claimantEmail: dispute.claimantEmail,
          claimantPhone: dispute.claimantPhone,
          claimantRole: dispute.claimantRole,
          reason: dispute.reason,
          details: dispute.details,
          supportingEvidence: dispute.supportingEvidence || [],
          status: dispute.status,
          adminNotes: dispute.adminNotes,
        },
        { upsert: true, new: true }
      );
    } catch (err: any) {
      console.error('[Database] Error persisting dispute to MongoDB Atlas:', err.message);
    }
  }

  public async persistAuditLog(log: DBAuditLog) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await AuditLogModel.create({
        adminId: log.adminId,
        adminName: log.adminName,
        action: log.action,
        targetId: log.targetId,
        targetType: log.targetType,
        description: log.description,
        previousState: log.metadata?.previousStatus,
        newState: log.metadata?.newStatus,
      });
    } catch (err: any) {
      console.error('[Database] Error persisting audit log to MongoDB Atlas:', err.message);
    }
  }

  public async persistNotification(notif: DBNotification) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await NotificationModel.create({
        userId: notif.userId,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        isRead: notif.isRead,
        link: notif.link,
      });
    } catch (err: any) {
      console.error('[Database] Error persisting notification to MongoDB Atlas:', err.message);
    }
  }

  public async removeReport(reportId: string) {
    if (mongoose.connection.readyState !== 1) return;
    try {
      await ReportModel.deleteOne({ reportId });
    } catch (err: any) {
      console.error('[Database] Error deleting report from MongoDB Atlas:', err.message);
    }
  }
}

export const inAppDB = new InAppDataStore();

