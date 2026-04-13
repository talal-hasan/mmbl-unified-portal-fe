import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CasesComponent } from '../cases.component';
import { WorkOrder } from '../cases.models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { MatButtonToggleModule } from '@angular/material/button-toggle';


interface ChecklistItem {
  id: string;
  name: string;
  completed: boolean;
}

interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  avatar: string;
  initials: string;
  color: string;
}

interface FileAttachment {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  date: string;
  type: 'pdf' | 'image' | 'email' | 'document';
  url?: string;
  content?: string;
  extractedText?: string;
}

interface EditableField {
  id: string;
  label: string;
  value: string;
  originalValue: string;
  isEditing: boolean;
  canDrop: boolean;
  hasChanges: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  color: string;
}

interface EmailData {
  from: string;
  to: string;
  cc?: string;
  subject: string;
  message: string;
  recipients: string;
  direction: 'sent' | 'received';
  urgent?: boolean;
}
 
interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  file?: File;
}
 
interface EmailTemplate {
  subject: string;
  message: string;
}
 
// 4. UPDATE YOUR ActivityEntry INTERFACE to include email properties
interface ActivityEntry {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  avatar: string;
  initials: string;
  color: string;
  type?: 'email' | 'action';  // ADD THIS
  emailData?: EmailData;       // ADD THIS
  expanded?: boolean;          // ADD THIS
}


@Component({
  selector: 'app-case-details',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatRadioModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule,
    DragDropModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule
  ],
  templateUrl: './case-details.html',
  styleUrl: './case-details.scss',
})
export class CaseDetails implements OnInit {
  selectedTabIndex = 0;
  showTodoForm = false;
  todoForm!: FormGroup;

  //Email composer state
  showEmailComposer = false;
  emailForm!: FormGroup;
  showCcBcc = false;
  emailAttachments: EmailAttachment[] = [];

  
  
  // Files with enhanced structure including emails and extracted text
  files: FileAttachment[] = [
    {
      id: '1',
      name: 'Work Order Email.eml',
      size: '45 KB',
      uploadedBy: 'Talal Hasan',
      date: '5 Feb, 2025',
      type: 'email',
      content: `From: John Manager <john@company.com>
To: Talal Hasan <talal@company.com>
Subject: Urgent HVAC Maintenance Required - Suite B
Date: February 5, 2025 09:15 AM

Hi Talal,

We need urgent HVAC maintenance in Suite B. The tenant reported that the AC unit is making unusual noises and not cooling properly.

Details:
- Location: Suite B, 2nd Floor
- Asset: TRANE HVAC Unit
- Issue: Loud noise, poor cooling
- Priority: High
- Required completion: February 10, 2025

Please inspect the condenser fan motor and drain pump. Check for any refrigerant leaks as well.

Contact: Sarah Johnson (Tenant)
Phone: (555) 123-4567

Thanks,
John Manager
Facilities Department`
    },
    {
      id: '2',
      name: 'Equipment Manual.pdf',
      size: '2.4 MB',
      uploadedBy: 'John Doe',
      date: '5 Feb, 2025',
      type: 'pdf',
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      extractedText: `TRANE HVAC MAINTENANCE MANUAL

Model: XR-2000
Serial Number: TRN-2025-001

ROUTINE MAINTENANCE SCHEDULE

Monthly Tasks:
1. Inspect and clean air filters
2. Check refrigerant levels
3. Test condenser fan operation
4. Clean condensate drain
5. Inspect electrical connections
6. Verify thermostat operation

Safety Precautions:
- Always disconnect power before maintenance
- Wear appropriate safety equipment
- Check for refrigerant leaks
- Ensure proper ventilation

Warranty Information:
Valid until: December 2026
Service Provider: TRANE Certified Technicians

For technical support, call: 1-800-TRANE-01`
    },
    {
      id: '3',
      name: 'HVAC Location Photo.jpg',
      size: '1.8 MB',
      uploadedBy: 'Abdullah Kareem',
      date: '5 Feb, 2025',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
      extractedText: `HVAC Unit - Suite B
Model: TRANE XR-2000
Location: Rooftop Access Panel 2B
Installation Date: 2020
Serial: TRN-2025-001`
    }
  ];

