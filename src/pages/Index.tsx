import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Users, User, Calendar, Plus, Download, Heart, MapPin, GraduationCap } from 'lucide-react';
import AddDonorForm from '../components/AddDonorForm';
import DonorSearch from '../components/DonorSearch';
import DonorList from '../components/DonorList';
import { Donor, bloodGroups, bloodCompatibility, calculateNextDonationDate } from '../types/donor';

const Index = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchResults, setSearchResults] = useState<Donor[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [persistedSearchTab, setPersistedSearchTab] = useState<string | null>(null);

  // Load donors from localStorage on component mount
  useEffect(() => {
    const savedDonors = localStorage.getItem('bloodDonors');
    if (savedDonors) {
      try {
        const parsedDonors = JSON.parse(savedDonors);
        // Update donor objects to include new fields if they don't have them
        const updatedDonors = parsedDonors.map((donor: Donor) => ({
          ...donor,
          gender: donor.gender || 'Male',
          nextDonationDate: donor.nextDonationDate || (donor.lastDonationDate ? calculateNextDonationDate(donor.lastDonationDate) : ''),
          isHostelResident: donor.isHostelResident !== undefined ? donor.isHostelResident : false,
          semesterEndDate: donor.semesterEndDate || ''
        }));
        setDonors(updatedDonors);
      } catch (error) {
        console.error("Error parsing donors from localStorage:", error);
        setDonors([]);
      }
    }
  }, []);

  // Save donors to localStorage whenever donors change
  useEffect(() => {
    localStorage.setItem('bloodDonors', JSON.stringify(donors));
  }, [donors]);

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

  // Calculate if donor is available (3+ months since last donation)
  const isDonorAvailable = (lastDonationDate: string): boolean => {
    if (!lastDonationDate) return true;
    const lastDate = new Date(lastDonationDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return lastDate <= threeMonthsAgo;
  };

  // Dashboard statistics
  const totalDonors = donors.length;
  const availableDonors = donors.filter(donor => isDonorAvailable(donor.lastDonationDate) && !donor.isHostelResident).length;
  const hostelResidents = donors.filter(donor => donor.isHostelResident).length;
  const maleDonors = donors.filter(donor => donor.gender === 'Male').length;
  const femaleDonors = donors.filter(donor => donor.gender === 'Female').length;

  // Blood group distribution data
  const bloodGroupData = bloodGroups.map(group => ({
    group,
    count: donors.filter(donor => donor.bloodGroup === group).length,
    percentage: totalDonors > 0 ? ((donors.filter(donor => donor.bloodGroup === group).length / totalDonors) * 100).toFixed(1) : 0
  }));

  // Gender distribution data
  const genderData = [
    { gender: 'Male', count: maleDonors, percentage: totalDonors > 0 ? ((maleDonors / totalDonors) * 100).toFixed(1) : 0 },
    { gender: 'Female', count: femaleDonors, percentage: totalDonors > 0 ? ((femaleDonors / totalDonors) * 100).toFixed(1) : 0 }
  ];

  // City distribution data
  const cityData = [...new Set(donors.map(donor => donor.city))]
    .filter(Boolean)
    .map(city => ({
      city,
      count: donors.filter(donor => donor.city === city).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // University distribution data with colors
  const universityColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f59e0b', '#10b981', '#6366f1'
  ];
  
  const universityData = [...new Set(donors.map(donor => donor.university))]
    .filter(Boolean)
    .map((university, index) => ({
      university,
      shortName: university.split(' ').map(word => word[0]).join('').substring(0, 3),
      count: donors.filter(donor => donor.university === university).length,
      color: universityColors[index % universityColors.length]
    }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  const exportToCSV = () => {
    if (donors.length === 0) return;
    
    const headers = [
      'Name', 'Contact', 'City', 'University', 'Department', 'Semester', 'Gender',
      'Blood Group', 'Last Donation Date', 'Next Donation Date', 'Available', 'Hostel Resident', 'Semester End Date'
    ];
    
    const csvData = donors.map(donor => [
      donor.name, donor.contact, donor.city, donor.university, donor.department, donor.semester, donor.gender,
      donor.bloodGroup, donor.lastDonationDate || 'Never', donor.nextDonationDate || 'N/A',
      isDonorAvailable(donor.lastDonationDate) ? 'Yes' : 'No',
      donor.isHostelResident ? 'Yes' : 'No', donor.semesterEndDate || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => {
        const cellStr = String(cell);
        return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
      }).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood_donors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Blood Donor Portal</h1>
              <p className="text-gray-600">Riphah University Faisalabad</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="add-donor" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Donor
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="donors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All Donors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalDonors}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Donors</CardTitle>
                  <User className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{availableDonors}</div>
                  <p className="text-xs opacity-80">
                    {totalDonors > 0 ? ((availableDonors / totalDonors) * 100).toFixed(1) : 0}% of total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Blood Groups</CardTitle>
                  <Heart className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bloodGroupData.filter(g => g.count > 0).length}</div>
                  <p className="text-xs opacity-80">Types available</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hostel Residents</CardTitle>
                  <MapPin className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hostelResidents}</div>
                  <p className="text-xs opacity-80">Living in hostel</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Universities</CardTitle>
                  <GraduationCap className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{universityData.length}</div>
                  <p className="text-xs opacity-80">Registered</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Blood Group Distribution</CardTitle>
                  <CardDescription>Percentage of donors by blood group</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bloodGroupData.filter(d => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({group, percentage}) => `${group} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {bloodGroupData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>University Distribution</CardTitle>
                  <CardDescription>Donors by university (hover for details)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={universityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="shortName" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} donors`,
                          props.payload.university
                        ]}
                        labelFormatter={(label) => ''}
                      />
                      <Bar dataKey="count" fill="#3b82f6">
                        {universityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>City Distribution</CardTitle>
                  <CardDescription>Number of donors by city</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={cityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                  <CardDescription>Male vs Female donors</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={genderData.filter(d => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({gender, percentage}) => `${gender} (${percentage}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#ec4899" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Blood Group Details</CardTitle>
                  <CardDescription>Count and percentage breakdown with compatibility info</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bloodGroupData.filter(d => d.count > 0).map((group, index) => (
                      <div key={group.group} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <span className="font-bold text-lg">{group.group}</span>
                            {group.group === 'O-' && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Universal Donor</span>}
                            {group.group === 'AB+' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Universal Recipient</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">{group.count} donors</span>
                          <Badge variant="secondary">{group.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="add-donor">
            <AddDonorForm onAddDonor={addDonor} />
          </TabsContent>

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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
