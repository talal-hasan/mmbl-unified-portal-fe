import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  email: string;
  role: string;
  status: 'available' | 'busy' | 'offline';
  assignedCases: number;
  completedCases: number;
  efficiency: number; // percentage
  skills: string[];
  joinedDate: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  description: string;
  members: TeamMember[];
  totalCases: number;
  completedCases: number;
  performance: number;
  lead?: string;
  department: string;
}

export interface CaseAssignment {
  id: string;
  title: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo?: string;
  teamId?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
}

@Component({
  selector: 'app-team-management',
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './team-management.html',
  styleUrl: './team-management.scss',
})
export class TeamManagement {
  viewMode: 'grid' | 'compact' | 'analytics' = 'grid';
  searchQuery = '';
  selectedTeam: Team | null = null;
  showMemberDetails = false;
  selectedMember: TeamMember | null = null;

  teams: Team[] = [
    {
      id: 'team-1',
      name: 'HVAC Specialists',
      color: '#6366f1',
      description: 'Heating, ventilation, and air conditioning maintenance team',
      department: 'Facilities',
      lead: 'Kathryn Murphy',
      totalCases: 45,
      completedCases: 38,
      performance: 92,
      members: [
        {
          id: 'member-1',
          name: 'Kathryn Murphy',
          avatar: 'https://i.pravatar.cc/150?img=1',
          email: 'kathryn.murphy@company.com',
          role: 'Team Lead',
          status: 'available',
          assignedCases: 8,
          completedCases: 145,
          efficiency: 95,
          skills: ['HVAC', 'Leadership', 'Preventative Maintenance'],
          joinedDate: '2022-01-15'
        },
        {
          id: 'member-2',
          name: 'Leslie Alexander',
          avatar: 'https://i.pravatar.cc/150?img=2',
          email: 'leslie.alexander@company.com',
          role: 'Senior Technician',
          status: 'busy',
          assignedCases: 12,
          completedCases: 98,
          efficiency: 88,
          skills: ['HVAC', 'Repair', 'Installation'],
          joinedDate: '2022-03-20'
        },
        {
          id: 'member-3',
          name: 'Guy Hawkins',
          avatar: 'https://i.pravatar.cc/150?img=6',
          email: 'guy.hawkins@company.com',
          role: 'Technician',
          status: 'available',
          assignedCases: 6,
          completedCases: 67,
          efficiency: 90,
          skills: ['HVAC', 'Diagnostics'],
          joinedDate: '2023-05-10'
        }
      ]
    },
    {
      id: 'team-2',
      name: 'Electrical Team',
      color: '#f59e0b',
      description: 'Electrical systems installation and maintenance',
      department: 'Facilities',
      lead: 'Theresa Webb',
      totalCases: 32,
      completedCases: 28,
      performance: 87,
      members: [
        {
          id: 'member-4',
          name: 'Theresa Webb',
          avatar: 'https://i.pravatar.cc/150?img=3',
          email: 'theresa.webb@company.com',
          role: 'Team Lead',
          status: 'available',
          assignedCases: 5,
          completedCases: 112,
          efficiency: 93,
          skills: ['Electrical', 'Leadership', 'Safety'],
          joinedDate: '2021-11-08'
        },
        {
          id: 'member-5',
          name: 'Robert Fox',
          avatar: 'https://i.pravatar.cc/150?img=10',
          email: 'robert.fox@company.com',
          role: 'Electrician',
          status: 'busy',
          assignedCases: 9,
          completedCases: 76,
          efficiency: 85,
          skills: ['Electrical', 'Wiring', 'Troubleshooting'],
          joinedDate: '2022-08-15'
        }
      ]
    },
    {
      id: 'team-3',
      name: 'Plumbing Services',
      color: '#10b981',
      description: 'Plumbing installation, repair, and maintenance',
      department: 'Facilities',
      lead: 'Annette Black',
      totalCases: 28,
      completedCases: 24,
      performance: 89,
      members: [
        {
          id: 'member-6',
          name: 'Annette Black',
          avatar: 'https://i.pravatar.cc/150?img=4',
          email: 'annette.black@company.com',
          role: 'Team Lead',
          status: 'available',
          assignedCases: 7,
          completedCases: 134,
          efficiency: 94,
          skills: ['Plumbing', 'Leadership', 'Emergency Response'],
          joinedDate: '2021-06-22'
        },
        {
          id: 'member-7',
          name: 'Jacob Jones',
          avatar: 'https://i.pravatar.cc/150?img=13',
          email: 'jacob.jones@company.com',
          role: 'Plumber',
          status: 'offline',
          assignedCases: 4,
          completedCases: 58,
          efficiency: 82,
          skills: ['Plumbing', 'Installation'],
          joinedDate: '2023-02-14'
        }
      ]
    },
    {
      id: 'team-4',
      name: 'General Maintenance',
      color: '#ec4899',
      description: 'General building maintenance and repairs',
      department: 'Operations',
      lead: 'Bessie Cooper',
      totalCases: 52,
      completedCases: 45,
      performance: 86,
      members: [
        {
          id: 'member-8',
          name: 'Bessie Cooper',
          avatar: 'https://i.pravatar.cc/150?img=5',
          email: 'bessie.cooper@company.com',
          role: 'Team Lead',
          status: 'busy',
          assignedCases: 10,
          completedCases: 156,
          efficiency: 91,
          skills: ['Maintenance', 'Leadership', 'Multi-trade'],
          joinedDate: '2021-03-10'
        },
        {
          id: 'member-9',
          name: 'Albert Flores',
          avatar: 'https://i.pravatar.cc/150?img=7',
          email: 'albert.flores@company.com',
          role: 'Maintenance Tech',
          status: 'available',
          assignedCases: 8,
          completedCases: 92,
          efficiency: 87,
          skills: ['Maintenance', 'Carpentry', 'Painting'],
          joinedDate: '2022-09-05'
        },
        {
          id: 'member-10',
          name: 'Jenny Wilson',
          avatar: 'https://i.pravatar.cc/150?img=12',
          email: 'jenny.wilson@company.com',
          role: 'Maintenance Tech',
          status: 'available',
          assignedCases: 6,
          completedCases: 73,
          efficiency: 89,
          skills: ['Maintenance', 'Cleaning', 'Inspection'],
          joinedDate: '2023-01-18'
        }
      ]
    }
  ];

