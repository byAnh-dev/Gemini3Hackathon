
export interface UserPreferences {
  onboarded: boolean;
  workStyle: 'early' | 'last-minute';
  notificationChannel: 'SMS' | 'Discord' | 'In-App';
  reminderFrequency: 'standard' | 'aggressive';
  phoneNumber?: string;
  discordHandle?: string;
  agentPersonality?: 'concise' | 'verbose' | 'supportive';
}

export interface Task {
  id: string;
  courseId: string;
  title: string;
  deadline: string; // ISO string
  type: 'assignment' | 'exam' | 'project' | 'quiz';
  description?: string;
  materials?: string[];
  completed: boolean;
  points: number;
  riskScore: number; // 1-10
}

export interface Course {
  id: string;
  code: string;
  name: string;
  syllabusProcessed: boolean;
  instructor: string;
  canvasConnected: boolean;
  icon?: string; // Icon name from lucide
  syllabusSummary?: string;
}

export interface WeeklyPlan {
  weekStarting: string;
  blocks: TimeBlock[];
}

export interface TimeBlock {
  id: string;
  day: string; // 'Mon', 'Tue', etc.
  startTime: number; // 24h format decimal (e.g. 9.5 for 9:30 AM)
  duration: number; // in hours
  title: string;
  description?: string;
  type: 'class' | 'focus' | 'personal';
  color?: string;
}

export interface AIStarterResponse {
  summary: string;
  steps: string[];
  estimatedTime: string;
  linkedResources: string[];
}
