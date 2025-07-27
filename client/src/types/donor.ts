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

export interface InsertDonor {
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

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const universities = [
  'University of Karachi',
  'NED University of Engineering & Technology',
  'Sindh University',
  'Dow University of Health Sciences',
  'Aga Khan University',
  'Institute of Business Administration (IBA)',
  'Hamdard University',
  'Sir Syed University of Engineering & Technology',
  'Jinnah University for Women',
  'Federal Urdu University'
];