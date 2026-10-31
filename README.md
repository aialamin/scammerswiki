# ScamAlert BD – MERN Full Stack Scam Detection Platform

> **Tagline:** Stop. Search. Stay Safe.

ScamAlert BD is a modern, high-performance scam reporting and fraud detection web application built specifically for Bangladesh. It empowers consumers to check suspicious sellers, phone numbers (+880 / 01xxxxxxxxx), WhatsApp accounts, Facebook pages, websites, and mobile financial service (MFS) accounts—including **bKash**, **Nagad**, and **Rocket**—prior to completing online orders.

---

## 🌟 Key Features

1. **Intelligent Bangladeshi Number Normalization & Search:**
   - Normalizes any BD mobile or MFS input: `+8801712345678`, `8801712345678`, `01712-345678`, `+88 018 12345678` into canonical 11-digit or 12-digit Rocket formats.
   - Detects telecommunication operators: Grameenphone, Robi, Airtel, Banglalink, and Teletalk.
   - Normalizes Facebook page handles and website domains.
   - Real-time search suggestions with debounce and search history tracking.

2. **Multi-Step Scam Report Submission Wizard:**
   - **Step 1:** Categorization (Phone, WhatsApp, Facebook, Website, bKash, Nagad, Rocket, Other).
   - **Step 2:** Seller Information with multi-identifier linking.
   - **Step 3:** Incident Details (Product/service, transaction amount in ৳ BDT, payment method, TrxID).
   - **Step 4:** Secure Evidence Uploads (JPG, PNG, PDF, screenshots, receipts with preview and validation).
   - **Step 5:** Review & Legal Truthfulness Affirmation (Digital Security declaration, unique SBD Report ID generation).

3. **Role-Based Access Control (RBAC):**
   - **User:** Submit reports, track review status, upload supplementary evidence, manage profile.
   - **Moderator:** Inspect evidence, adjudicate reports (Mark Verified Incident, Under Review, Disputed, or Reject), arbitrate appeals.
   - **Admin:** Full administrative dashboard, user management, audit logs, public data redaction.

4. **1-Click Live Demo Role Switcher:**
   - Quick header switcher to test:
     - 👑 **Admin:** `admin@scamalertbd.com` / `admin123456` (Tanvir Ahmed)
     - 🛡️ **Moderator:** `moderator@scamalertbd.com` / `moderator123456` (Sadia Rahman)
     - 👤 **User:** `rahim@example.com` / `user123456` (Rahim Chowdhury)

5. **Merchant Dispute & Appeals System:**
   - Accused businesses or individuals have direct legal recourse to submit proof of delivery (Steadfast, Pathao, RedX consignment tracking) or refund slips to appeal false allegations.
   - Status transitions dynamically to `Disputed` and arbitration is logged.

6. **Immutable Moderation Audit Trail:**
   - Every administrative status change, edit, or dispute resolution is immutably logged with admin ID, timestamp, and notes.

7. **Emergency Helplines & Consumer Safety Guides:**
   - National Emergency 999, CID Cyber Police Center (`01320010148`), Police Cyber Support for Women (`01320000888`).
   - Detailed guides for detecting Courier Advance traps and checking Facebook Page Transparency.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend:** Node.js, Express.js REST API.
- **Database & Storage:** MongoDB Mongoose with graceful fallback in-memory store so it runs out-of-the-box in any environment.
- **Authentication:** JWT (JSON Web Tokens), bcryptjs password hashing.
- **File Uploads:** Multer with mime-type and file-size constraints.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- (Optional) MongoDB Atlas account or local MongoDB instance

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your environment variables:
```env
PORT=3000
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/scamalert_bd?retryWrites=true&w=majority"
JWT_SECRET="your_secure_jwt_secret"
NODE_ENV="development"
```
*(Note: If `MONGODB_URI` is left unset, ScamAlert BD will automatically start with the pre-seeded in-memory store featuring realistic BD scam cases, allowing instant zero-configuration testing!)*

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
scamalert-bd/
├── server/
│   ├── config/
│   │   └── db.ts                # MongoDB connection helper
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── searchController.ts  # BD normalized search
│   │   ├── reportController.ts  # Multi-step report submission
│   │   ├── adminController.ts   # Moderation & dispute resolution
│   │   └── notificationController.ts
│   ├── models/
│   │   ├── User.ts              # Mongoose user model
│   │   ├── Report.ts            # Mongoose report model
│   │   ├── Dispute.ts           # Mongoose dispute model
│   │   ├── AuditLog.ts          # Moderation audit trail
│   │   └── Notification.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts    # JWT & RBAC guards
│   │   └── uploadMiddleware.ts  # Multer file handler
│   ├── services/
│   │   ├── normalizer.ts        # Bangladeshi phone & URL normalizer
│   │   └── mockDatabase.ts      # Reactive store with pre-seeded data
│   └── app.ts                   # Express application setup
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Header with role switcher
│   │   ├── Footer.tsx           # Emergency helplines & legal notes
│   │   ├── HeroSearch.tsx       # Central search with category pills
│   │   ├── StatisticsBar.tsx    # Live database statistics
│   │   ├── RecentReports.tsx    # Recent verified reports feed
│   │   ├── HowItWorks.tsx       # 4-step consumer safety flow
│   │   ├── StatusBadge.tsx      # Verified, Under Review, Disputed badges
│   │   ├── ReportDetailModal.tsx# Incident inspector with evidence view
│   │   ├── DisputeModal.tsx     # Merchant appeal submission
│   │   └── AuthModals.tsx       # Sign in & registration modal
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── ReportSubmissionPage.tsx
│   │   ├── UserDashboardPage.tsx
│   │   ├── AdminDashboardPage.tsx
│   │   └── SafetyGuidePage.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   └── api.ts               # Client REST API wrapper
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   └── main.tsx
├── server.ts                    # Full-stack server entry point (Express + Vite)
├── .env.example
└── README.md
```

---

## 🔒 Security & Privacy Practices

- **Zero Unverified Defamation:** A search hit does not automatically label an entity as a fraudster unless vetted with financial receipts and corroborated by independent buyers.
- **PII Protection:** Consumer contact information (emails, home addresses) is never exposed publicly.
- **Redaction Controls:** Admins and moderators can redact or adjust descriptions to prevent sensitive bank account leaks.
- **Rate Limiting & Input Sanitization:** Protection against automated spam report injection.
