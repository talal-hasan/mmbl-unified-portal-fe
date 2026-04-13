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
}