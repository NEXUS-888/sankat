export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';

export type Category = 'Conflict' | 'Disaster' | 'Health' | 'Humanitarian' | 'Climate';

export interface Crisis {
  id: number;
  title: string;
  category: Category;
  country: string;
  latitude: number;
  longitude: number;
  severity: Severity;
  summary: string;
  description: string;
  start_date: string;
  is_active: boolean;
}

export interface Charity {
  id: number;
  name: string;
  description: string;
  donation_url: string;
  crisis_id: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface FilterState {
  search: string;
  category: Category | null;
  severity: Severity | null;
}
