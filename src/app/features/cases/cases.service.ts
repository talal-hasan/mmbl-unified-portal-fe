import { Injectable, signal, computed } from '@angular/core';
import { DraftCase, WorkOrder, DraftQueueStats, SimilarityTier } from './cases.models';

/**
 * CasesService
 *
 * Central store for both DraftCases and confirmed WorkOrders.
 * Uses Angular signals so components react automatically.
 *
 * In production: replace the mock arrays with HttpClient calls to
 * your Spring Boot backend:
 *   GET  /api/cases/drafts
 *   GET  /api/cases
 *   POST /api/cases/drafts/:id/merge
 *   POST /api/cases/drafts/:id/confirm
 *   POST /api/cases/drafts/:id/reject
 */
@Injectable({ providedIn: 'root' })
export class CasesService {

  // ── Signals ────────────────────────────────────────────────────────────────
  private _drafts = signal<DraftCase[]>(MOCK_DRAFTS);
  private _cases  = signal<WorkOrder[]>(MOCK_CONFIRMED_CASES);

  readonly drafts = this._drafts.asReadonly();
  readonly cases  = this._cases.asReadonly();

  readonly draftStats = computed<DraftQueueStats>(() => {
    const d = this._drafts();
    const pending = d.filter(x => x.status === 'Pending');
    return {
      awaitingDraft:  pending.length,
      highConfidence: pending.filter(x => x.similarityScore >= 80).length,
      aiSuggestions:  pending.filter(x => x.similarityScore >= 80 && x.similarRefs.length > 0).length,
    };
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Merge a draft into an existing confirmed case */
  mergeDraft(draftId: string, targetCaseId: string): void {
    this._drafts.update(list =>
      list.map(d => d.id === draftId ? { ...d, status: 'Merged' as const } : d)
    );
    // In production: POST /api/cases/drafts/:draftId/merge { targetCaseId }
    console.log(`[CasesService] Merged draft ${draftId} → case ${targetCaseId}`);
  }

  /** Confirm a draft as a brand-new confirmed case */
  confirmDraft(draftId: string): WorkOrder {
    const draft = this._drafts().find(d => d.id === draftId);
    if (!draft) throw new Error(`Draft ${draftId} not found`);

    const newCase: WorkOrder = {
      id:          `case-${Date.now()}`,
      wo:          `TC-${Math.floor(8800 + Math.random() * 200)}`,
      title:       draft.subject,
      description: draft.body,
      assignedTo:  { name: 'Unassigned', avatar: '', initials: 'UN', color: '#9ca3af' },
      startDate:   new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
      dueDate:     'TBD',
      category:    'Email',
      priority:    'Medium',
      status:      'Assigned',
      location:    '—',
      asset:       '—',
      source:      draft.source,
      tags:        [],
      tatRemaining: '48h 00m',
      tatBreached:  false,
    };

    this._drafts.update(list =>
      list.map(d => d.id === draftId ? { ...d, status: 'Confirmed' as const } : d)
    );
    this._cases.update(list => [newCase, ...list]);

    // In production: POST /api/cases/drafts/:draftId/confirm
    console.log(`[CasesService] Confirmed draft ${draftId} → new case ${newCase.wo}`);
    return newCase;
  }

  /** Bulk confirm multiple drafts */
  bulkConfirm(draftIds: string[]): void {
    draftIds.forEach(id => this.confirmDraft(id));
  }

  /** Reject / discard a draft */
  rejectDraft(draftId: string): void {
    this._drafts.update(list =>
      list.map(d => d.id === draftId ? { ...d, status: 'Rejected' as const } : d)
    );
    // In production: POST /api/cases/drafts/:draftId/reject
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  similarityTier(score: number): SimilarityTier {
    if (score >= 80) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DRAFTS: DraftCase[] = [
  {
    id: '#DRF-8821',
    subject: 'Urgent: Billing Discrepancy - Account TC-8892',
    senderName: 'Ahmed Raza',
    senderEmail: 'ahmed.raza@example.com',
    receivedAt: new Date(Date.now() - 2 * 60000),
    source: 'Email',
    similarityScore: 98,
    similarityTier: 'HIGH',
    similarRefs: [
      { caseId: '#CAS-100', title: 'Billing Discrepancy - Enterprise Client', score: 98 },
      { caseId: '#CAS-098', title: 'Account Billing Issue Q1', score: 91 },
    ],
    body: 'I am writing to report a billing discrepancy in my account. The amount charged on Feb 12 does not match my statement.',
    attachments: [{ name: 'statement_feb.pdf', size: '1.2 MB', type: 'pdf' }],
    ocrExtracted: { customerName: 'Ahmed Raza', cnic: '42101-1234567-1', phone: '03001234567', accountNumber: 'PK36MUCB1234567890', confidence: 94 },
    status: 'Pending',
  },
  {
    id: '#DRF-8822',
    subject: 'Service Outage - North Sector Branch',
    senderName: 'Help Desk',
    senderEmail: 'help-desk@corp.net',
    receivedAt: new Date(Date.now() - 15 * 60000),
    source: 'Email',
    similarityScore: 65,
    similarityTier: 'MEDIUM',
    similarRefs: [
      { caseId: '#CAS-331', title: 'North Sector Infrastructure Issue', score: 65 },
    ],
    body: 'There is a reported service outage affecting the North Sector branch since 09:00 AM today. Multiple customers unable to transact.',
    attachments: [],
    ocrExtracted: { referenceNumber: 'OUT-2026-0214', confidence: 60 },
    status: 'Pending',
  },
  {
    id: '#DRF-8823',
    subject: 'New Connection Inquiry: Fiber Optic Upgrade',
    senderName: 'Robert Vance',
    senderEmail: 'r.vance@gmail.com',
    receivedAt: new Date(Date.now() - 60 * 60000),
    source: 'Email',
    similarityScore: 12,
    similarityTier: 'LOW',
    similarRefs: [],
    body: 'We would like to inquire about upgrading our branch connection to fiber optic. Please advise on the process.',
    attachments: [{ name: 'branch_layout.jpg', size: '800 KB', type: 'image' }],
    ocrExtracted: { customerName: 'Robert Vance', confidence: 40 },
    status: 'Pending',
  },
  {
    id: '#DRF-8824',
    subject: 'Re: Pending Invoice #INV-2024-99',
    senderName: 'Accounts Payable',
    senderEmail: 'accounts@partner.io',
    receivedAt: new Date(Date.now() - 2 * 3600000),
    source: 'Email',
    similarityScore: 82,
    similarityTier: 'HIGH',
    similarRefs: [
      { caseId: '#CAS-441', title: 'Invoice Dispute INV-2024-99', score: 82 },
    ],
    body: 'Following up on the pending invoice INV-2024-99 raised on January 15. Please confirm receipt and expected payment date.',
    attachments: [
      { name: 'invoice_2024_99.pdf', size: '450 KB', type: 'pdf' },
      { name: 'payment_terms.pdf', size: '120 KB', type: 'pdf' },
    ],
    ocrExtracted: { referenceNumber: 'INV-2024-99', accountNumber: 'PK91MUCB9876543210', confidence: 88 },
    status: 'Pending',
  },
  {
    id: '#DRF-8825',
    subject: 'Update on previous request - Ticket #TK-5521',
    senderName: 'Client Solutions',
    senderEmail: 'info@client-solutions.com',
    receivedAt: new Date(Date.now() - 4 * 3600000),
    source: 'Email',
    similarityScore: 52,
    similarityTier: 'MEDIUM',
    similarRefs: [
      { caseId: '#CAS-901', title: 'Ticket TK-5521 Resolution', score: 52 },
    ],
    body: 'We are following up on Ticket #TK-5521 submitted last week. The issue has not been resolved and is impacting operations.',
    attachments: [],
    ocrExtracted: { referenceNumber: 'TK-5521', confidence: 55 },
    status: 'Pending',
  },
  {
    id: '#DRF-8826',
    subject: 'IBFT Transaction Dispute Ref#789123',
    senderName: 'Fatima Malik',
    senderEmail: 'fatima.malik@hotmail.com',
    receivedAt: new Date(Date.now() - 5 * 3600000),
    source: 'Email',
    similarityScore: 91,
    similarityTier: 'HIGH',
    similarRefs: [
      { caseId: '#CAS-112', title: 'IBFT Dispute Ref#789100', score: 91 },
      { caseId: '#CAS-108', title: 'IBFT Transaction Query', score: 78 },
    ],
    body: 'My IBFT transfer of PKR 50,000 on Feb 11 has not been credited to the beneficiary. Reference number IBFT-789123.',
    attachments: [{ name: 'transaction_receipt.jpg', size: '640 KB', type: 'image' }],
    ocrExtracted: { customerName: 'Fatima Malik', cnic: '35202-9876543-2', phone: '03211234567', referenceNumber: 'IBFT-789123', confidence: 91 },
    status: 'Pending',
  },
  {
    id: '#DRF-8827',
    subject: 'KYC Document Verification Required',
    senderName: 'Compliance Team',
    senderEmail: 'compliance@mmbl-partner.com',
    receivedAt: new Date(Date.now() - 6 * 3600000),
    source: 'Email',
    similarityScore: 34,
    similarityTier: 'LOW',
    similarRefs: [],
    body: 'Please find attached KYC documents for account holder verification. Documents include CNIC copy and utility bill.',
    attachments: [
      { name: 'cnic_front.jpg', size: '1.1 MB', type: 'image' },
      { name: 'utility_bill.pdf', size: '320 KB', type: 'pdf' },
    ],
    ocrExtracted: { customerName: 'Muhammad Usman', cnic: '31304-5678901-3', phone: '03451234567', confidence: 78 },
    status: 'Pending',
  },
];

const MOCK_CONFIRMED_CASES: WorkOrder[] = [
  {
    id: '1', wo: '2602-839',
    title: 'Request for Transactional Record Against IBFT Ref#543891',
    description: 'Customer requesting detailed transaction history for IBFT reference number 543891',
    assignedTo: { name: 'Abdullah Kamran', avatar: 'https://i.pravatar.cc/150?img=1', initials: 'AK', color: '#FF6B9D' },
    startDate: '12 Feb, 26', dueDate: 'Tomorrow',
    category: 'Preventative', priority: 'High', status: 'Working',
    location: 'Islamabad', asset: 'Assembly - TRA...',
    tags: ['transaction', 'ibft', 'urgent'],
    source: 'Email', tatRemaining: '06h 30m', tatBreached: false,
  },
  {
    id: '2', wo: '2602-114', title: 'HVAC Routine Service',
    description: 'Regular maintenance check for HVAC system',
    assignedTo: { name: 'Dilawar Khan', avatar: 'https://i.pravatar.cc/150?img=2', initials: 'DK', color: '#FFB800' },
    startDate: '9 Feb, 26', dueDate: 'Today',
    category: 'Preventative', priority: 'Medium', status: 'Assigned',
    location: 'Lahore', asset: 'Fan Assembly - TRA...',
    tags: ['hvac', 'maintenance'],
    source: 'Manual', tatRemaining: '02h 15m', tatBreached: false,
  },
  {
    id: '3', wo: '2506-111', title: 'Activity Report Against Fraudulent Report Ref#66535',
    description: 'Investigation and reporting on fraudulent activity reference 66535',
    assignedTo: { name: 'Noman Ahmed', avatar: 'https://i.pravatar.cc/150?img=3', initials: 'NA', color: '#10B981' },
    startDate: '11 Feb, 26', dueDate: 'Tomorrow',
    category: 'Fraud Mitigation', priority: 'High', status: 'Working',
    location: 'Area 55', asset: 'Fan Assembly - TRA...',
    tags: ['fraud', 'investigation', 'urgent'],
    source: 'Email', tatRemaining: '14h 00m', tatBreached: false,
  },
  {
    id: '4', wo: '2506-003', title: 'Data Center Magnetic Tape Replacement',
    description: 'Replace old magnetic tapes in the data center',
    assignedTo: { name: 'Momina Afzal', avatar: 'https://i.pravatar.cc/150?img=4', initials: 'MA', color: '#8B5CF6' },
    startDate: '13 Feb, 26', dueDate: '22 Feb, 26',
    category: 'Preventative', priority: 'Medium', status: 'Completed',
    location: 'Karachi', asset: 'Fan Assembly - TRA...',
    tags: ['data-center', 'replacement'],
    source: 'CMS', tatRemaining: '—', tatBreached: false,
  },
  {
    id: '5', wo: '2506-015', title: 'Incorrect Balance Statement Ref#14423',
    description: 'Customer reporting incorrect balance in statement reference 14423',
    assignedTo: { name: 'Basit Khurram', avatar: 'https://i.pravatar.cc/150?img=5', initials: 'BK', color: '#FF6B9D' },
    startDate: '01 Feb, 26', dueDate: '13 Feb, 26',
    category: 'Customer Care', priority: 'High', status: 'Breached',
    location: 'Lahore', asset: 'Fan Assembly - TRA...',
    tags: ['balance', 'statement', 'customer-care'],
    source: 'Email', tatRemaining: '-04h 22m', tatBreached: true,
  },
  {
    id: '6', wo: '2506-054', title: 'Account Takeover Attempt Reported',
    description: 'Scheduled HVAC maintenance service',
    assignedTo: { name: 'Uzair Amjad', avatar: 'https://i.pravatar.cc/150?img=6', initials: 'UA', color: '#EC4899' },
    startDate: '12 Mar, 26', dueDate: '23 Mar, 26',
    category: 'Preventative', priority: 'Low', status: 'Assigned',
    location: 'Islamabad', asset: 'Fan Assembly - TRA...',
    tags: ['hvac', 'routine'],
    source: 'ServiceNow', tatRemaining: '30h 00m', tatBreached: false,
  },
];