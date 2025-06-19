import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Search, Users, Plus } from 'lucide-react';
import AddDonorForm from '../components/AddDonorForm';
import DonorSearch from '../components/DonorSearch';
import DonorList from '../components/DonorList';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardStats from '../components/dashboard/DashboardStats';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import { Donor, calculateNextDonationDate } from '../types/donor';
import { isDonorAvailable, exportDonorsToCSV } from '../utils/donorUtils';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { useDonors } from '../hooks/useDonors';
import AdminManagement from '../components/AdminManagement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [searchResults, setSearchResults] = useState<Donor[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [persistedSearchTab, setPersistedSearchTab] = useState<string | null>(null);
  const [universities, setUniversities] = useState<string[]>([]);
  const [massEntryState, setMassEntryState] = useState({
    enabled: false,
    preset: {
      university: '',
      department: '',
      semester: '',
      city: 'Faisalabad',
      gender: 'Male',
      isHostelResident: false,
      semesterEndDate: ''
    }
  });
  
  const { user, userRole, isAdmin, isMainAdmin } = useCustomAuth();
  const { donors, loading, addDonor, updateDonor, removeDonor, refreshDonors } = useDonors();
  const { toast } = useToast();

  // Load universities from Supabase
  useEffect(() => {
    const loadUniversities = async () => {
      try {
        const { data, error } = await supabase
          .from('universities')
          .select('name')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        
        const universityNames = data?.map(u => u.name) || [];
        setUniversities(universityNames);
      } catch (error) {
        console.error('Error loading universities:', error);
        toast({
          title: 'Error',
          description: 'Failed to load universities',
          variant: 'destructive'
        });
      }
    };

    loadUniversities();
  }, [toast]);

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

  const handleAddDonor = async (donorData: Omit<Donor, 'id'>) => {
    try {
      await addDonor(donorData);
      toast({
        title: 'Success',
        description: 'Donor added successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error adding donor:', error);
      toast({
        title: 'Error',
        description: 'Failed to add donor',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateDonor = async (updatedDonor: Donor) => {
    try {
      await updateDonor(updatedDonor);
      toast({
        title: 'Success',
        description: 'Donor updated successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating donor:', error);
      toast({
        title: 'Error',
        description: 'Failed to update donor',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveDonor = async (id: string) => {
    try {
      await removeDonor(id);
      toast({
        title: 'Success',
        description: 'Donor removed successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error removing donor:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove donor',
        variant: 'destructive'
      });
    }
  };

  const handleExportCSV = () => {
    exportDonorsToCSV(donors, isDonorAvailable);
  };

  const handleAddUniversity = async (universityName: string) => {
    try {
      const { error } = await supabase
        .from('universities')
        .insert([{ 
          name: universityName,
          added_by: user?.id 
        }]);

      if (error) throw error;

      setUniversities([...universities, universityName]);
      toast({
        title: 'Success',
        description: 'University added successfully!',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error adding university:', error);
      toast({
        title: 'Error',
        description: 'Failed to add university',
        variant: 'destructive'
      });
    }
  };

  const handleMassEntryStateChange = (enabled: boolean, preset: any) => {
    setMassEntryState({ enabled, preset });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 max-w-7xl">
        <DashboardHeader 
          onExportCSV={handleExportCSV} 
          universities={universities}
          onAddUniversity={handleAddUniversity}
        />

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className={`grid w-full ${isMainAdmin ? 'grid-cols-5' : 'grid-cols-4'} mb-4 sm:mb-6 h-auto`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3">
              <BarChart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            {isAdmin && (
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
            {isMainAdmin && (
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

          {isAdmin && (
            <TabsContent value="add-donor">
              <AddDonorForm 
                onAddDonor={handleAddDonor} 
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
              onUpdateDonor={handleUpdateDonor}
              onRemoveDonor={handleRemoveDonor}
              isDonorAvailable={isDonorAvailable}
            />
          </TabsContent>

          {isMainAdmin && (
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
