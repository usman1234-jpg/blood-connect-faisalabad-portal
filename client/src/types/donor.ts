
export interface Donor {
  id: string;
  name: string;
  contact: string;
  city: string;
  university: string;
  department: string;
  semester: string;
  gender: 'Male' | 'Female';
  bloodGroup: BloodGroup;
  lastDonationDate: string;
  nextDonationDate?: string;
  isHostelResident: boolean;
  semesterEndDate?: string;
  dateAdded: string;
  createdAt: string;
}

export interface InsertDonor {
  name: string;
  contact: string;
  city: string;
  university: string;
  department: string;
  semester: string;
  gender: 'Male' | 'Female';
  bloodGroup: BloodGroup;
  lastDonationDate: string;
  nextDonationDate?: string;
  isHostelResident: boolean;
  semesterEndDate?: string;
  dateAdded: string;
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

export const bloodCompatibility: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

export const calculateNextDonationDate = (lastDonationDate: string): string => {
  if (!lastDonationDate) return '';
  
  const lastDate = new Date(lastDonationDate);
  const nextDate = new Date(lastDate);
  nextDate.setMonth(nextDate.getMonth() + 3);
  
  return nextDate.toISOString().split('T')[0];
};

export const hasDonorGraduated = (semesterEndDate?: string): boolean => {
  if (!semesterEndDate) return false;
  
  const endDate = new Date(semesterEndDate);
  const today = new Date();
  
  return endDate < today;
};
