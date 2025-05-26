import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Search, Users, Plus } from 'lucide-react';
import AddDonorForm from '../components/AddDonorForm';
import DonorSearch from '../components/DonorSearch';
import DonorList from '../components/DonorList';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import { Donor, calculateNextDonationDate, universities as defaultUniversities } from '../types/donor';
import { isDonorAvailable, exportDonorsToCSV, getUniversitiesFromDonors } from '../utils/donorUtils';
import { useAuth } from '../contexts/AuthContext';
import AdminManagement from '../components/AdminManagement';

const Index = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchResults, setSearchResults] = useState<Donor[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [persistedSearchTab, setPersistedSearchTab] = useState<string | null>(null);
  const [universities, setUniversities] = useState<string[]>(defaultUniversities);
  const [massEntryState, setMassEntryState] = useState({ enabled: false, preset: {} });
  const { isAdmin, isMainAdmin, canEdit } = useAuth();

  // Load donors and universities from localStorage on component mount
  useEffect(() => {
    const savedDonors = localStorage.getItem('bloodDonors');
    if (savedDonors) {
      try {
        const parsedDonors = JSON.parse(savedDonors);
        const updatedDonors = parsedDonors.map((donor: Donor) => ({
          ...donor,
          gender: donor.gender || 'Male',
          nextDonationDate: donor.nextDonationDate || (donor.lastDonationDate ? calculateNextDonationDate(donor.lastDonationDate) : ''),
          isHostelResident: donor.isHostelResident !== undefined ? donor.isHostelResident : false,
          semesterEndDate: donor.semesterEndDate || '',
          dateAdded: donor.dateAdded || new Date().toISOString().split('T')[0] // Add current date for existing donors
        }));
        setDonors(updatedDonors);
      } catch (error) {
        console.error("Error parsing donors from localStorage:", error);
        setDonors([]);
      }
    }

    const savedUniversities = localStorage.getItem('universities');
    if (savedUniversities) {
      try {
        const parsedUniversities = JSON.parse(savedUniversities);
        setUniversities([...new Set([...defaultUniversities, ...parsedUniversities])]);
      } catch (error) {
        console.error("Error parsing universities from localStorage:", error);
      }
    }

    // Load mass entry state from localStorage
    const savedMassEntryState = localStorage.getItem('massEntryState');
    if (savedMassEntryState) {
      try {
        const parsedState = JSON.parse(savedMassEntryState);
        setMassEntryState(parsedState);
      } catch (error) {
        console.error("Error parsing mass entry state from localStorage:", error);
      }
    }
  }, []);

  // Save donors to localStorage whenever donors change
  useEffect(() => {
    localStorage.setItem('bloodDonors', JSON.stringify(donors));
  }, [donors]);

  // Save universities to localStorage whenever universities change
  useEffect(() => {
    localStorage.setItem('universities', JSON.stringify(universities));
  }, [universities]);

  // Save mass entry state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('massEntryState', JSON.stringify(massEntryState));
  }, [massEntryState]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    if (activeTab === 'search') {
      setPersistedSearchTab('search');
    }
    
    if (value === 'search' && persistedSearchTab === 'search') {
      // Just switch to search tab, don't clear results
    } else if (value === 'search') {
      setSearchResults([]);
    }
    
    setActiveTab(value);
  };

  const addDonor = (donor: Omit<Donor, 'id'>) => {
    const newDonor: Donor = {
      ...donor,
      id: Date.now().toString(),
      nextDonationDate: donor.lastDonationDate ? calculateNextDonationDate(donor.lastDonationDate) : ''
    };
    setDonors([...donors, newDonor]);
  };

  const updateDonor = (updatedDonor: Donor) => {
    setDonors(donors.map(donor => 
      donor.id === updatedDonor.id ? updatedDonor : donor
    ));
  };

  const removeDonor = (id: string) => {
    setDonors(donors.filter(donor => donor.id !== id));
  };

  const handleExportCSV = () => {
    exportDonorsToCSV(donors, isDonorAvailable);
  };

  const handleAddUniversity = (universityName: string) => {
    if (!universities.includes(universityName)) {
      setUniversities([...universities, universityName]);
    }
  };

  const handleMassEntryStateChange = (enabled: boolean, preset: any) => {
    setMassEntryState({ enabled, preset });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
        <DashboardHeader 
          onExportCSV={handleExportCSV} 
          universities={universities}
          onAddUniversity={handleAddUniversity}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`grid w-full ${isMainAdmin() ? 'grid-cols-5' : 'grid-cols-4'} mb-4 sm:mb-6 h-auto`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <BarChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            {isAdmin() && (
              <TabsTrigger value="add-donor" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Add Donor</span>
                <span className="sm:hidden">Add</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="search" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="donors" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">All Donors</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            {isMainAdmin() && (
              <TabsTrigger value="admin" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">Admin</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            <DashboardStats donors={donors} isDonorAvailable={isDonorAvailable} />
            <DashboardCharts donors={donors} />
          </TabsContent>

          {isAdmin() && (
            <TabsContent value="add-donor">
              <AddDonorForm 
                onAddDonor={addDonor} 
                universities={universities}
                massEntryState={massEntryState}
                onMassEntryStateChange={handleMassEntryStateChange}
              />
            </TabsContent>
          )}

          <TabsContent value="search">
            <DonorSearch 
              donors={donors} 
              onSearchResults={setSearchResults}
              isDonorAvailable={isDonorAvailable}
            />
          </TabsContent>

          <TabsContent value="donors">
            <DonorList 
              donors={donors} 
              onUpdateDonor={updateDonor}
              onRemoveDonor={removeDonor}
              isDonorAvailable={isDonorAvailable}
            />
          </TabsContent>

          {isMainAdmin() && (
            <TabsContent value="admin">
              <AdminManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
