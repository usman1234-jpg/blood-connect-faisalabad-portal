
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
  nextDonationDate?: string; // When they can donate next
  isHostelResident: boolean;
  semesterEndDate?: string; // To track graduation/completion
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Updated blood compatibility based on medical standards
export const bloodCompatibility: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal recipient
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

// Updated donation compatibility
export const canDonateTo: Record<BloodGroup, BloodGroup[]> = {
  'A+': ['A+', 'AB+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'AB+': ['AB+'],
  'AB-': ['AB+', 'AB-'],
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] // Universal donor
};

// Helper function to calculate next donation date (3 months after last donation)
export const calculateNextDonationDate = (lastDonationDate: string): string => {
  if (!lastDonationDate) return '';
  
  const date = new Date(lastDonationDate);
  date.setMonth(date.getMonth() + 3);
  return date.toISOString().split('T')[0];
};

// Helper function to check if a donor has completed their semester
export const hasDonorGraduated = (semesterEndDate?: string): boolean => {
  if (!semesterEndDate) return false;
  
  const endDate = new Date(semesterEndDate);
  const today = new Date();
  return endDate < today;
};