  unassignedMembers: TeamMember[] = [
    {
      id: 'unassigned-1',
      name: 'Arlene McCoy',
      avatar: 'https://i.pravatar.cc/150?img=9',
      email: 'arlene.mccoy@company.com',
      role: 'Technician',
      status: 'available',
      assignedCases: 0,
      completedCases: 42,
      efficiency: 86,
      skills: ['HVAC', 'Electrical'],
      joinedDate: '2023-08-22'
    },
    {
      id: 'unassigned-2',
      name: 'Devon Lane',
      avatar: 'https://i.pravatar.cc/150?img=11',
      email: 'devon.lane@company.com',
      role: 'Junior Technician',
      status: 'available',
      assignedCases: 0,
      completedCases: 18,
      efficiency: 78,
      skills: ['General Maintenance'],
      joinedDate: '2023-11-05'
    }
  ];

  pendingCases: CaseAssignment[] = [
    {
      id: 'case-1',
      title: 'HVAC System Inspection - Building A',
      priority: 'High',
      status: 'pending'
    },
    {
      id: 'case-2',
      title: 'Electrical Panel Upgrade - Suite 304',
      priority: 'Critical',
      status: 'pending'
    },
    {
      id: 'case-3',
      title: 'Plumbing Leak Repair - Floor 2',
      priority: 'Medium',
      status: 'pending'
    }
  ];

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.calculateTeamStats();
  }

  // Drag and drop handlers
  dropMember(event: CdkDragDrop<TeamMember[]>, teamId?: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update team assignment
      if (teamId) {
        const member = event.container.data[event.currentIndex];
        this.assignMemberToTeam(member.id, teamId);
      }
    }
    this.calculateTeamStats();
  }

  assignMemberToTeam(memberId: string, teamId: string) {
    console.log(`Assigned member ${memberId} to team ${teamId}`);
    // API call would go here
  }

  removeMemberFromTeam(memberId: string, teamId: string) {
    const team = this.teams.find(t => t.id === teamId);
    if (team) {
      const memberIndex = team.members.findIndex(m => m.id === memberId);
      if (memberIndex > -1) {
        const [member] = team.members.splice(memberIndex, 1);
        this.unassignedMembers.push(member);
        this.calculateTeamStats();
      }
    }
  }

  // Team management
  createNewTeam() {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: 'New Team',
      color: '#8b5cf6',
      description: 'Team description',
      department: 'Operations',
      totalCases: 0,
      completedCases: 0,
      performance: 0,
      members: []
    };
    this.teams.push(newTeam);
  }

  deleteTeam(teamId: string) {
    const teamIndex = this.teams.findIndex(t => t.id === teamId);
    if (teamIndex > -1) {
      const team = this.teams[teamIndex];
      // Move members to unassigned
      this.unassignedMembers.push(...team.members);
      this.teams.splice(teamIndex, 1);
    }
  }

  editTeam(team: Team) {
    this.selectedTeam = team;
  }

  // Member management
  viewMemberDetails(member: TeamMember) {
    this.selectedMember = member;
    this.showMemberDetails = true;
  }

  addNewMember() {
    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: 'New Member',
      avatar: 'https://i.pravatar.cc/150?img=14',
      email: 'new.member@company.com',
      role: 'Technician',
      status: 'available',
      assignedCases: 0,
      completedCases: 0,
      efficiency: 0,
      skills: [],
      joinedDate: new Date().toISOString().split('T')[0]
    };
    this.unassignedMembers.push(newMember);
  }

  // Analytics
  calculateTeamStats() {
    this.teams.forEach(team => {
      team.totalCases = team.members.reduce((sum, m) => sum + m.assignedCases, 0);
      team.completedCases = team.members.reduce((sum, m) => sum + m.completedCases, 0);
      
      const avgEfficiency = team.members.length > 0
        ? team.members.reduce((sum, m) => sum + m.efficiency, 0) / team.members.length
        : 0;
      team.performance = Math.round(avgEfficiency);
    });
  }

  getTotalMembers(): number {
    return this.teams.reduce((sum, t) => sum + t.members.length, 0) + this.unassignedMembers.length;
  }

  getTotalActiveCases(): number {
    return this.teams.reduce((sum, t) => sum + t.totalCases, 0);
  }

  getAveragePerformance(): number {
    if (this.teams.length === 0) return 0;
    const total = this.teams.reduce((sum, t) => sum + t.performance, 0);
    return Math.round(total / this.teams.length);
  }

  // View modes
  setViewMode(mode: 'grid' | 'compact' | 'analytics') {
    this.viewMode = mode;
  }

  // Filtering
  getFilteredTeams(): Team[] {
    if (!this.searchQuery) return this.teams;
    
    const query = this.searchQuery.toLowerCase();
    return this.teams.filter(team => 
      team.name.toLowerCase().includes(query) ||
      team.description.toLowerCase().includes(query) ||
      team.members.some(m => m.name.toLowerCase().includes(query))
    );
  }

  // Status helpers
  getStatusColor(status: string): string {
    switch (status) {
      case 'available': return '#10b981';
      case 'busy': return '#f59e0b';
      case 'offline': return '#6b7280';
      default: return '#6b7280';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'available': return 'check_circle';
      case 'busy': return 'schedule';
      case 'offline': return 'cancel';
      default: return 'help';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f59e0b';
      case 'Medium': return '#3b82f6';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  }

  getTopPerformers(): TeamMember[] {
    const allMembers = this.teams.flatMap(team => team.members);
    return allMembers
      .sort((a, b) => b.completedCases - a.completedCases)
      .slice(0, 5);
  }

  // Get connected drop list IDs for drag and drop
  getTeamDropListIds(): string[] {
    return this.teams.map(t => t.id);
  }

  getConnectedDropLists(): string[] {
    return ['unassigned-list', ...this.teams.map(t => t.id)];
  }

}
