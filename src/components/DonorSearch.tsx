
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Phone, Users, MapPin } from 'lucide-react';
import { Donor, BloodGroup, bloodGroups, bloodCompatibility, canDonateTo } from '../types/donor';

interface DonorSearchProps {
  donors: Donor[];
  onSearchResults: (results: Donor[]) => void;
  isDonorAvailable: (lastDonationDate: string) => boolean;
}

interface SearchFilters {
  bloodGroup: BloodGroup | '';
  city: string;
  university: string;
  phone: string;
  availability: 'all' | 'available' | 'unavailable';
}

const DonorSearch = ({ donors, onSearchResults, isDonorAvailable }: DonorSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    bloodGroup: '',
    city: '',
    university: '',
    phone: '',
    availability: 'all'
  });

  const [searchResults, setSearchResults] = useState<Donor[]>([]);
  const [alternativeResults, setAlternativeResults] = useState<Donor[]>([]);

  const cities = [...new Set(donors.map(donor => donor.city))].filter(Boolean).sort();
  const universities = [...new Set(donors.map(donor => donor.university))].filter(Boolean).sort();

  const handleSearch = () => {
    let filteredDonors = [...donors];

    // Apply filters
    if (filters.bloodGroup) {
      filteredDonors = filteredDonors.filter(donor => donor.bloodGroup === filters.bloodGroup);
    }

    if (filters.city) {
      filteredDonors = filteredDonors.filter(donor => 
        donor.city.toLowerCase().includes(filters.city.toLowerCase())
      );
    }

    if (filters.university) {
      filteredDonors = filteredDonors.filter(donor => 
        donor.university.toLowerCase().includes(filters.university.toLowerCase())
      );
    }

    if (filters.phone) {
      filteredDonors = filteredDonors.filter(donor => 
        donor.contact.includes(filters.phone)
      );
    }

    if (filters.availability === 'available') {
      filteredDonors = filteredDonors.filter(donor => isDonorAvailable(donor.lastDonationDate));
    } else if (filters.availability === 'unavailable') {
      filteredDonors = filteredDonors.filter(donor => !isDonorAvailable(donor.lastDonationDate));
    }

    // Sort by availability and last donation date
    filteredDonors.sort((a, b) => {
      const aAvailable = isDonorAvailable(a.lastDonationDate);
      const bAvailable = isDonorAvailable(b.lastDonationDate);
      
      if (aAvailable && !bAvailable) return -1;
      if (!aAvailable && bAvailable) return 1;
      
      // If both have same availability, sort by last donation date
      const aDate = a.lastDonationDate ? new Date(a.lastDonationDate).getTime() : 0;
      const bDate = b.lastDonationDate ? new Date(b.lastDonationDate).getTime() : 0;
      return aDate - bDate;
    });

    setSearchResults(filteredDonors);

    // Find alternative blood group donors if searching by blood group
    if (filters.bloodGroup) {
      const compatibleGroups = bloodCompatibility[filters.bloodGroup];
      const alternativeDonors = donors.filter(donor => 
        compatibleGroups.includes(donor.bloodGroup) && donor.bloodGroup !== filters.bloodGroup
      );

      // Apply same sorting logic
      alternativeDonors.sort((a, b) => {
        const aAvailable = isDonorAvailable(a.lastDonationDate);
        const bAvailable = isDonorAvailable(b.lastDonationDate);
        
        if (aAvailable && !bAvailable) return -1;
        if (!aAvailable && bAvailable) return 1;
        
        const aDate = a.lastDonationDate ? new Date(a.lastDonationDate).getTime() : 0;
        const bDate = b.lastDonationDate ? new Date(b.lastDonationDate).getTime() : 0;
        return aDate - bDate;
      });

      setAlternativeResults(alternativeDonors);
    } else {
      setAlternativeResults([]);
    }

    onSearchResults(filteredDonors);
  };

  const clearFilters = () => {
    setFilters({
      bloodGroup: '',
      city: '',
      university: '',
      phone: '',
      availability: 'all'
    });
    setSearchResults([]);
    setAlternativeResults([]);
    onSearchResults([]);
  };

  const DonorCard = ({ donor, isAlternative = false }: { donor: Donor; isAlternative?: boolean }) => {
    const available = isDonorAvailable(donor.lastDonationDate);
    const daysSinceLastDonation = donor.lastDonationDate 
      ? Math.floor((new Date().getTime() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <Card className={`transition-all hover:shadow-md ${isAlternative ? 'border-orange-200 bg-orange-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-lg">{donor.name}</h3>
              <p className="text-sm text-gray-600">{donor.university}</p>
              <p className="text-sm text-gray-500">{donor.department} - {donor.semester} Semester</p>
            </div>
            <div className="text-right">
              <Badge variant={available ? 'default' : 'secondary'} className={available ? 'bg-green-500' : 'bg-gray-500'}>
                {available ? 'Available' : 'Not Available'}
              </Badge>
              <div className="text-lg font-bold text-red-600 mt-1">{donor.bloodGroup}</div>
            </div>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {donor.contact}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {donor.city}
            </div>
            {donor.lastDonationDate && (
              <div className="text-gray-600">
                Last donation: {new Date(donor.lastDonationDate).toLocaleDateString()}
                {daysSinceLastDonation && (
                  <span className="ml-2">({daysSinceLastDonation} days ago)</span>
                )}
              </div>
            )}
            {!donor.lastDonationDate && (
              <div className="text-gray-600">No previous donations recorded</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Donors
          </CardTitle>
          <CardDescription>
            Find donors by blood group, location, university, or contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={filters.bloodGroup} onValueChange={(value) => setFilters(prev => ({ ...prev, bloodGroup: value as BloodGroup }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select value={filters.university} onValueChange={(value) => setFilters(prev => ({ ...prev, university: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent>
                  {universities.map((uni) => (
                    <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={filters.phone}
                onChange={(e) => setFilters(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Search by phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <Select value={filters.availability} onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value as 'all' | 'available' | 'unavailable' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All donors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Donors</SelectItem>
                  <SelectItem value="available">Available Only</SelectItem>
                  <SelectItem value="unavailable">Unavailable Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
        <Tabs defaultValue="direct" className="w-full">
          <TabsList>
            <TabsTrigger value="direct" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Direct Matches ({searchResults.length})
            </TabsTrigger>
            {alternativeResults.length > 0 && (
              <TabsTrigger value="alternatives" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Compatible Donors ({alternativeResults.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="direct" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((donor) => (
                <DonorCard key={donor.id} donor={donor} />
              ))}
            </div>
          </TabsContent>

          {alternativeResults.length > 0 && (
            <TabsContent value="alternatives" className="mt-4">
              <div className="mb-4 p-4 bg-orange-100 rounded-lg">
                <h3 className="font-semibold text-orange-800 mb-2">Compatible Blood Groups</h3>
                <p className="text-sm text-orange-700">
                  These donors have blood types compatible with {filters.bloodGroup} recipients.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {alternativeResults.map((donor) => (
                  <DonorCard key={donor.id} donor={donor} isAlternative />
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}

      {searchResults.length === 0 && (filters.bloodGroup || filters.city || filters.university || filters.phone) && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No donors found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or clearing some filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DonorSearch;
