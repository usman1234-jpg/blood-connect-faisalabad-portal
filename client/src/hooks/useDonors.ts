
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Donor, calculateNextDonationDate } from '../types/donor';

export const useDonors = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDonors = async () => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedDonors: Donor[] = (data || []).map(donor => ({
        id: donor.id,
        name: donor.name,
        contact: donor.contact,
        city: donor.city,
        university: donor.university,
        department: donor.department,
        semester: donor.semester,
        gender: donor.gender as 'Male' | 'Female',
        bloodGroup: donor.blood_group as any,
        lastDonationDate: donor.last_donation_date || '',
        nextDonationDate: donor.next_donation_date || (donor.last_donation_date ? calculateNextDonationDate(donor.last_donation_date) : ''),
        isHostelResident: donor.is_hostel_resident,
        semesterEndDate: donor.semester_end_date || '',
        dateAdded: donor.date_added
      }));

      setDonors(formattedDonors);
    } catch (error) {
      console.error('Error loading donors:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonors();
  }, []);

  const addDonor = async (donorData: Omit<Donor, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('donors')
        .insert([{
          name: donorData.name,
          contact: donorData.contact,
          city: donorData.city,
          university: donorData.university,
          department: donorData.department,
          semester: donorData.semester,
          gender: donorData.gender,
          blood_group: donorData.bloodGroup,
          last_donation_date: donorData.lastDonationDate || null,
          next_donation_date: donorData.nextDonationDate || null,
          is_hostel_resident: donorData.isHostelResident,
          semester_end_date: donorData.semesterEndDate || null,
          date_added: donorData.dateAdded
        }])
        .select()
        .single();

      if (error) throw error;

      await refreshDonors();
    } catch (error) {
      console.error('Error adding donor:', error);
      throw error;
    }
  };

  const updateDonor = async (updatedDonor: Donor) => {
    try {
      const { error } = await supabase
        .from('donors')
        .update({
          name: updatedDonor.name,
          contact: updatedDonor.contact,
          city: updatedDonor.city,
          university: updatedDonor.university,
          department: updatedDonor.department,
          semester: updatedDonor.semester,
          gender: updatedDonor.gender,
          blood_group: updatedDonor.bloodGroup,
          last_donation_date: updatedDonor.lastDonationDate || null,
          next_donation_date: updatedDonor.nextDonationDate || null,
          is_hostel_resident: updatedDonor.isHostelResident,
          semester_end_date: updatedDonor.semesterEndDate || null
        })
        .eq('id', updatedDonor.id);

      if (error) throw error;

      await refreshDonors();
    } catch (error) {
      console.error('Error updating donor:', error);
      throw error;
    }
  };

  const removeDonor = async (donorId: string) => {
    try {
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('id', donorId);

      if (error) throw error;

      await refreshDonors();
    } catch (error) {
      console.error('Error removing donor:', error);
      throw error;
    }
  };

  const refreshDonors = async () => {
    await loadDonors();
  };

  return {
    donors,
    loading,
    addDonor,
    updateDonor,
    removeDonor,
    refreshDonors
  };
};
