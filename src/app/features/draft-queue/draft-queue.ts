import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';

import { CasesService } from '../cases/cases.service';
import { DraftCase, SimilarityTier } from '../cases/cases.models';
import { MergeDialogComponent, MergeDialogResult } from './merge-dialog/merge-dialog';

@Component({
  selector: 'app-draft-queue',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatCheckboxModule, MatButtonModule, MatIconModule,
    MatTooltipModule, MatMenuModule, MatSelectModule,
    MatSnackBarModule, MatDialogModule,
  ],
  templateUrl: './draft-queue.html',
  styleUrl: './draft-queue.scss',
})
export class DraftQueueComponent {
  private casesService = inject(CasesService);
  private router       = inject(Router);
  private snackBar     = inject(MatSnackBar);
  private dialog       = inject(MatDialog);

  // ── Data ───────────────────────────────────────────────────────────────────
  readonly stats    = this.casesService.draftStats;
  readonly allDrafts = this.casesService.drafts;

  // Pending-only drafts for display
  readonly pendingDrafts = computed(() =>
    this.allDrafts().filter(d => d.status === 'Pending')
  );

  // ── Table ──────────────────────────────────────────────────────────────────
  displayedColumns = ['select', 'id', 'subject', 'source', 'similarity', 'similarRefs', 'actions'];
  selection = new SelectionModel<DraftCase>(true, []);

  // ── Filters ────────────────────────────────────────────────────────────────
  similaritySort: 'high-low' | 'low-high' = 'high-low';
  sourceFilter: string = 'all';
  searchValue = '';

  readonly filteredDrafts = computed(() => {
    let list = [...this.pendingDrafts()];

    // Search
    if (this.searchValue.trim()) {
      const q = this.searchValue.toLowerCase();
      list = list.filter(d =>
        d.subject.toLowerCase().includes(q) ||
        d.senderName.toLowerCase().includes(q) ||
        d.senderEmail.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q)
      );
    }

    // Source filter
    if (this.sourceFilter !== 'all') {
      list = list.filter(d => d.source === this.sourceFilter);
    }

    // Sort
    list.sort((a, b) =>
      this.similaritySort === 'high-low'
        ? b.similarityScore - a.similarityScore
        : a.similarityScore - b.similarityScore
    );

    return list;
  });

  // ── Pagination (ERPNext style) ─────────────────────────────────────────────
  pageSize = 10;
  visibleCount = signal(10);

  readonly visibleDrafts = computed(() =>
    this.filteredDrafts().slice(0, this.visibleCount())
  );

  readonly hasMore = computed(() =>
    this.visibleCount() < this.filteredDrafts().length
  );

  readonly remainingCount = computed(() =>
    Math.max(0, this.filteredDrafts().length - this.visibleCount())
  );

  // ── Selection helpers ──────────────────────────────────────────────────────
  isAllSelected(): boolean {
    return this.selection.selected.length === this.filteredDrafts().length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.filteredDrafts().forEach(d => this.selection.select(d));
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  openMergeDialog(draft: DraftCase, event: MouseEvent): void {
    event.stopPropagation();

    if (draft.similarRefs.length === 0) {
      this.snackBar.open('No similar cases found — use "Confirm New" instead', 'Close', { duration: 3000 });
      return;
    }

    const ref = this.dialog.open(MergeDialogComponent, {
      width: '560px',
      panelClass: 'mmbl-dialog',
      data: { draft },
      disableClose: false,
    });

    ref.afterClosed().subscribe((result: MergeDialogResult | undefined) => {
      if (result?.action === 'merge' && result.targetCaseId) {
        this.casesService.mergeDraft(draft.id, result.targetCaseId);
        this.selection.deselect(draft);
        this.snackBar.open(
          `Draft ${draft.id} merged into ${result.targetCaseId}`,
          'View Case',
          { duration: 4000, panelClass: ['snack-success'] }
        );
      }
    });
  }

  confirmNew(draft: DraftCase, event: MouseEvent): void {
    event.stopPropagation();
    const newCase = this.casesService.confirmDraft(draft.id);
    this.selection.deselect(draft);
    this.snackBar.open(
      `New case ${newCase.wo} created`,
      'View Case',
      { duration: 4000, panelClass: ['snack-success'] }
    ).onAction().subscribe(() => {
      this.router.navigate(['/cases']);
    });
  }

  rejectDraft(draft: DraftCase, event: MouseEvent): void {
    event.stopPropagation();
    this.casesService.rejectDraft(draft.id);
    this.selection.deselect(draft);
    this.snackBar.open(`Draft ${draft.id} rejected`, 'Undo', { duration: 3000 });
  }

  bulkConfirm(): void {
    const selected = this.selection.selected;
    if (!selected.length) return;
    this.casesService.bulkConfirm(selected.map(d => d.id));
    this.selection.clear();
    this.snackBar.open(
      `${selected.length} draft(s) confirmed as new cases`,
      'View Cases',
      { duration: 4000, panelClass: ['snack-success'] }
    ).onAction().subscribe(() => this.router.navigate(['/cases']));
  }

  exportReport(): void {
    this.snackBar.open('Export feature coming soon', 'Close', { duration: 2000 });
  }

  loadMore(): void {
    this.visibleCount.update(v => Math.min(v + this.pageSize, this.filteredDrafts().length));
  }

  applySearch(event: Event): void {
    this.searchValue = (event.target as HTMLInputElement).value;
    this.visibleCount.set(this.pageSize);
  }

  // ── Display helpers ────────────────────────────────────────────────────────

  getTierClass(tier: SimilarityTier): string {
    return { HIGH: 'tier-high', MEDIUM: 'tier-medium', LOW: 'tier-low' }[tier];
  }

  getSourceIcon(source: string): string {
    return { Email: 'email', Manual: 'edit', CMS: 'cloud', ServiceNow: 'support_agent' }[source] ?? 'inbox';
  }

  relativeTime(date: Date): string {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  getDisplayedResults(): string {
    const total = this.filteredDrafts().length;
    const shown = Math.min(this.visibleCount(), total);
    return total === 0 ? '0 drafts' : `${shown} of ${total} drafts`;
  }

  navigateToCases(): void {
    this.router.navigate(['/cases']);
  }
}