
import { Donor } from '../types/donor';

export const isDonorAvailable = (lastDonationDate: string): boolean => {
  if (!lastDonationDate) return true;
  const lastDate = new Date(lastDonationDate);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  return lastDate <= threeMonthsAgo;
};

export const exportDonorsToCSV = (donors: Donor[], isDonorAvailable: (lastDonationDate: string) => boolean) => {
  if (donors.length === 0) return;
  
  const headers = [
    'Name', 'Contact', 'City', 'University', 'Department', 'Semester', 'Gender',
    'Blood Group', 'Last Donation Date', 'Next Donation Date', 'Available', 'Hostel Resident', 'Semester End Date'
  ];
  
  const csvData = donors.map(donor => [
    donor.name, 
    `"${donor.contact}"`, // Quote the phone number to preserve formatting
    donor.city, 
    donor.university, 
    donor.department, 
    donor.semester, 
    donor.gender,
    donor.bloodGroup, 
    donor.lastDonationDate || 'Never', 
    donor.nextDonationDate || 'N/A',
    isDonorAvailable(donor.lastDonationDate) ? 'Yes' : 'No',
    donor.isHostelResident ? 'Yes' : 'No', 
    donor.semesterEndDate || 'N/A'
  ]);

  const csvContent = [headers, ...csvData]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blood_donors_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const getUniversitiesFromDonors = (donors: Donor[]): string[] => {
  return [...new Set(donors.map(donor => donor.university))].filter(Boolean).sort();
};
