import { Component, ElementRef, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { Todo } from '../todo/todo';
import { CasesComponent } from '../cases/cases.component';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatMenuModule,
    MatProgressBarModule,
    MatListModule,
    Todo,
    CasesComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', './dashboard-sections.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('caseProgressChart') caseProgressChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('todoProgressChart') todoProgressChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('caseTrendChart') caseTrendChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('todoTrendChart') todoTrendChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart') performanceChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('workloadChart') workloadChart?: ElementRef<HTMLCanvasElement>;

  // Tabs configuration
  tabs = ['Analytics', 'Cases', 'Breached', 'Todos'];
  activeTab = 'Cases';
  
  // Analytics data
  caseStats = {
    assigned: 3,
    working: 2,
    completed: 2,
    breached: 1
  };

  todoStats = {
    open: 3,
    inProgress: 3,
    completed: 2
  };

  private charts: Chart[] = [];
  private chartsInitialized = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Component initialized
  }

  ngAfterViewInit(): void {
    // Initialize charts if Analytics tab is active on load
    if (this.activeTab === 'Analytics') {
      setTimeout(() => {
        this.createAnalyticsCharts();
      }, 250);
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => {
      try {
        chart.destroy();
      } catch (e) {
        console.error('Error destroying chart:', e);
      }
    });
    this.charts = [];
    this.chartsInitialized = false;
  }

  // Tab navigation
  onTabChange(tab: string): void {
    this.activeTab = tab;
    
    // Initialize charts when switching to Analytics tab
    if (tab === 'Analytics' && !this.chartsInitialized) {
      setTimeout(() => {
        this.createAnalyticsCharts();
      }, 250);
    }
  }

  // Create all analytics charts
  private createAnalyticsCharts(): void {
    if (this.chartsInitialized) {
      return;
    }

    // Destroy any existing charts first
    this.destroyCharts();

    try {
      this.createCaseProgressChart();
      this.createTodoProgressChart();
      this.createCaseTrendChart();
      this.createTodoTrendChart();
      this.createPerformanceChart();
      this.createWorkloadChart();
      
      this.chartsInitialized = true;
      console.log('All charts initialized successfully');
    } catch (error) {
      console.error('Error initializing charts:', error);
    }
  }

  // Case Progress Donut Chart
  private createCaseProgressChart(): void {
    if (!this.caseProgressChart?.nativeElement) {
      console.warn('Case progress chart canvas not found');
      return;
    }

    const ctx = this.caseProgressChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Assigned', 'Working', 'Completed', 'Breached'],
        datasets: [{
          data: [this.caseStats.assigned, this.caseStats.working, this.caseStats.completed, this.caseStats.breached],
          backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#dc2626'],
          borderWidth: 3,
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
              font: { size: 12, family: 'Inter, sans-serif'},
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.push(chart);
  }

  // TODO Progress Donut Chart
  private createTodoProgressChart(): void {
    if (!this.todoProgressChart?.nativeElement) {
      console.warn('TODO progress chart canvas not found');
      return;
    }

    const ctx = this.todoProgressChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Open', 'In Progress', 'Completed'],
        datasets: [{
          data: [this.todoStats.open, this.todoStats.inProgress, this.todoStats.completed],
          backgroundColor: ['#f59e0b', '#3b82f6', '#10b981'],
          borderWidth: 3,
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
              font: { size: 12, family: 'Inter, sans-serif'},
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.push(chart);
  }

  // Case Trend Line Chart
  private createCaseTrendChart(): void {
    if (!this.caseTrendChart?.nativeElement) return;

    const ctx = this.caseTrendChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Assigned',
            data: [12, 15, 13, 18, 20, 16, 14],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Completed',
            data: [8, 10, 12, 14, 15, 13, 11],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, family: 'Inter, sans-serif' },
              usePointStyle: true,
              padding: 15
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: { size: 11 }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.push(chart);
  }

  // TODO Trend Line Chart
  private createTodoTrendChart(): void {
    if (!this.todoTrendChart?.nativeElement) return;

    const ctx = this.todoTrendChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Created',
            data: [5, 8, 6, 10, 12, 9, 7],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Completed',
            data: [3, 5, 7, 8, 9, 6, 5],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, family: 'Inter, sans-serif' },
              usePointStyle: true,
              padding: 15
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: { size: 11 }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.push(chart);
  }

  // Performance Bar Chart
  private createPerformanceChart(): void {
    if (!this.performanceChart?.nativeElement) return;

    const ctx = this.performanceChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Cases Resolved',
            data: [25, 32, 28, 35],
            backgroundColor: '#3b82f6',
            borderRadius: 6
          },
          {
            label: 'TODOs Completed',
            data: [18, 22, 20, 26],
            backgroundColor: '#10b981',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: { size: 12, family: 'Inter, sans-serif' },
              usePointStyle: true,
              padding: 15
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            ticks: {
              font: { size: 11 }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.push(chart);
  }

  // Workload Distribution Chart
  private createWorkloadChart(): void {
    if (!this.workloadChart?.nativeElement) return;

    const ctx = this.workloadChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: ['Abdullah', 'Dilawar', 'Noman', 'Momina', 'Basit'],
        datasets: [{
          label: 'Assigned Tasks',
          data: [8, 12, 6, 10, 5],
          backgroundColor: [
            '#FF6B9D',
            '#FFB800',
            '#10B981',
            '#8B5CF6',
            '#3B82F6'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            ticks: {
              font: { size: 11 }
            },
            grid: {
              display: false
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, config);
    this.charts.push(chart);
  }
}