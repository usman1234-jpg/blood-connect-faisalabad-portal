
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, Heart, MapPin, GraduationCap } from 'lucide-react';
import { Donor } from '../../types/donor';

interface DashboardStatsProps {
  donors: Donor[];
  isDonorAvailable: (lastDonationDate: string) => boolean;
}

const DashboardStats = ({ donors, isDonorAvailable }: DashboardStatsProps) => {
  const totalDonors = donors.length;
  const availableDonors = donors.filter(donor => isDonorAvailable(donor.lastDonationDate)).length;
  const hostelResidents = donors.filter(donor => donor.isHostelResident).length;
  const bloodGroupCount = [...new Set(donors.map(donor => donor.bloodGroup))].length;
  const universityCount = [...new Set(donors.map(donor => donor.university))].filter(Boolean).length;

  return (
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
          <div className="text-2xl font-bold">{bloodGroupCount}</div>
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
          <div className="text-2xl font-bold">{universityCount}</div>
          <p className="text-xs opacity-80">Registered</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
