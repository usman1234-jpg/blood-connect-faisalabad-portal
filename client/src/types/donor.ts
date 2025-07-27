export interface Donor {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  address?: string;
  university?: string;
  lastDonation?: string;
  createdAt: string;
}

export interface InsertDonor {
  name: string;
  email?: string;
  phone?: string;
  bloodType?: string;
  address?: string;
  university?: string;
  lastDonation?: string;
}