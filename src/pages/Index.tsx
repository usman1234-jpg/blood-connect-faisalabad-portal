
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, Users, User, Calendar, Plus, Download } from 'lucide-react';
import AddDonorForm from '../components/AddDonorForm';
import DonorSearch from '../components/DonorSearch';
import DonorList from '../components/DonorList';
import { Donor, bloodGroups, bloodCompatibility } from '../types/donor';

const Index = () => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [searchResults, setSearchResults] = useState<Donor[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Load donors from localStorage on component mount
  useEffect(() => {
    const savedDonors = localStorage.getItem('bloodDonors');
    if (savedDonors) {
      setDonors(JSON.parse(savedDonors));
    }
  }, []);

  // Save donors to localStorage whenever donors change
  useEffect(() => {
    localStorage.setItem('bloodDonors', JSON.stringify(donors));
  }, [donors]);

  const addDonor = (donor: Omit<Donor, 'id'>) => {
    const newDonor: Donor = {
      ...donor,
      id: Date.now().toString(),
    };
    setDonors([...donors, newDonor]);
  };

  const updateDonor = (updatedDonor: Donor) => {
    setDonors(donors.map(donor => 
      donor.id === updatedDonor.id ? updatedDonor : donor
    ));
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
  const availableDonors = donors.filter(donor => isDonorAvailable(donor.lastDonationDate)).length;

  // Blood group distribution data
  const bloodGroupData = bloodGroups.map(group => ({
    group,
    count: donors.filter(donor => donor.bloodGroup === group).length,
    percentage: totalDonors > 0 ? ((donors.filter(donor => donor.bloodGroup === group).length / totalDonors) * 100).toFixed(1) : 0
  }));

  // City distribution data
  const cityData = [...new Set(donors.map(donor => donor.city))]
    .map(city => ({
      city,
      count: donors.filter(donor => donor.city === city).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // University distribution data
  const universityData = [...new Set(donors.map(donor => donor.university))]
    .map(university => ({
      university,
      count: donors.filter(donor => donor.university === university).length
    }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  const exportToCSV = () => {
    const headers = ['Name', 'Contact', 'City', 'University', 'Department', 'Semester', 'Blood Group', 'Last Donation Date', 'Available'];
    const csvData = donors.map(donor => [
      donor.name,
      donor.contact,
      donor.city,
      donor.university,
      donor.department,
      donor.semester,
      donor.bloodGroup,
      donor.lastDonationDate || 'Never',
      isDonorAvailable(donor.lastDonationDate) ? 'Yes' : 'No'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blood_donors.csv';
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                  <Calendar className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bloodGroupData.filter(g => g.count > 0).length}</div>
                  <p className="text-xs opacity-80">Types available</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Universities</CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{universityData.length}</div>
                  <p className="text-xs opacity-80">Participating</p>
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
                  <CardTitle>University Distribution</CardTitle>
                  <CardDescription>Number of donors by university</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={universityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="university" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Blood Group Details</CardTitle>
                  <CardDescription>Count and percentage breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bloodGroupData.filter(d => d.count > 0).map((group, index) => (
                      <div key={group.group} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{group.group}</span>
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
              isDonorAvailable={isDonorAvailable}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
