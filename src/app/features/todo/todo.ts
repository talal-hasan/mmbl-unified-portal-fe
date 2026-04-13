import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  caseId?: string;
  caseName?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  dueDate?: Date;
  createdDate: Date;
  completedDate?: Date;
  assignedTo?: string;
  tags: string[];
}

export interface DashboardStats {
  totalCases: number;
  totalTodos: number;
  openCases: number;
  closedCases: number;
}
@Component({
  selector: 'app-todo',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    DragDropModule
  ],
  templateUrl: './todo.html',
  styleUrl: './todo.scss',
})
export class Todo implements OnInit {
  displayedColumns: string[] = ['title', 'description', 'case', 'priority', 'status', 'dueDate', 'actions'];
  dataSource: MatTableDataSource<TodoItem>;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // View mode - Changed to 'list' as default
  viewMode: 'list' | 'grid' | 'kanban' = 'list';

  // Filter and search
  searchQuery = '';
  filterStatus: string = 'all';
  filterPriority: string = 'all';

  // Current user name - Set this from your auth service
  currentUserName = 'John Doe'; // Default user name

  // Dashboard stats
  stats: DashboardStats = {
    totalCases: 157,
    totalTodos: 0,
    openCases: 89,
    closedCases: 68
  };

  // Todos data
  todos: TodoItem[] = [
    {
      id: '1',
      title: 'Review HVAC System Documentation',
      description: 'Complete review of all HVAC maintenance records for Building A',
      caseId: 'CASE-8391',
      caseName: 'HVAC Routine Service 2',
      priority: 'High',
      status: 'In Progress',
      dueDate: new Date('2025-03-10'),
      createdDate: new Date('2025-03-01'),
      assignedTo: 'Kathryn Murphy',
      tags: ['documentation', 'hvac', 'building-a']
    },
    {
      id: '2',
      title: 'Update Preventative Maintenance Schedule',
      description: 'Revise quarterly maintenance schedule based on new equipment',
      caseId: 'CASE-8392',
      caseName: 'HVAC Preventive Care',
      priority: 'Medium',
      status: 'Open',
      dueDate: new Date('2025-03-15'),
      createdDate: new Date('2025-03-02'),
      assignedTo: 'Leslie Alexander',
      tags: ['scheduling', 'preventative']
    },
    {
      id: '3',
      title: 'Conduct Safety Inspection',
      description: 'Perform comprehensive safety check of all electrical panels',
      caseId: 'CASE-8393',
      caseName: 'Electrical Panel Upgrade',
      priority: 'Critical',
      status: 'Open',
      dueDate: new Date('2025-03-08'),
      createdDate: new Date('2025-03-03'),
      assignedTo: 'Theresa Webb',
      tags: ['safety', 'electrical', 'inspection']
    },
    {
      id: '4',
      title: 'Order Replacement Parts',
      description: 'Source and order replacement filters and belts for HVAC units',
      caseId: 'CASE-8391',
      caseName: 'HVAC Routine Service 2',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: new Date('2025-03-12'),
      createdDate: new Date('2025-03-01'),
      assignedTo: 'Guy Hawkins',
      tags: ['procurement', 'parts']
    },
    {
      id: '5',
      title: 'Complete Monthly Report',
      description: 'Compile and submit monthly maintenance activities report',
      priority: 'Low',
      status: 'Completed',
      dueDate: new Date('2025-03-05'),
      createdDate: new Date('2025-02-28'),
      completedDate: new Date('2025-03-04'),
      assignedTo: 'Annette Black',
      tags: ['reporting', 'monthly']
    },
    {
      id: '6',
      title: 'Schedule Team Training',
      description: 'Organize training session for new HVAC equipment',
      caseId: 'CASE-8394',
      caseName: 'HVAC Monthly Inspection',
      priority: 'Low',
      status: 'Open',
      dueDate: new Date('2025-03-20'),
      createdDate: new Date('2025-03-04'),
      assignedTo: 'Bessie Cooper',
      tags: ['training', 'team']
    },
    {
      id: '7',
      title: 'Update Equipment Database',
      description: 'Add new equipment entries and update maintenance history',
      priority: 'Medium',
      status: 'In Progress',
      dueDate: new Date('2025-03-14'),
      createdDate: new Date('2025-03-05'),
      assignedTo: 'Robert Fox',
      tags: ['database', 'equipment']
    },
    {
      id: '8',
      title: 'Client Meeting Preparation',
      description: 'Prepare presentation for quarterly client review meeting',
      priority: 'High',
      status: 'Open',
      dueDate: new Date('2025-03-09'),
      createdDate: new Date('2025-03-05'),
      assignedTo: 'Jenny Wilson',
      tags: ['meeting', 'client']
    }
  ];

