
import { useState, useEffect } from 'react';
import { Donor, InsertDonor } from '../types/donor';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const useDonors = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/donors', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setDonors(data);
        setError(null);
      } else {
        setError('Failed to fetch donors');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const addDonor = async (donorData: InsertDonor): Promise<boolean> => {
    try {
      const response = await fetch('/api/donors', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(donorData),
      });

      if (response.ok) {
        await fetchDonors();
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to add donor');
      return false;
    }
  };

  const updateDonor = async (id: number, donorData: Partial<InsertDonor>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/donors/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(donorData),
      });

      if (response.ok) {
        await fetchDonors();
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to update donor');
      return false;
    }
  };

  const deleteDonor = async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`/api/donors/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        await fetchDonors();
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to delete donor');
      return false;
    }
  };

  const searchDonors = async (query: string): Promise<Donor[]> => {
    try {
      const response = await fetch(`/api/donors/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (err) {
      setError('Search failed');
      return [];
    }
  };

  const addMultipleDonors = async (donorsData: InsertDonor[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/donors/bulk', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ donors: donorsData }),
      });

      if (response.ok) {
        await fetchDonors();
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to add multiple donors');
      return false;
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  return {
    donors,
    loading,
    error,
    fetchDonors,
    addDonor,
    updateDonor,
    deleteDonor,
    searchDonors,
    addMultipleDonors,
  };
};
