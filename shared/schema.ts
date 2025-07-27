
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  blood_type?: string;
  university?: string;
  graduation_year?: number;
  amount: number;
  donation_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DonorStats {
  total_donors: number;
  total_amount: number;
  avg_amount: number;
  universities_count: number;
}

export interface CreateDonorRequest {
  name: string;
  email?: string;
  phone?: string;
  blood_type?: string;
  university?: string;
  graduation_year?: number;
  amount?: number;
  donation_date?: string;
  notes?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success: boolean;
}