  // Activity data
  activities: ActivityEntry[] = [
    {
      id: '1',
      user: 'Talal Hasan',
      action: 'Created Todo: Follow-up: HVAC Maintenance in Suite B',
      timestamp: '5 Feb, 2025 at 09:30 AM',
      avatar: 'https://i.pravatar.cc/150?img=15',
      initials: 'TH',
      color: '#3B82F6'
    },
    {
      id: '2',
      user: 'Talal Hasan',
      action: 'Changed status to Open',
      timestamp: '5 Feb, 2025 at 09:35 AM',
      avatar: 'https://i.pravatar.cc/150?img=15',
      initials: 'TH',
      color: '#3B82F6'
    },
    {
      id: '3',
      user: 'John Doe',
      action: 'Updated priority to Urgent',
      timestamp: '5 Feb, 2025 at 10:00 AM',
      avatar: 'https://i.pravatar.cc/150?img=15',
      initials: 'JD',
      color: '#3B82F6'
    },
    {
      id: '4',
      user: 'John Doe',
      action: 'Uploaded Equipment Manual.pdf',
      timestamp: '5 Feb, 2025 at 10:15 AM',
      avatar: 'https://i.pravatar.cc/150?img=15',
      initials: 'JD',
      color: '#3B82F6'
    }
  ];

  // Checklist
  checklists: ChecklistItem[] = [];
  showChecklistPanel = false;
  selectedChecklistTemplate = '';

  // Attachment Viewer
  showAttachmentViewer = false;
  selectedAttachment: FileAttachment | null = null;
  attachmentViewerTab = 0;

  // Editable Fields with change tracking
  editableFields: EditableField[] = [
    { id: 'location', label: 'Location', value: 'Suite B', originalValue: 'Suite B', isEditing: false, canDrop: true, hasChanges: false },
    { id: 'asset', label: 'Asset', value: 'TRANE HVAC Suite B', originalValue: 'TRANE HVAC Suite B', isEditing: false, canDrop: true, hasChanges: false },
    { id: 'category', label: 'Category', value: 'Inspection', originalValue: 'Inspection', isEditing: false, canDrop: true, hasChanges: false },
    { id: 'duration', label: 'Duration', value: '30 minutes', originalValue: '30 minutes', isEditing: false, canDrop: true, hasChanges: false },
    { id: 'contact', label: 'Contact', value: '', originalValue: '', isEditing: false, canDrop: true, hasChanges: false },
    { id: 'phone', label: 'Phone', value: '', originalValue: '', isEditing: false, canDrop: true, hasChanges: false }
  ];

  // Clipboard
  clipboardItems: string[] = [];
  selectedText: string = '';
  isDragging: boolean = false;

  // Change tracking
  hasUnsavedChanges: boolean = false;

  // Team Members
  teamMembers: TeamMember[] = [
    { id: '1', name: 'John Smith', email: 'john.smith@company.com', initials: 'JS', color: '#3B82F6' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.j@company.com', initials: 'SJ', color: '#10B981' },
    { id: '3', name: 'Mike Wilson', email: 'mike.w@company.com', initials: 'MW', color: '#F59E0B' },
    { id: '4', name: 'Emily Davis', email: 'emily.d@company.com', initials: 'ED', color: '#EF4444' },
    { id: '5', name: 'Robert Brown', email: 'robert.b@company.com', initials: 'RB', color: '#8B5CF6' }
  ];

  assignedMember: TeamMember | null = null;

  // Email Templates
  private emailTemplates: { [key: string]: EmailTemplate } = {
    request_info: {
      subject: `Information Required - Case Number`,
      message: `Hello,
  
  I need additional information regarding Case Number - title.
  
  Could you please provide the following:
  - 
  - 
  - 
  
  This will help us move forward with the case resolution.
  
  Thank you,
  [Your Name]`
    },
    update: {
      subject: `Status Update - Title/number`,
      message: `Hello,
  
  This is an update on Case Number - Title.
  
  Current Status: [Status]
  Progress: [Details]
  Next Steps: [Next Steps]
  
  Please let me know if you have any questions.
  
  Best regards,
  [Your Name]`
    },
    approval: {
      subject: `Approval Required - Case number`,
      message: `Hello,
  
  I need your approval for Case 123 - case title.
  
  Details:
  [Provide details here]
  
  Please review and approve at your earliest convenience.
  
  Thank you,
  [Your Name]`
    },
    follow_up: {
      subject: `Follow Up - Case umber`,
      message: `Hello,
  
  Following up on Case 123 - title goes here.
  
  I wanted to check in on the status and see if there's anything you need from our side.
  
  Looking forward to your response.
  
  Best regards,
  [Your Name]`
    }
  };

  constructor(
    public dialogRef: MatDialogRef<CasesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkOrder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    // Initialize TODO form (existing)
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['Medium'],
      status: ['Open'],
      dueDate: [null],
      tags: [[]]
    });
  
