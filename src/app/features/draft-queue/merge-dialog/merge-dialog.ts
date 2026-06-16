import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { DraftCase, SimilarCaseRef } from '../../cases/cases.models';

export interface MergeDialogData {
  draft: DraftCase;
}

export interface MergeDialogResult {
  action: 'merge' | 'cancel';
  targetCaseId?: string;
}

/**
 * MergeDialogComponent
 *
 * Shown when manager clicks "Merge" on a draft case.
 * Lists similar existing cases (with scores) and lets manager
 * pick which one to merge into.
 */
@Component({
  selector: 'app-merge-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatRadioModule, FormsModule],
  template: `
    <div class="merge-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-icon">
          <mat-icon>merge_type</mat-icon>
        </div>
        <div class="header-text">
          <h2>Merge Draft Case</h2>
          <p>Select an existing case to merge this draft into</p>
        </div>
        <button class="close-btn" mat-icon-button (click)="cancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Draft summary -->
      <div class="draft-summary">
        <div class="draft-label">DRAFT</div>
        <div class="draft-info">
          <span class="draft-id">{{ data.draft.id }}</span>
          <span class="draft-subject">{{ data.draft.subject }}</span>
          <span class="draft-sender">From: {{ data.draft.senderName }} &lt;{{ data.draft.senderEmail }}&gt;</span>
        </div>
      </div>

      <!-- Similar cases list -->
      <div class="similar-section">
        <h3 class="section-title">
          <mat-icon>content_copy</mat-icon>
          Similar Cases Found ({{ data.draft.similarRefs.length }})
        </h3>

        <div class="cases-list">
          @for (ref of data.draft.similarRefs; track ref.caseId) {
            <label
              class="case-option"
              [class.selected]="selectedCaseId() === ref.caseId"
            >
              <input
                type="radio"
                name="targetCase"
                [value]="ref.caseId"
                [(ngModel)]="selectedCaseIdValue"
                (change)="selectedCaseId.set(ref.caseId)"
                hidden
              />
              <div class="case-card">
                <div class="case-left">
                  <div class="radio-indicator">
                    @if (selectedCaseId() === ref.caseId) {
                      <mat-icon class="radio-on">radio_button_checked</mat-icon>
                    } @else {
                      <mat-icon class="radio-off">radio_button_unchecked</mat-icon>
                    }
                  </div>
                  <div class="case-details">
                    <span class="case-id">{{ ref.caseId }}</span>
                    <span class="case-title">{{ ref.title }}</span>
                  </div>
                </div>
                <div class="score-badge" [class]="getTierClass(ref.score)">
                  <span class="score-pct">{{ ref.score }}%</span>
                  <span class="score-label">{{ getTierLabel(ref.score) }}</span>
                </div>
              </div>
            </label>
          }
        </div>
      </div>

      <!-- Warning -->
      <div class="merge-warning">
        <mat-icon>info_outline</mat-icon>
        <span>The draft email thread and attachments will be linked to the selected case. This action is logged in the audit trail.</span>
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <button mat-stroked-button class="cancel-btn" (click)="cancel()">
          Cancel
        </button>
        <button
          mat-raised-button
          class="merge-btn"
          [disabled]="!selectedCaseId()"
          (click)="confirm()"
        >
          <mat-icon>merge_type</mat-icon>
          Merge into {{ selectedCaseId() || '...' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .merge-dialog {
      width: 540px;
      max-width: 100%;
      font-family: 'DM Sans', sans-serif;
    }

    .dialog-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 28px 28px 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    .header-icon {
      width: 48px;
      height: 48px;
      background: #000;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { color: #fff; font-size: 24px; width: 24px; height: 24px; }
    }

    .header-text {
      flex: 1;
      h2 { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: #111; }
      p  { font-size: 13px; color: #666; margin: 0; }
    }

    .close-btn mat-icon { color: #999; }

    /* Draft summary strip */
    .draft-summary {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 28px;
      background: #f9f9f9;
      border-bottom: 1px solid #f0f0f0;
    }

    .draft-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1px;
      background: #e5e7eb;
      color: #374151;
      border-radius: 4px;
      padding: 3px 8px;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .draft-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .draft-id      { font-size: 12px; font-weight: 600; color: #374151; }
      .draft-subject { font-size: 13px; font-weight: 600; color: #111; }
      .draft-sender  { font-size: 12px; color: #6b7280; }
    }

    /* Similar cases */
    .similar-section { padding: 20px 28px 8px; }

    .section-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 16px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #6b7280; }
    }

    .cases-list { display: flex; flex-direction: column; gap: 8px; }

    .case-option { cursor: pointer; display: block; }

    .case-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      transition: all 0.15s ease;
      background: #fff;

      &:hover { border-color: #9ca3af; }
    }

    .case-option.selected .case-card {
      border-color: #000;
      background: #fafafa;
    }

    .case-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .radio-on  { color: #000; }
    .radio-off { color: #d1d5db; }

    .case-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      .case-id    { font-size: 11px; font-weight: 700; color: #6b7280; }
      .case-title { font-size: 13px; font-weight: 600; color: #111; }
    }

    /* Score badge */
    .score-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 6px 12px;
      border-radius: 8px;
      min-width: 64px;

      .score-pct   { font-size: 16px; font-weight: 700; line-height: 1; }
      .score-label { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; margin-top: 2px; }

      &.tier-high   { background: #dcfce7; .score-pct { color: #15803d; } .score-label { color: #15803d; } }
      &.tier-medium { background: #fef9c3; .score-pct { color: #a16207; } .score-label { color: #a16207; } }
      &.tier-low    { background: #fee2e2; .score-pct { color: #b91c1c; } .score-label { color: #b91c1c; } }
    }

    /* Warning */
    .merge-warning {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin: 0 28px 20px;
      padding: 12px 14px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 8px;
      font-size: 12px;
      color: #92400e;
      line-height: 1.5;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #d97706; flex-shrink: 0; margin-top: 1px; }
    }

    /* Footer */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 28px 24px;
      border-top: 1px solid #f0f0f0;
    }

    .cancel-btn {
      border: 2px solid #e5e7eb;
      color: #374151;
      font-weight: 600;
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
    }

    .merge-btn {
      background: #000;
      color: #fff;
      font-weight: 700;
      height: 40px;
      padding: 0 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
      &:disabled { background: #e5e7eb; color: #9ca3af; }
    }
  `],
})
export class MergeDialogComponent {
  selectedCaseId   = signal<string>('');
  selectedCaseIdValue = '';  // ngModel bridge

  constructor(
    public dialogRef: MatDialogRef<MergeDialogComponent, MergeDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: MergeDialogData,
  ) {
    // Pre-select the highest scoring ref
    const top = data.draft.similarRefs[0];
    if (top) {
      this.selectedCaseId.set(top.caseId);
      this.selectedCaseIdValue = top.caseId;
    }
  }

  getTierClass(score: number): string {
    if (score >= 80) return 'tier-high';
    if (score >= 40) return 'tier-medium';
    return 'tier-low';
  }

  getTierLabel(score: number): string {
    if (score >= 80) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  confirm(): void {
    if (!this.selectedCaseId()) return;
    this.dialogRef.close({ action: 'merge', targetCaseId: this.selectedCaseId() });
  }

  cancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}