  // Available cases for dropdown
  availableCases = [
    { id: 'CASE-8391', name: 'HVAC Routine Service 2' },
    { id: 'CASE-8392', name: 'HVAC Preventive Care' },
    { id: 'CASE-8393', name: 'Electrical Panel Upgrade' },
    { id: 'CASE-8394', name: 'HVAC Monthly Inspection' },
    { id: 'CASE-8395', name: 'Plumbing Leak Repair' },
    { id: 'CASE-8396', name: 'General Maintenance' }
  ];

  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.todos);
  }

  ngOnInit() {
    this.updateStats();
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Statistics
  updateStats() {
    this.stats.totalTodos = this.todos.length;
  }

  getOpenTodos(): number {
    return this.todos.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  }

  getCompletedTodos(): number {
    return this.todos.filter(t => t.status === 'Completed').length;
  }

  getOverdueTodos(): number {
    const now = new Date();
    return this.todos.filter(t => 
      t.dueDate && t.dueDate < now && t.status !== 'Completed'
    ).length;
  }

  // Filter and search
  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchQuery = filterValue.trim().toLowerCase();
    this.applyFilters();
  }

  createFilter(): (data: TodoItem, filter: string) => boolean {
    return (data: TodoItem, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      
      const matchesSearch = !searchTerms.search || 
        data.title.toLowerCase().includes(searchTerms.search) ||
        data.description.toLowerCase().includes(searchTerms.search) ||
        (data.caseName && data.caseName.toLowerCase().includes(searchTerms.search)) ||
        data.tags.some(tag => tag.toLowerCase().includes(searchTerms.search));

      const matchesStatus = searchTerms.status === 'all' || 
        data.status === searchTerms.status;

      const matchesPriority = searchTerms.priority === 'all' || 
        data.priority === searchTerms.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    };
  }

  applyFilters() {
    const filterValue = {
      search: this.searchQuery,
      status: this.filterStatus,
      priority: this.filterPriority
    };
    
    this.dataSource.filter = JSON.stringify(filterValue);
  }

  filterByStatus(status: string) {
    this.filterStatus = status;
    this.applyFilters();
  }

  filterByPriority(priority: string) {
    this.filterPriority = priority;
    this.applyFilters();
  }

  clearFilters() {
    this.searchQuery = '';
    this.filterStatus = 'all';
    this.filterPriority = 'all';
    this.applyFilters();
  }

  // CRUD operations
  createTodo() {
    const dialogRef = this.dialog.open(TodoFormDialogComponent, {
      width: '600px',
      data: {
        todo: null,
        availableCases: this.availableCases,
        currentUserName: this.currentUserName // Pass current user name
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const newTodo: TodoItem = {
          id: `todo-${Date.now()}`,
          title: result.title,
          description: result.description || '',
          caseId: result.caseId,
          caseName: result.caseName,
          priority: result.priority,
          status: result.status,
          dueDate: result.dueDate,
          createdDate: new Date(),
          assignedTo: result.assignedTo,
          tags: result.tags || []
        };
        this.todos.push(newTodo);
        this.dataSource.data = this.todos;
        this.updateStats();
      }
    });
  }

  editTodo(todo: TodoItem) {
    const dialogRef = this.dialog.open(TodoFormDialogComponent, {
      width: '600px',
      data: {
        todo: { ...todo },
        availableCases: this.availableCases,
        currentUserName: this.currentUserName
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const index = this.todos.findIndex(t => t.id === todo.id);
        if (index > -1) {
          this.todos[index] = {
            id: todo.id,
            title: result.title,
            description: result.description || '',
            caseId: result.caseId,
            caseName: result.caseName,
            priority: result.priority,
            status: result.status,
            dueDate: result.dueDate,
            createdDate: todo.createdDate,
            completedDate: result.status === 'Completed' ? new Date() : todo.completedDate,
            assignedTo: result.assignedTo,
            tags: result.tags || []
          };
          this.dataSource.data = this.todos;
        }
      }
    });
  }

  completeTodo(todo: TodoItem) {
    const index = this.todos.findIndex(t => t.id === todo.id);
    if (index > -1) {
      this.todos[index].status = 'Completed';
      this.todos[index].completedDate = new Date();
      this.dataSource.data = this.todos;
    }
  }

  deleteTodo(todo: TodoItem) {
    const index = this.todos.findIndex(t => t.id === todo.id);
    if (index > -1) {
      this.todos.splice(index, 1);
      this.dataSource.data = this.todos;
      this.updateStats();
    }
  }

  // View mode
  setViewMode(mode: 'list' | 'grid' | 'kanban') {
    this.viewMode = mode;
  }

  // Drag and drop for Kanban
  dropKanban(event: CdkDragDrop<TodoItem[]>, newStatus: 'Open' | 'In Progress' | 'Completed') {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update the status of the moved todo
      const movedTodo = event.container.data[event.currentIndex];
      const todoIndex = this.todos.findIndex(t => t.id === movedTodo.id);
      if (todoIndex > -1) {
        this.todos[todoIndex].status = newStatus;
        if (newStatus === 'Completed' && !this.todos[todoIndex].completedDate) {
          this.todos[todoIndex].completedDate = new Date();
        }
        this.dataSource.data = this.todos;
      }
    }
  }

  // Helpers
  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Critical': return '#dc2626';  // Red
      case 'High': return '#000000';      // Black
      case 'Medium': return '#6b7280';    // Gray
      case 'Low': return '#ffffff';       // White (with border)
      default: return '#6b7280';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#6b7280';
      case 'Open': return '#000000';
      case 'Cancelled': return '#dc2626';
      default: return '#6b7280';
    }
  }

  isOverdue(todo: TodoItem): boolean {
    if (!todo.dueDate || todo.status === 'Completed') return false;
    return new Date(todo.dueDate) < new Date();
  }

  getKanbanTodos(status: string): TodoItem[] {
    return this.dataSource.filteredData.filter(t => t.status === status);
  }

  // Get drop list IDs for connected lists
  getKanbanDropListIds(): string[] {
    return ['kanban-open', 'kanban-in-progress', 'kanban-completed'];
  }
}

