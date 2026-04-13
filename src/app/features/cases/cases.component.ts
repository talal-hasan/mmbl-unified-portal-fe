import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { CaseDetails } from './case-details/case-details';
import { WorkOrder } from './cases.models';

Chart.register(...registerables);

export interface CaseStats {
  assigned: number;
  working: number;
  completed: number;
  breached: number;
}

@Component({
  selector: 'app-cases',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatCheckboxModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    DragDropModule,
    CaseDetails
  ],
  templateUrl: './cases.component.html',
  styleUrl: './cases.component.scss'
})
export class CasesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('progressChart') progressChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
    'select',
    'wo',
    'title',
    'assignedTo',
    'startDate',
    'dueDate',
    'category',
    'priority',
    'location',
    'asset'
  ];

  dataSource: MatTableDataSource<WorkOrder>;
  selection = new SelectionModel<WorkOrder>(true, []);
  
  // View mode
  viewMode: 'list' | 'grid' | 'kanban' = 'list';

  // ERPNext-style Load More pagination
  readonly pageSizeOptions: number[] = [20, 50, 100, 500];
  pageSize: number = 20;
  visibleCount: number = 20;
  isLoadingMore: boolean = false;

  // Filter values
  searchValue = '';
  assignedToFilter = '';
  locationFilter = '';
  priorityFilter = '';

  // Date range filter
  dateRange: 'today' | 'week' | 'quarter' | 'custom' = 'week';
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Statistics
  stats: CaseStats = {
    assigned: 0,
    working: 0,
    completed: 0,
    breached: 0
  };

  private chart?: Chart;

  workOrders: WorkOrder[] = [
    {
      id: '1',
      wo: '2602-839',
      title: 'Request for Transactional Record Against IBFT Ref#543891',
      description: 'Customer requesting detailed transaction history for IBFT reference number 543891',
      assignedTo: {
        name: 'Abdullah Kamran',
        avatar: 'https://i.pravatar.cc/150?img=1',
        initials: 'AK',
        color: '#FF6B9D'
      },
      startDate: '12 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Preventative',
      priority: 'High',
      status: 'Working',
      location: 'Islamabad',
      asset: 'Assembly - TRA...',
      tags: ['transaction', 'ibft', 'urgent']
    },
    {
      id: '2',
      wo: '2602-114',
      title: 'HVAC Routine Service',
      description: 'Regular maintenance check for HVAC system',
      assignedTo: {
        name: 'Dilawar Khan',
        avatar: 'https://i.pravatar.cc/150?img=2',
        initials: 'DK',
        color: '#FFB800'
      },
      startDate: '9 Feb, 26',
      dueDate: 'Today',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Assigned',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'maintenance']
    },
    {
      id: '3',
      wo: '2506-111',
      title: 'Activity Report Against Fraudulent Report Ref#66535',
      description: 'Investigation and reporting on fraudulent activity reference 66535',
      assignedTo: {
        name: 'Noman Ahmed',
        avatar: 'https://i.pravatar.cc/150?img=3',
        initials: 'NA',
        color: '#10B981'
      },
      startDate: '11 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Fraud Mitigation',
      priority: 'High',
      status: 'Working',
      location: 'Area 55',
      asset: 'Fan Assembly - TRA...',
      tags: ['fraud', 'investigation', 'urgent']
    },
    {
      id: '4',
      wo: '2506-003',
      title: 'Data Center Magnetic Tape Replacement',
      description: 'Replace old magnetic tapes in the data center with new storage media',
      assignedTo: {
        name: 'Momina Afzal',
        avatar: 'https://i.pravatar.cc/150?img=4',
        initials: 'MA',
        color: '#8B5CF6'
      },
      startDate: '13 Feb, 26',
      dueDate: '22 Feb, 26',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Completed',
      location: 'Karachi',
      asset: 'Fan Assembly - TRA...',
      tags: ['data-center', 'replacement']
    },
    {
      id: '5',
      wo: '2506-015',
      title: 'Incorrect Balance Statement Ref#14423',
      description: 'Customer reporting incorrect balance in statement reference 14423',
      assignedTo: {
        name: 'Basit Khurram',
        avatar: 'https://i.pravatar.cc/150?img=5',
        initials: 'BK',
        color: '#FF6B9D'
      },
      startDate: '01 Feb, 26',
      dueDate: '13 Feb, 26',
      category: 'Customer Care',
      priority: 'High',
      status: 'Breached',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['balance', 'statement', 'customer-care']
    },
    {
      id: '6',
      wo: '2506-054',
      title: 'HVAC Routine Service',
      description: 'Scheduled HVAC maintenance service',
      assignedTo: {
        name: 'Uzair Amjad',
        avatar: 'https://i.pravatar.cc/150?img=6',
        initials: 'UA',
        color: '#EC4899'
      },
      startDate: '12 Mar, 26',
      dueDate: '23 Mar, 26',
      category: 'Preventative',
      priority: 'Low',
      status: 'Assigned',
      location: 'Islamabad',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'routine']
    },
    {
      id: '7',
      wo: '8391',
      title: 'HVAC Routine Service 2',
      description: 'Secondary HVAC service check',
      assignedTo: {
        name: 'Albert Flores',
        avatar: 'https://i.pravatar.cc/150?img=7',
        initials: 'AF',
        color: '#3B82F6'
      },
      startDate: '14 Mar, 25',
      dueDate: '24 Apr, 25',
      category: 'Meter Reading',
      priority: 'Low',
      status: 'Completed',
      location: 'Suite C',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'meter']
    },
    {
      id: '8',
      wo: '8391',
      title: 'HVAC Preventive Care',
      description: 'Preventive maintenance for HVAC systems',
      assignedTo: {
        name: 'Guy Hawkins',
        avatar: 'https://i.pravatar.cc/150?img=8',
        initials: 'GH',
        color: '#F97316'
      },
      startDate: '15 Mar, 25',
      dueDate: '26 Apr, 25',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Working',
      location: 'Suite B',
      asset: 'Fan Assembly - TRA...',
      tags: ['preventive', 'maintenance']
    },
    {
      id: '9',
      wo: '2602-839',
      title: 'Request for Transactional Record Against IBFT Ref#543891',
      description: 'Customer requesting detailed transaction history for IBFT reference number 543891',
      assignedTo: {
        name: 'Abdullah Kamran',
        avatar: 'https://i.pravatar.cc/150?img=1',
        initials: 'AK',
        color: '#FF6B9D'
      },
      startDate: '12 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Preventative',
      priority: 'High',
      status: 'Working',
      location: 'Islamabad',
      asset: 'Assembly - TRA...',
      tags: ['transaction', 'ibft', 'urgent']
    },
    {
      id: '10',
      wo: '2602-114',
      title: 'HVAC Routine Service',
      description: 'Regular maintenance check for HVAC system',
      assignedTo: {
        name: 'Dilawar Khan',
        avatar: 'https://i.pravatar.cc/150?img=2',
        initials: 'DK',
        color: '#FFB800'
      },
      startDate: '9 Feb, 26',
      dueDate: 'Today',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Assigned',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'maintenance']
    },
    {
      id: '11',
      wo: '2506-111',
      title: 'Activity Report Against Fraudulent Report Ref#66535',
      description: 'Investigation and reporting on fraudulent activity reference 66535',
      assignedTo: {
        name: 'Noman Ahmed',
        avatar: 'https://i.pravatar.cc/150?img=3',
        initials: 'NA',
        color: '#10B981'
      },
      startDate: '11 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Fraud Mitigation',
      priority: 'High',
      status: 'Working',
      location: 'Area 55',
      asset: 'Fan Assembly - TRA...',
      tags: ['fraud', 'investigation', 'urgent']
    },
    {
      id: '12',
      wo: '2506-003',
      title: 'Data Center Magnetic Tape Replacement',
      description: 'Replace old magnetic tapes in the data center with new storage media',
      assignedTo: {
        name: 'Momina Afzal',
        avatar: 'https://i.pravatar.cc/150?img=4',
        initials: 'MA',
        color: '#8B5CF6'
      },
      startDate: '13 Feb, 26',
      dueDate: '22 Feb, 26',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Completed',
      location: 'Karachi',
      asset: 'Fan Assembly - TRA...',
      tags: ['data-center', 'replacement']
    },
    {
      id: '13',
      wo: '2506-015',
      title: 'Incorrect Balance Statement Ref#14423',
      description: 'Customer reporting incorrect balance in statement reference 14423',
      assignedTo: {
        name: 'Basit Khurram',
        avatar: 'https://i.pravatar.cc/150?img=5',
        initials: 'BK',
        color: '#FF6B9D'
      },
      startDate: '01 Feb, 26',
      dueDate: '13 Feb, 26',
      category: 'Customer Care',
      priority: 'High',
      status: 'Breached',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['balance', 'statement', 'customer-care']
    },
    {
      id: '14',
      wo: '2506-054',
      title: 'HVAC Routine Service',
      description: 'Scheduled HVAC maintenance service',
      assignedTo: {
        name: 'Uzair Amjad',
        avatar: 'https://i.pravatar.cc/150?img=6',
        initials: 'UA',
        color: '#EC4899'
      },
      startDate: '12 Mar, 26',
      dueDate: '23 Mar, 26',
      category: 'Preventative',
      priority: 'Low',
      status: 'Assigned',
      location: 'Islamabad',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'routine']
    },
    {
      id: '15',
      wo: '8391',
      title: 'HVAC Routine Service 2',
      description: 'Secondary HVAC service check',
      assignedTo: {
        name: 'Albert Flores',
        avatar: 'https://i.pravatar.cc/150?img=7',
        initials: 'AF',
        color: '#3B82F6'
      },
      startDate: '14 Mar, 25',
      dueDate: '24 Apr, 25',
      category: 'Meter Reading',
      priority: 'Low',
      status: 'Completed',
      location: 'Suite C',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'meter']
    },
    {
      id: '16',
      wo: '8391',
      title: 'HVAC Preventive Care',
      description: 'Preventive maintenance for HVAC systems',
      assignedTo: {
        name: 'Guy Hawkins',
        avatar: 'https://i.pravatar.cc/150?img=8',
        initials: 'GH',
        color: '#F97316'
      },
      startDate: '15 Mar, 25',
      dueDate: '26 Apr, 25',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Working',
      location: 'Suite B',
      asset: 'Fan Assembly - TRA...',
      tags: ['preventive', 'maintenance']
    },
    {
      id: '17',
      wo: '2602-839',
      title: 'Request for Transactional Record Against IBFT Ref#543891',
      description: 'Customer requesting detailed transaction history for IBFT reference number 543891',
      assignedTo: {
        name: 'Abdullah Kamran',
        avatar: 'https://i.pravatar.cc/150?img=1',
        initials: 'AK',
        color: '#FF6B9D'
      },
      startDate: '12 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Preventative',
      priority: 'High',
      status: 'Working',
      location: 'Islamabad',
      asset: 'Assembly - TRA...',
      tags: ['transaction', 'ibft', 'urgent']
    },
    {
      id: '18',
      wo: '2602-114',
      title: 'HVAC Routine Service',
      description: 'Regular maintenance check for HVAC system',
      assignedTo: {
        name: 'Dilawar Khan',
        avatar: 'https://i.pravatar.cc/150?img=2',
        initials: 'DK',
        color: '#FFB800'
      },
      startDate: '9 Feb, 26',
      dueDate: 'Today',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Assigned',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'maintenance']
    },
    {
      id: '19',
      wo: '2506-111',
      title: 'Activity Report Against Fraudulent Report Ref#66535',
      description: 'Investigation and reporting on fraudulent activity reference 66535',
      assignedTo: {
        name: 'Noman Ahmed',
        avatar: 'https://i.pravatar.cc/150?img=3',
        initials: 'NA',
        color: '#10B981'
      },
      startDate: '11 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Fraud Mitigation',
      priority: 'High',
      status: 'Working',
      location: 'Area 55',
      asset: 'Fan Assembly - TRA...',
      tags: ['fraud', 'investigation', 'urgent']
    },
    {
      id: '20',
      wo: '2506-003',
      title: 'Data Center Magnetic Tape Replacement',
      description: 'Replace old magnetic tapes in the data center with new storage media',
      assignedTo: {
        name: 'Momina Afzal',
        avatar: 'https://i.pravatar.cc/150?img=4',
        initials: 'MA',
        color: '#8B5CF6'
      },
      startDate: '13 Feb, 26',
      dueDate: '22 Feb, 26',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Completed',
      location: 'Karachi',
      asset: 'Fan Assembly - TRA...',
      tags: ['data-center', 'replacement']
    },
    {
      id: '21',
      wo: '2506-015',
      title: 'Incorrect Balance Statement Ref#14423',
      description: 'Customer reporting incorrect balance in statement reference 14423',
      assignedTo: {
        name: 'Basit Khurram',
        avatar: 'https://i.pravatar.cc/150?img=5',
        initials: 'BK',
        color: '#FF6B9D'
      },
      startDate: '01 Feb, 26',
      dueDate: '13 Feb, 26',
      category: 'Customer Care',
      priority: 'High',
      status: 'Breached',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['balance', 'statement', 'customer-care']
    },
    {
      id: '22',
      wo: '2506-054',
      title: 'HVAC Routine Service',
      description: 'Scheduled HVAC maintenance service',
      assignedTo: {
        name: 'Uzair Amjad',
        avatar: 'https://i.pravatar.cc/150?img=6',
        initials: 'UA',
        color: '#EC4899'
      },
      startDate: '12 Mar, 26',
      dueDate: '23 Mar, 26',
      category: 'Preventative',
      priority: 'Low',
      status: 'Assigned',
      location: 'Islamabad',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'routine']
    },
    {
      id: '23',
      wo: '8391',
      title: 'HVAC Routine Service 2',
      description: 'Secondary HVAC service check',
      assignedTo: {
        name: 'Albert Flores',
        avatar: 'https://i.pravatar.cc/150?img=7',
        initials: 'AF',
        color: '#3B82F6'
      },
      startDate: '14 Mar, 25',
      dueDate: '24 Apr, 25',
      category: 'Meter Reading',
      priority: 'Low',
      status: 'Completed',
      location: 'Suite C',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'meter']
    },
    {
      id: '24',
      wo: '8391',
      title: 'HVAC Preventive Care',
      description: 'Preventive maintenance for HVAC systems',
      assignedTo: {
        name: 'Guy Hawkins',
        avatar: 'https://i.pravatar.cc/150?img=8',
        initials: 'GH',
        color: '#F97316'
      },
      startDate: '15 Mar, 25',
      dueDate: '26 Apr, 25',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Working',
      location: 'Suite B',
      asset: 'Fan Assembly - TRA...',
      tags: ['preventive', 'maintenance']
    },
    {
      id: '25',
      wo: '2602-839',
      title: 'Request for Transactional Record Against IBFT Ref#543891',
      description: 'Customer requesting detailed transaction history for IBFT reference number 543891',
      assignedTo: {
        name: 'Abdullah Kamran',
        avatar: 'https://i.pravatar.cc/150?img=1',
        initials: 'AK',
        color: '#FF6B9D'
      },
      startDate: '12 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Preventative',
      priority: 'High',
      status: 'Working',
      location: 'Islamabad',
      asset: 'Assembly - TRA...',
      tags: ['transaction', 'ibft', 'urgent']
    },
    {
      id: '26',
      wo: '2602-114',
      title: 'HVAC Routine Service',
      description: 'Regular maintenance check for HVAC system',
      assignedTo: {
        name: 'Dilawar Khan',
        avatar: 'https://i.pravatar.cc/150?img=2',
        initials: 'DK',
        color: '#FFB800'
      },
      startDate: '9 Feb, 26',
      dueDate: 'Today',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Assigned',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'maintenance']
    },
    {
      id: '27',
      wo: '2506-111',
      title: 'Activity Report Against Fraudulent Report Ref#66535',
      description: 'Investigation and reporting on fraudulent activity reference 66535',
      assignedTo: {
        name: 'Noman Ahmed',
        avatar: 'https://i.pravatar.cc/150?img=3',
        initials: 'NA',
        color: '#10B981'
      },
      startDate: '11 Feb, 26',
      dueDate: 'Tomorrow',
      category: 'Fraud Mitigation',
      priority: 'High',
      status: 'Working',
      location: 'Area 55',
      asset: 'Fan Assembly - TRA...',
      tags: ['fraud', 'investigation', 'urgent']
    },
    {
      id: '28',
      wo: '2506-003',
      title: 'Data Center Magnetic Tape Replacement',
      description: 'Replace old magnetic tapes in the data center with new storage media',
      assignedTo: {
        name: 'Momina Afzal',
        avatar: 'https://i.pravatar.cc/150?img=4',
        initials: 'MA',
        color: '#8B5CF6'
      },
      startDate: '13 Feb, 26',
      dueDate: '22 Feb, 26',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Completed',
      location: 'Karachi',
      asset: 'Fan Assembly - TRA...',
      tags: ['data-center', 'replacement']
    },
    {
      id: '29',
      wo: '2506-015',
      title: 'Incorrect Balance Statement Ref#14423',
      description: 'Customer reporting incorrect balance in statement reference 14423',
      assignedTo: {
        name: 'Basit Khurram',
        avatar: 'https://i.pravatar.cc/150?img=5',
        initials: 'BK',
        color: '#FF6B9D'
      },
      startDate: '01 Feb, 26',
      dueDate: '13 Feb, 26',
      category: 'Customer Care',
      priority: 'High',
      status: 'Breached',
      location: 'Lahore',
      asset: 'Fan Assembly - TRA...',
      tags: ['balance', 'statement', 'customer-care']
    },
    {
      id: '30',
      wo: '2506-054',
      title: 'HVAC Routine Service',
      description: 'Scheduled HVAC maintenance service',
      assignedTo: {
        name: 'Uzair Amjad',
        avatar: 'https://i.pravatar.cc/150?img=6',
        initials: 'UA',
        color: '#EC4899'
      },
      startDate: '12 Mar, 26',
      dueDate: '23 Mar, 26',
      category: 'Preventative',
      priority: 'Low',
      status: 'Assigned',
      location: 'Islamabad',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'routine']
    },
    {
      id: '31',
      wo: '8391',
      title: 'HVAC Routine Service 2',
      description: 'Secondary HVAC service check',
      assignedTo: {
        name: 'Albert Flores',
        avatar: 'https://i.pravatar.cc/150?img=7',
        initials: 'AF',
        color: '#3B82F6'
      },
      startDate: '14 Mar, 25',
      dueDate: '24 Apr, 25',
      category: 'Meter Reading',
      priority: 'Low',
      status: 'Completed',
      location: 'Suite C',
      asset: 'Fan Assembly - TRA...',
      tags: ['hvac', 'meter']
    },
    {
      id: '32',
      wo: '8391',
      title: 'HVAC Preventive Care',
      description: 'Preventive maintenance for HVAC systems',
      assignedTo: {
        name: 'Guy Hawkins',
        avatar: 'https://i.pravatar.cc/150?img=8',
        initials: 'GH',
        color: '#F97316'
      },
      startDate: '15 Mar, 25',
      dueDate: '26 Apr, 25',
      category: 'Preventative',
      priority: 'Medium',
      status: 'Working',
      location: 'Suite B',
      asset: 'Fan Assembly - TRA...',
      tags: ['preventive', 'maintenance']
    }
  ];

  constructor(private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.workOrders);
  }

  ngOnInit() {
    this.calculateStats();
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'assignedTo':
          return item.assignedTo.name;
        default:
          return (item as any)[property];
      }
    };
    this.dataSource.filterPredicate = this.createFilter();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    setTimeout(() => this.createProgressChart(), 100);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  // Calculate statistics
  calculateStats() {
    this.stats.assigned = this.workOrders.filter(w => w.status === 'Assigned').length;
    this.stats.working = this.workOrders.filter(w => w.status === 'Working').length;
    this.stats.completed = this.workOrders.filter(w => w.status === 'Completed').length;
    this.stats.breached = this.workOrders.filter(w => w.status === 'Breached').length;
  }

  // Create progress chart
  createProgressChart() {
    if (!this.progressChart) return;

    const ctx = this.progressChart.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Assigned', 'Working', 'Completed', 'Breached'],
        datasets: [{
          data: [this.stats.assigned, this.stats.working, this.stats.completed, this.stats.breached],
          backgroundColor: [
            '#3b82f6',
            '#f59e0b',
            '#10b981',
            '#dc2626'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
                family: 'DM Sans'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // View mode
  setViewMode(mode: 'list' | 'grid' | 'kanban') {
    this.viewMode = mode;
  }

  // Filtering
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach(row => this.selection.select(row));
  }

  onCheckboxClick(event: MouseEvent, row: WorkOrder) {
    event.stopPropagation();
    this.selection.toggle(row);
  }

  openWorkOrderDetail(row: WorkOrder) {
    this.dialog.open(CaseDetails, {
      width: '95vw',
      maxWidth: '1400px',
      height: '90vh',
      maxHeight: '900px',
      panelClass: 'work-order-detail-dialog-container',
      data: row,
      disableClose: false,
      hasBackdrop: true
    });
  }

  applySearch(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchValue = filterValue.trim().toLowerCase();
    this.applyFilters();
  }

  createFilter(): (data: WorkOrder, filter: string) => boolean {
    return (data: WorkOrder, filter: string): boolean => {
      const searchTerms = JSON.parse(filter);
      
      const matchesSearch = !searchTerms.search || 
        data.wo.toLowerCase().includes(searchTerms.search) ||
        data.title.toLowerCase().includes(searchTerms.search) ||
        data.assignedTo.name.toLowerCase().includes(searchTerms.search) ||
        data.category.toLowerCase().includes(searchTerms.search) ||
        data.location.toLowerCase().includes(searchTerms.search) ||
        data.asset.toLowerCase().includes(searchTerms.search);

      const matchesAssignedTo = !searchTerms.assignedTo || 
        data.assignedTo.name.toLowerCase().includes(searchTerms.assignedTo);

      const matchesLocation = !searchTerms.location || 
        data.location.toLowerCase().includes(searchTerms.location);

      const matchesPriority = !searchTerms.priority || 
        data.priority.toLowerCase() === searchTerms.priority;

      return matchesSearch && matchesAssignedTo && matchesLocation && matchesPriority;
    };
  }

  applyFilters() {
    const filterValue = {
      search: this.searchValue,
      assignedTo: this.assignedToFilter.toLowerCase(),
      location: this.locationFilter.toLowerCase(),
      priority: this.priorityFilter.toLowerCase()
    };
    
    this.dataSource.filter = JSON.stringify(filterValue);
    // Reset pagination whenever filters change
    this.visibleCount = this.pageSize;
  }

  filterByAssignedTo(value: string) {
    this.assignedToFilter = value;
    this.applyFilters();
  }

  filterByLocation(value: string) {
    this.locationFilter = value;
    this.applyFilters();
  }

  filterByPriority(value: string) {
    this.priorityFilter = value;
    this.applyFilters();
  }

  clearFilters() {
    this.searchValue = '';
    this.assignedToFilter = '';
    this.locationFilter = '';
    this.priorityFilter = '';
    this.applyFilters();
  }

  // Date range filter
  onDateRangeChange(range: 'today' | 'week' | 'quarter' | 'custom') {
    this.dateRange = range;
    if (range !== 'custom') {
      this.calculateStats();
      this.createProgressChart();
    }
  }

  onCustomDateChange() {
    if (this.startDate && this.endDate) {
      this.calculateStats();
      this.createProgressChart();
    }
  }

  // Kanban drag and drop
  dropKanban(event: CdkDragDrop<WorkOrder[]>, newStatus: 'Assigned' | 'Working' | 'Completed' | 'Breached') {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      const movedCase = event.container.data[event.currentIndex];
      const caseIndex = this.workOrders.findIndex(w => w.id === movedCase.id);
      if (caseIndex > -1) {
        this.workOrders[caseIndex].status = newStatus;
        this.dataSource.data = this.workOrders;
        this.calculateStats();
        this.createProgressChart();
      }
    }
  }

  getKanbanCases(status: string): WorkOrder[] {
    return this.dataSource.filteredData.filter(w => w.status === status);
  }

  getKanbanDropListIds(): string[] {
    return ['kanban-assigned', 'kanban-working', 'kanban-completed', 'kanban-breached'];
  }

  // Helpers
  getPriorityClass(priority: string): string {
    return `priority-${priority.toLowerCase()}`;
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'High': return '#000000';
      case 'Medium': return '#6b7280';
      case 'Low': return '#ffffff';
      default: return '#6b7280';
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Assigned': return '#3b82f6';
      case 'Working': return '#f59e0b';
      case 'Completed': return '#10b981';
      case 'Breached': return '#dc2626';
      default: return '#6b7280';
    }
  }

  isOverdue(workOrder: WorkOrder): boolean {
    return workOrder.status === 'Breached';
  }

  getTotalResults(): number {
    return this.dataSource.filteredData.length;
  }

  // ERPNext-style pagination helpers
  get visibleData(): WorkOrder[] {
    return this.dataSource.filteredData.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.dataSource.filteredData.length;
  }

  get remainingCount(): number {
    return Math.max(0, this.dataSource.filteredData.length - this.visibleCount);
  }

  loadMore() {
    if (this.isLoadingMore || !this.hasMore) return;
    this.isLoadingMore = true;
    // Simulate async fetch — replace with real API call if needed
    setTimeout(() => {
      this.visibleCount = Math.min(
        this.visibleCount + this.pageSize,
        this.dataSource.filteredData.length
      );
      this.isLoadingMore = false;
    }, 300);
  }

  changePageSize(size: number) {
    this.pageSize = size;
    this.visibleCount = size;
  }

  getDisplayedResults(): string {
    const total = this.dataSource.filteredData.length;
    const shown = Math.min(this.visibleCount, total);
    if (total === 0) return '0 results';
    return `${shown} of ${total} results`;
  }
}