    // Initialize EMAIL form (NEW)
    this.emailForm = this.fb.group({
      recipientType: ['team', Validators.required],
      teamRecipient: [[]],
      customerEmail: ['customer@example.com'],
      customEmail: ['', [Validators.email]],
      cc: [''],
      subject: ['', Validators.required],
      message: ['', Validators.required],
      urgent: [false]
    });
  
    // Listen to recipient type changes
    this.emailForm.get('recipientType')?.valueChanges.subscribe((type) => {
      this.updateEmailValidators(type);
    });
  }

  /**
 * Update email form validators based on recipient type
 */
  private updateEmailValidators(type: string): void {
    const teamRecipient = this.emailForm.get('teamRecipient');
    const customerEmail = this.emailForm.get('customerEmail');
    const customEmail = this.emailForm.get('customEmail');
  
    // Clear all validators
    teamRecipient?.clearValidators();
    customerEmail?.clearValidators();
    customEmail?.clearValidators();
  
    // Set required validator based on type
    if (type === 'team') {
      teamRecipient?.setValidators([Validators.required]);
    } else if (type === 'customer') {
      customerEmail?.setValidators([Validators.required, Validators.email]);
    } else if (type === 'custom') {
      customEmail?.setValidators([Validators.required, Validators.email]);
    }
  
    // Update validity
    teamRecipient?.updateValueAndValidity();
    customerEmail?.updateValueAndValidity();
    customEmail?.updateValueAndValidity();
  }

  
  
  /**
   * Open email composer
   */
  openEmailComposer(): void {
    this.showEmailComposer = true;
    
    // Pre-fill customer email if available
    const customerEmail = this.editableFields.find(f => f.id === 'phone')?.value;
    if (customerEmail) {
      this.emailForm.patchValue({
        customerEmail: customerEmail
      });
    }
  
    // Pre-fill subject with case reference
    this.emailForm.patchValue({
      subject: `Regarding Case ${this.data.wo} - ${this.data.title}`
    });
  }
  
  /**
   * Close email composer
   */
  closeEmailComposer(): void {
    this.showEmailComposer = false;
    this.emailForm.reset({
      recipientType: 'team',
      urgent: false
    });
    this.showCcBcc = false;
    this.emailAttachments = [];
  }
  
  /**
   * Use email template
   */
  useEmailTemplate(templateKey: string): void {
    const template = this.emailTemplates[templateKey];
    if (template) {
      this.emailForm.patchValue({
        subject: template.subject,
        message: template.message
      });
      this.snackBar.open('Template applied', 'Close', { duration: 2000 });
    }
  }
  
  /**
   * Attach case files to email
   */
  attachCaseFiles(): void {
    // In a real implementation, this would open a file picker dialog
    // showing files from the case. For now, we'll just show a message.
    this.snackBar.open('Select files from the Files tab', 'Close', { duration: 3000 });
  }
  
  /**
   * Remove email attachment
   */
  removeEmailAttachment(attachment: EmailAttachment): void {
    const index = this.emailAttachments.indexOf(attachment);
    if (index >= 0) {
      this.emailAttachments.splice(index, 1);
    }
  }
  
  /**
   * Send email
   */
  sendEmail(): void {
    if (this.emailForm.valid) {
      const formValue = this.emailForm.value;
      let recipients = '';
      let recipientEmails = '';
  
      // Determine recipients based on type
      if (formValue.recipientType === 'team') {
        const selectedMembers = formValue.teamRecipient as TeamMember[];
        recipients = selectedMembers.map(m => m.name).join(', ');
        recipientEmails = selectedMembers.map(m => m.email).join(', ');
      } else if (formValue.recipientType === 'customer') {
        recipients = 'Customer';
        recipientEmails = formValue.customerEmail;
      } else if (formValue.recipientType === 'custom') {
        recipients = formValue.customEmail;
        recipientEmails = formValue.customEmail;
      }
  
      // Create email data
      const emailData: EmailData = {
        from: 'current.user@company.com', // Replace with actual user email
        to: recipientEmails,
        cc: formValue.cc || undefined,
        subject: formValue.subject,
        message: formValue.message,
        recipients: recipients,
        direction: 'sent',
        urgent: formValue.urgent
      };
  
      // Add to activity log
      const newActivity: ActivityEntry = {
        id: Date.now().toString(),
        user: 'Current User',
        action: `sent email: "${formValue.subject}"`,
        timestamp: new Date().toLocaleString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        avatar: '',
        initials: 'CU',
        color: '#dc2626',
        type: 'email',
        emailData: emailData,
        expanded: false
      };
  
      this.activities.unshift(newActivity);
  
      // Show success message
      this.snackBar.open(`Email sent to ${recipients}`, 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });
  
      // Close composer
      this.closeEmailComposer();
  
      // Mark as having unsaved changes
      this.hasUnsavedChanges = true;
  
      // In a real implementation, you would call an API service here
      console.log('Sending email:', {
        ...emailData,
        attachments: this.emailAttachments
      });
    }
  }
  
  /**
   * Toggle email thread expansion in activity
   */
  toggleEmailThread(activity: ActivityEntry): void {
    activity.expanded = !activity.expanded;
  }
  
  /**
   * Reply to email from activity
   */
  replyToEmail(activity: ActivityEntry): void {
    if (activity.emailData) {
      // Open composer with reply pre-filled
      this.openEmailComposer();
      
      // Set recipient type to custom and pre-fill
      this.emailForm.patchValue({
        recipientType: 'custom',
        customEmail: activity.emailData.from,
        subject: `Re: ${activity.emailData.subject}`,
        message: `\n\n--- Original Message ---\nFrom: ${activity.emailData.from}\nDate: ${activity.timestamp}\nSubject: ${activity.emailData.subject}\n\n${activity.emailData.message}`
      });
  
      this.snackBar.open('Reply started', 'Close', { duration: 2000 });
    }
  }
  
  /**
   * Forward email from activity
   */
  forwardEmail(activity: ActivityEntry): void {
    if (activity.emailData) {
      // Open composer with forward pre-filled
      this.openEmailComposer();
      
      this.emailForm.patchValue({
        subject: `Fwd: ${activity.emailData.subject}`,
        message: `\n\n--- Forwarded Message ---\nFrom: ${activity.emailData.from}\nTo: ${activity.emailData.to}\nDate: ${activity.timestamp}\nSubject: ${activity.emailData.subject}\n\n${activity.emailData.message}`
      });
  
      this.snackBar.open('Forward started', 'Close', { duration: 2000 });
    }
  }
  
  // 8. ADD SAMPLE EMAIL ACTIVITIES TO YOUR activities ARRAY (in ngOnInit or wherever you initialize activities)
  
  // Example of adding a received email to activities
  ngOnInit() {
    // Existing initialization...
  
    // Add sample email correspondence (optional - for demo)
    const sampleReceivedEmail: ActivityEntry = {
      id: 'email-1',
      user: 'John Manager',
      action: 'received email: "Urgent HVAC Maintenance Required"',
      timestamp: '5 Feb, 2025 at 09:15 AM',
      avatar: '',
      initials: 'JM',
      color: '#3b82f6',
      type: 'email',
      emailData: {
        from: 'john.manager@company.com',
        to: 'you@company.com',
        subject: 'Urgent HVAC Maintenance Required - Suite B',
        message: `Hi,
  
  We need urgent HVAC maintenance in Suite B. The tenant reported that the AC unit is making unusual noises and not cooling properly.
  
  Details:
  - Location: Suite B, 2nd Floor
  - Asset: TRANE HVAC Unit
  - Issue: Loud noise, poor cooling
  - Priority: High
  - Required completion: February 10, 2025
  
  Please inspect the condenser fan motor and drain pump. Check for any refrigerant leaks as well.
  
  Contact: Sarah Johnson (Tenant)
  Phone: (555) 123-4567
  
  Thanks,
  John Manager
  Facilities Department`,
        recipients: 'John Manager',
        direction: 'received'
      },
      expanded: false
    };
  
    // Add to beginning of activities array
    this.activities.unshift(sampleReceivedEmail);
  }

  // ngOnInit() {}
  // ngOnInit() {
  //   // Pre-fill TODO form with case details
  //   if (this.data) {
  //     this.todoForm.patchValue({
  //       title: `Follow-up: ${this.data.title}`,
  //       description: `Related to case: ${this.data.wo} - ${this.data.title}`
  //     });
  //   }
  // }

  close() { 
    if (this.hasUnsavedChanges) {
      const confirmClose = confirm('You have unsaved changes. Are you sure you want to close?');
      if (confirmClose) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }

  startTimer() { this.snackBar.open('Timer started', 'Close', { duration: 2000 }); }

  // Checklist Methods
  openNewChecklist() { this.showChecklistPanel = true; }
  closeChecklistPanel() { 
    this.showChecklistPanel = false;
    this.selectedChecklistTemplate = '';
  }
  selectChecklistTemplate(template: string) { this.selectedChecklistTemplate = template; }
  createChecklist() {
    if (this.selectedChecklistTemplate) {
      const newItems: ChecklistItem[] = [
        { id: '1', name: 'Inspect air filters', completed: false },
        { id: '2', name: 'Check refrigerant levels', completed: false },
        { id: '3', name: 'Test condenser fan', completed: false }
      ];
      this.checklists.push(...newItems);
      this.closeChecklistPanel();
      this.snackBar.open('Checklist created', 'Close', { duration: 2000 });
    }
  }

  onChecklistChange() {
    this.hasUnsavedChanges = true;
  }

  uploadFile() { console.log('Upload file'); }
  getPriorityClass(priority: string): string { return `priority-${priority?.toLowerCase()}`; }
  getTotalCost(): number { return 282.50; }

  // Attachment Viewer
  openAttachmentViewer(file: FileAttachment) {
    this.selectedAttachment = file;
    this.showAttachmentViewer = true;
    this.attachmentViewerTab = 0;
  }
  
  closeAttachmentViewer() {
    this.showAttachmentViewer = false;
    this.selectedAttachment = null;
  }
  
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // Field editing and drag-drop
  onFieldClick(field: EditableField) {
    field.isEditing = true;
    setTimeout(() => {
      const input = document.querySelector(`input[ng-reflect-model="${field.value}"]`) as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  }

  onFieldBlur(field: EditableField) {
    field.isEditing = false;
  }

  onFieldChange(field: EditableField) {
    field.hasChanges = field.value !== field.originalValue;
    this.hasUnsavedChanges = this.editableFields.some(f => f.hasChanges);
  }

  onDragOver(event: DragEvent, field: EditableField) {
    event.preventDefault();
    field.isEditing = true;
  }

  onDrop(event: DragEvent, field: EditableField) {
    event.preventDefault();
    const draggedData = event.dataTransfer?.getData('text/plain');
    if (draggedData) {
      field.value = draggedData;
      field.hasChanges = field.value !== field.originalValue;
      this.hasUnsavedChanges = this.editableFields.some(f => f.hasChanges);
    }
    field.isEditing = false;
  }

  // Text selection and clipboard
  onTextSelected() {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      this.selectedText = selection.toString().trim();
    } else {
      this.selectedText = '';
    }
  }

  copyToClipboard() {
    if (this.selectedText) {
      this.clipboardItems.push(this.selectedText);
      navigator.clipboard.writeText(this.selectedText);
      this.snackBar.open('Copied to clipboard', 'Close', { duration: 2000 });
      this.selectedText = '';
    }
  }

  clearClipboard() {
    this.clipboardItems = [];
    this.snackBar.open('Clipboard cleared', 'Close', { duration: 2000 });
  }

  addToChecklist() {
    if (this.selectedText) {
      const newItem: ChecklistItem = {
        id: Date.now().toString(),
        name: this.selectedText,
        completed: false
      };
      this.checklists.push(newItem);
      this.snackBar.open('Added to checklist', 'Close', { duration: 2000 });
      this.selectedText = '';
      this.hasUnsavedChanges = true;
    }
  }

  onDragStart(event: DragEvent, text: string) {
    this.isDragging = true;
    event.dataTransfer?.setData('text/plain', text);
  }

  onDragEnd() {
    this.isDragging = false;
  }

  // Change tracking
  checkForChanges() {
    this.hasUnsavedChanges = this.editableFields.some(field => field.hasChanges);
  }

  // Save changes
  saveChanges() {
    // Update original values
    this.editableFields.forEach(field => {
      field.originalValue = field.value;
      field.hasChanges = false;
    });

    // Add activity entry
    const newActivity: ActivityEntry = {
      id: Date.now().toString(),
      user: 'Current User',
      action: 'Saved changes to case',
      timestamp: new Date().toLocaleString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      avatar: '',
      initials: 'CU',
      color: '#3B82F6'
    };
    this.activities.unshift(newActivity);

    this.hasUnsavedChanges = false;
    this.snackBar.open('Changes saved successfully!', 'Close', { duration: 3000 });

    // Here you would typically make an API call to save the data
    console.log('Saving changes:', {
      fields: this.editableFields,
      checklists: this.checklists,
      assignedMember: this.assignedMember
    });
  }

  // Assign to team member
  assignToTeamMember() {
    // Create a simple dialog to select team member
    const selectedMemberId = prompt(
      'Enter team member number:\n' + 
      this.teamMembers.map((m, i) => `${i + 1}. ${m.name}`).join('\n')
    );

    if (selectedMemberId) {
      const index = parseInt(selectedMemberId) - 1;
      if (index >= 0 && index < this.teamMembers.length) {
        this.assignedMember = this.teamMembers[index];
        
        // Add activity entry
        const newActivity: ActivityEntry = {
          id: Date.now().toString(),
          user: 'Current User',
          action: `Assigned case to ${this.assignedMember.name}`,
          timestamp: new Date().toLocaleString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          avatar: '',
          initials: 'CU',
          color: '#3B82F6'
        };
        this.activities.unshift(newActivity);

        this.snackBar.open(`Case assigned to ${this.assignedMember.name}`, 'Close', { duration: 3000 });
        
        // Auto-save when assigning
        this.saveChanges();
      }
    }
  }

  /**
 * Open TODO creation form
 */
  openTodoForm(): void {
    this.showTodoForm = true;
    // Pre-fill with case info
    this.todoForm.patchValue({
      title: `Follow-up: ${this.data.title}`,
      description: `Related to case ${this.data.wo} - ${this.data.title}`
    });
  }

  /**
   * Close TODO form
   */
  closeTodoForm(): void {
    this.showTodoForm = false;
    this.todoForm.reset({
      priority: 'Medium',
      status: 'Open'
    });
  }

  /**
   * Create TODO from case
   */
  createTodo(): void {
    if (this.todoForm.valid) {
      const todoData = {
        id: Date.now().toString(),
        ...this.todoForm.value,
        caseId: this.data.wo,
        caseName: this.data.title,
        createdDate: new Date(),
        assignedTo: 'Current User'
      };

      console.log('Creating TODO:', todoData);
      
      // Add activity entry
      const newActivity: ActivityEntry = {
        id: Date.now().toString(),
        user: 'Current User',
        action: `Created TODO: ${todoData.title}`,
        timestamp: new Date().toLocaleString('en-US', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        avatar: '',
        initials: 'CU',
        color: '#dc2626'
      };
      this.activities.unshift(newActivity);

      // Show success message
      this.snackBar.open('TODO created successfully!', 'Close', { 
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      this.closeTodoForm();
      
      // TODO: Integrate with your TODO service
      // Example: this.todoService.createTodo(todoData).subscribe(...)
    }
  }


}