// Todo Form Dialog Component
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-todo-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatIconModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatStepperModule
  ],
  template: `
    <div class="modern-todo-dialog">
      <!-- Header -->
      <div class="dialog-header">
        <div class="header-content">
          <div class="icon-circle">
            <mat-icon>{{ data.todo ? 'edit' : 'add_task' }}</mat-icon>
          </div>
          <div class="header-text">
            <h2>{{ data.todo ? 'Edit' : 'Create New' }} TODO</h2>
            <p>{{ data.todo ? 'Update task details' : 'Add a new task to your list' }}</p>
          </div>
        </div>
        <button class="close-btn" (click)="onCancel()" mat-icon-button>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-divider></mat-divider>

      <!-- Form Content -->
      <div class="dialog-content">
        <form [formGroup]="todoForm" class="modern-form">
          
          <!-- Basic Information Section -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon>info</mat-icon>
              <h3>Basic Information</h3>
            </div>
            
            <div class="form-fields">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Task Title</mat-label>
                <input 
                  matInput 
                  formControlName="title" 
                  placeholder="Enter a descriptive title"
                  autocomplete="off">
                <mat-icon matPrefix>title</mat-icon>
                <mat-error *ngIf="todoForm.get('title')?.hasError('required')">
                  Title is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea 
                  matInput 
                  formControlName="description" 
                  rows="4" 
                  placeholder="Provide additional details about this task"></textarea>
                <mat-icon matPrefix>description</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Classification Section -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon>category</mat-icon>
              <h3>Classification</h3>
            </div>
            
            <div class="form-fields">
              <div class="form-row">
                <mat-form-field appearance="outline" class="priority-field">
                  <mat-label>Priority</mat-label>
                  <mat-select formControlName="priority">
                    <mat-option value="Low">
                      <span class="priority-option low">
                        <mat-icon>flag</mat-icon>
                        Low Priority
                      </span>
                    </mat-option>
                    <mat-option value="Medium">
                      <span class="priority-option medium">
                        <mat-icon>flag</mat-icon>
                        Medium Priority
                      </span>
                    </mat-option>
                    <mat-option value="High">
                      <span class="priority-option high">
                        <mat-icon>flag</mat-icon>
                        High Priority
                      </span>
                    </mat-option>
                    <mat-option value="Critical">
                      <span class="priority-option critical">
                        <mat-icon>flag</mat-icon>
                        Critical
                      </span>
                    </mat-option>
                  </mat-select>
                  <mat-icon matPrefix>flag</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="status-field">
                  <mat-label>Status</mat-label>
                  <mat-select formControlName="status">
                    <mat-option value="Open">
                      <span class="status-option open">
                        <mat-icon>radio_button_unchecked</mat-icon>
                        Open
                      </span>
                    </mat-option>
                    <mat-option value="In Progress">
                      <span class="status-option progress">
                        <mat-icon>sync</mat-icon>
                        In Progress
                      </span>
                    </mat-option>
                    <mat-option value="Completed">
                      <span class="status-option completed">
                        <mat-icon>check_circle</mat-icon>
                        Completed
                      </span>
                    </mat-option>
                    <mat-option value="Cancelled">
                      <span class="status-option cancelled">
                        <mat-icon>cancel</mat-icon>
                        Cancelled
                      </span>
                    </mat-option>
                  </mat-select>
                  <mat-icon matPrefix>pending_actions</mat-icon>
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Associated Case</mat-label>
                <mat-select formControlName="caseId">
                  <mat-option [value]="null">
                    <span class="case-option none">
                      <mat-icon>remove_circle_outline</mat-icon>
                      No Case
                    </span>
                  </mat-option>
                  <mat-option *ngFor="let case of availableCases" [value]="case.id">
                    <span class="case-option">
                      <mat-icon>folder</mat-icon>
                      {{ case.id }} - {{ case.name }}
                    </span>
                  </mat-option>
                </mat-select>
                <mat-icon matPrefix>folder_open</mat-icon>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Scheduling Section -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon>schedule</mat-icon>
              <h3>Scheduling</h3>
            </div>
            
            <div class="form-fields">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Due Date</mat-label>
                <input 
                  matInput 
                  [matDatepicker]="picker" 
                  formControlName="dueDate"
                  placeholder="Select due date">
                <mat-icon matPrefix>event</mat-icon>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-hint>Set a deadline for this task</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Assigned To</mat-label>
                <input 
                  matInput 
                  formControlName="assignedTo" 
                  placeholder="Enter assignee name">
                <mat-icon matPrefix>person</mat-icon>
                <mat-hint>Person responsible for this task</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <mat-divider></mat-divider>

          <!-- Tags Section -->
          <div class="form-section">
            <div class="section-header">
              <mat-icon>label</mat-icon>
              <h3>Tags</h3>
            </div>
            
            <div class="form-fields">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Tags</mat-label>
                <input 
                  matInput 
                  [value]="tagsString" 
                  (input)="updateTags($event)" 
                  placeholder="e.g., urgent, documentation, review">
                <mat-icon matPrefix>local_offer</mat-icon>
                <mat-hint>Separate tags with commas</mat-hint>
              </mat-form-field>

              <!-- Tag Preview -->
              <div class="tags-preview" *ngIf="todoForm.get('tags')?.value?.length > 0">
                <span 
                  *ngFor="let tag of todoForm.get('tags')?.value" 
                  class="tag-chip">
                  <mat-icon>label</mat-icon>
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <mat-divider></mat-divider>

      <!-- Footer Actions -->
      <div class="dialog-footer">
        <div class="footer-info">
          <mat-icon>info</mat-icon>
          <span>All fields except title are optional</span>
        </div>
        
        <div class="footer-actions">
          <button 
            mat-stroked-button 
            class="cancel-btn"
            (click)="onCancel()">
            <mat-icon>close</mat-icon>
            Cancel
          </button>
          <button 
            mat-raised-button 
            class="save-btn"
            [disabled]="!todoForm.valid"
            (click)="onSave()">
            <mat-icon>{{ data.todo ? 'save' : 'add_task' }}</mat-icon>
            {{ data.todo ? 'Update Task' : 'Create Task' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modern-todo-dialog {
      display: flex;
      flex-direction: column;
      min-width: 700px;
      max-width: 800px;
      max-height: 90vh;
      background: #ffffff;
      font-family: 'DM Sans', sans-serif;

      // ===== HEADER =====
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 32px 32px 24px;
        background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);

        .header-content {
          display: flex;
          align-items: center;
          gap: 20px;

          .icon-circle {
            width: 64px;
            height: 64px;
            border-radius: 16px;
            background: linear-gradient(135deg, #000000 0%, #333333 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

            mat-icon {
              font-size: 32px;
              width: 32px;
              height: 32px;
              color: #ffffff;
            }
          }

          .header-text {
            h2 {
              font-size: 28px;
              font-weight: 700;
              color: #000000;
              margin: 0 0 6px 0;
              letter-spacing: -0.5px;
            }

            p {
              font-size: 14px;
              color: #4a4a4a;
              margin: 0;
              font-weight: 500;
            }
          }
        }

        .close-btn {
          mat-icon {
            color: #888888;
          }

          &:hover mat-icon {
            color: #000000;
          }
        }
      }

      // ===== CONTENT =====
      .dialog-content {
        flex: 1;
        overflow-y: auto;
        padding: 0;

        .modern-form {
          .form-section {
            padding: 28px 32px;

            .section-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 24px;

              mat-icon {
                color: #dc2626;
                font-size: 24px;
                width: 24px;
                height: 24px;
              }

              h3 {
                font-size: 18px;
                font-weight: 700;
                color: #000000;
                margin: 0;
              }
            }

            .form-fields {
              display: flex;
              flex-direction: column;
              gap: 20px;

              .full-width {
                width: 100%;
              }

              .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 16px;
              }

              // Custom field styling
              mat-form-field {
                ::ng-deep {
                  .mat-mdc-text-field-wrapper {
                    background-color: #fafafa;
                  }

                  .mat-mdc-form-field-focus-overlay {
                    background-color: transparent;
                  }

                  .mdc-notched-outline__notch {
                    border-right: none;
                  }

                  .mat-mdc-form-field-icon-prefix {
                    padding-right: 12px;
                    color: #888888;
                  }

                  .mdc-text-field--outlined:not(.mdc-text-field--disabled) {
                    &.mdc-text-field--focused {
                      .mdc-notched-outline {
                        .mdc-notched-outline__leading,
                        .mdc-notched-outline__notch,
                        .mdc-notched-outline__trailing {
                          border-color: #dc2626 !important;
                          border-width: 2px !important;
                        }
                      }
                    }
                  }
                }
              }

              // Priority and Status Options
              .priority-option,
              .status-option,
              .case-option {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;

                mat-icon {
                  font-size: 18px;
                  width: 18px;
                  height: 18px;
                }

                &.low mat-icon { color: #10b981; }
                &.medium mat-icon { color: #3b82f6; }
                &.high mat-icon { color: #000000; }
                &.critical mat-icon { color: #dc2626; }
                &.open mat-icon { color: #f59e0b; }
                &.progress mat-icon { color: #3b82f6; }
                &.completed mat-icon { color: #10b981; }
                &.cancelled mat-icon { color: #888888; }
                &.none mat-icon { color: #888888; }
              }

              // Tags Preview
              .tags-preview {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 12px;
                background: #fafafa;
                border-radius: 8px;
                border: 1px solid #e5e5e5;

                .tag-chip {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  padding: 6px 12px;
                  background: #000000;
                  color: #ffffff;
                  border-radius: 6px;
                  font-size: 12px;
                  font-weight: 600;

                  mat-icon {
                    font-size: 14px;
                    width: 14px;
                    height: 14px;
                  }
                }
              }
            }
          }
        }
      }

      // ===== FOOTER =====
      .dialog-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 32px;
        background: #fafafa;
        border-top: 1px solid #e5e5e5;

        .footer-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #888888;
          font-size: 13px;
          font-weight: 500;

          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }

        .footer-actions {
          display: flex;
          gap: 12px;

          .cancel-btn {
            border: 2px solid #e5e5e5;
            color: #4a4a4a;
            font-weight: 600;
            padding: 0 24px;
            height: 44px;
            border-radius: 8px;

            mat-icon {
              margin-right: 4px;
            }

            &:hover {
              border-color: #000000;
              background: #fafafa;
            }
          }

          .save-btn {
            background: #dc2626;
            color: #ffffff;
            font-weight: 700;
            padding: 0 32px;
            height: 44px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);

            mat-icon {
              margin-right: 6px;
            }

            &:hover:not(:disabled) {
              background: #b91c1c;
              box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
            }

            &:disabled {
              background: #e5e5e5;
              color: #888888;
              box-shadow: none;
            }
          }
        }
      }

      // ===== SCROLLBAR =====
      .dialog-content::-webkit-scrollbar {
        width: 6px;
      }

      .dialog-content::-webkit-scrollbar-track {
        background: transparent;
      }

      .dialog-content::-webkit-scrollbar-thumb {
        background: #e5e5e5;
        border-radius: 3px;

        &:hover {
          background: #cccccc;
        }
      }
    }

    // Responsive
    @media (max-width: 768px) {
      .modern-todo-dialog {
        min-width: 100%;
        max-width: 100%;

        .dialog-header {
          padding: 24px 20px 20px;

          .header-content {
            gap: 16px;

            .icon-circle {
              width: 56px;
              height: 56px;

              mat-icon {
                font-size: 28px;
                width: 28px;
                height: 28px;
              }
            }

            .header-text h2 {
              font-size: 24px;
            }
          }
        }

        .dialog-content .modern-form .form-section {
          padding: 20px;

          .form-fields .form-row {
            grid-template-columns: 1fr;
          }
        }

        .dialog-footer {
          flex-direction: column;
          gap: 16px;
          align-items: stretch;

          .footer-info {
            justify-content: center;
          }

          .footer-actions {
            width: 100%;

            button {
              flex: 1;
            }
          }
        }
      }
    }
  `]
})
export class TodoFormDialogComponent implements OnInit {
  todoForm: FormGroup;
  tagsString = '';

  constructor(
    public dialogRef: MatDialogRef<TodoFormDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.todoForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      caseId: [null],
      priority: ['Medium'],
      status: ['Open'],
      dueDate: [null],
      assignedTo: [data.currentUserName || ''],
      tags: [[]]
    });
  }

  get availableCases() {
    return this.data.availableCases || [];
  }

  ngOnInit() {
    if (this.data.todo) {
      this.todoForm.patchValue(this.data.todo);
      this.tagsString = this.data.todo.tags ? this.data.todo.tags.join(', ') : '';
    }
  }

  updateTags(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.tagsString = input;
    const tags = input.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    this.todoForm.patchValue({ tags });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.todoForm.valid) {
      const formValue = this.todoForm.value;
      
      if (formValue.caseId) {
        const selectedCase = this.availableCases.find((c: any) => c.id === formValue.caseId);
        formValue.caseName = selectedCase?.name;
      }
      
      this.dialogRef.close(formValue);
    }
  }
}