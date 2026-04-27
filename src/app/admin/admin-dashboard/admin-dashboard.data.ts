export const MOCK_USER = {
  name: 'John Doe',
  initial: 'J',
  level: '3rd year'
};

export type FinanceIcon = 'coins' | 'card' | 'chart';

export interface FinanceCard {
  title: string;
  amount: string;
  icon: FinanceIcon;
  active?: boolean;
}

export const MOCK_FINANCE_CARDS: FinanceCard[] = [
  { title: 'Total Payable', amount: '$10,000', icon: 'coins' },
  { title: 'Total Paid', amount: '$5,000', icon: 'card', active: true },
  { title: 'Others', amount: '$300', icon: 'chart' }
];

export interface DashboardCourse {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
}

export const MOCK_COURSES: DashboardCourse[] = [
  { id: '1', title: 'Advanced Mathematics', subtitle: 'Prof. Smith', progress: 75 },
  { id: '2', title: 'Physics 101', subtitle: 'Prof. Johnson', progress: 40 }
];


export interface Instructor {
  id: string;
  name: string;
  avatar: string;
}

export const MOCK_INSTRUCTORS: Instructor[] = [
  { id: '1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?u=3' }
];

export const MOCK_DAILY_NOTICE = {
  title: 'Prelim payment due',
  description: 'Please complete your prelim payment to avoid penalties.'
};

export const MOCK_EXAM_SCHEDULE = {
  title: 'Midterm Exams',
  description: 'Midterm exams begin on October 15th.'
};

export interface SidebarLink {
  label: string;
  icon: string;
  link: string;
  active?: boolean;
}

export const SIDEBAR_LINKS: SidebarLink[] = [
  { label: 'Dashboard', icon: 'dashboard', link: '/admin/dashboard', active: true },
  { label: 'Students', icon: 'students', link: '/admin/students' },
  { label: 'Courses', icon: 'courses', link: '/admin/courses' },
  { label: 'Reports', icon: 'reports', link: '/admin/reports' }
];
