// ─── Existing WorkOrder (Confirmed Case) — unchanged ─────────────────────────
export interface WorkOrder {
  id: string;
  wo: string;
  title: string;
  description?: string;
  assignedTo: {
    name: string;
    avatar: string;
    initials: string;
    color: string;
  };
  startDate: string;
  dueDate: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Assigned' | 'Working' | 'Completed' | 'Breached';
  location: string;
  asset: string;
  tags?: string[];
  source?: CaseSource;
  tatRemaining?: string;   // e.g. '14h 30m' or '-2h (BREACHED)'
  tatBreached?: boolean;
  inquiryNumber?: string;  // external ID from CMS / ServiceNow
}

// ─── Source channel ───────────────────────────────────────────────────────────
export type CaseSource = 'Email' | 'Manual' | 'CMS' | 'ServiceNow';

// ─── Similarity tier (FRS DC-01) ─────────────────────────────────────────────
export type SimilarityTier = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SimilarCaseRef {
  caseId: string;
  title: string;
  score: number; // 0–100
}

// ─── Draft Case (FRS EM-01, CC-03) ───────────────────────────────────────────
// Created automatically when an email arrives. Awaits manager review.
export interface DraftCase {
  id: string;               // internal draft ID, e.g. #DRF-8821
  subject: string;          // email subject line
  senderName: string;
  senderEmail: string;
  receivedAt: Date;         // when the email arrived
  source: CaseSource;       // always 'Email' for auto-ingested drafts
  similarityScore: number;  // 0–100 — OCR match confidence
  similarityTier: SimilarityTier;
  similarRefs: SimilarCaseRef[]; // existing cases that might match
  body?: string;            // email body preview
  attachments?: DraftAttachment[];
  ocrExtracted?: OcrExtractedData;
  status: 'Pending' | 'Merged' | 'Confirmed' | 'Rejected';
}

export interface DraftAttachment {
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'email' | 'document';
}

// OCR-extracted fields pre-populated from email/attachment (FRS OC-01)
export interface OcrExtractedData {
  customerName?: string;
  cnic?: string;            // 42101-1234567-1
  phone?: string;
  dateOfBirth?: string;
  accountNumber?: string;
  referenceNumber?: string; // e.g. IBFT Ref#
  confidence?: number;      // overall OCR confidence 0–100
}

// ─── Stats shown in KPI cards above draft queue ───────────────────────────────
export interface DraftQueueStats {
  awaitingDraft: number;
  highConfidence: number;   // >= 80% similarity
  aiSuggestions: number;    // auto-mergeable
}