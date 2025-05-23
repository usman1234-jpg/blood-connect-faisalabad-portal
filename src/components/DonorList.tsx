
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Edit, Phone, MapPin, Calendar, Search } from 'lucide-react';
import { Donor, BloodGroup, bloodGroups } from '../types/donor';

interface DonorListProps {
  donors: Donor[];
  onUpdateDonor: (donor: Donor) => void;
  isDonorAvailable: (lastDonationDate: string) => boolean;
}

const DonorList = ({ donors, onUpdateDonor, isDonorAvailable }: DonorListProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [editFormData, setEditFormData] = useState<Donor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredDonors = donors.filter(donor =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.contact.includes(searchTerm) ||
    donor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort donors: available first, then by last donation date
  const sortedDonors = [...filteredDonors].sort((a, b) => {
    const aAvailable = isDonorAvailable(a.lastDonationDate);
    const bAvailable = isDonorAvailable(b.lastDonationDate);
    
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;
    
    const aDate = a.lastDonationDate ? new Date(a.lastDonationDate).getTime() : 0;
    const bDate = b.lastDonationDate ? new Date(b.lastDonationDate).getTime() : 0;
    return aDate - bDate;
  });

  const handleEditDonor = (donor: Donor) => {
    setEditFormData({ ...donor });
    setSelectedDonor(donor);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    onUpdateDonor(editFormData);
    setIsEditDialogOpen(false);
    setEditFormData(null);
    setSelectedDonor(null);

    toast({
      title: 'Success',
      description: 'Donor information updated successfully!',
    });
  };

  const handleUpdateLastDonation = (donor: Donor) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedDonor = { ...donor, lastDonationDate: today };
    onUpdateDonor(updatedDonor);

    toast({
      title: 'Success',
      description: 'Last donation date updated to today!',
    });
  };

  const DonorCard = ({ donor }: { donor: Donor }) => {
    const available = isDonorAvailable(donor.lastDonationDate);
    const daysSinceLastDonation = donor.lastDonationDate 
      ? Math.floor((new Date().getTime() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
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
          
          <div className="space-y-1 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              {donor.contact}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {donor.city}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {donor.lastDonationDate ? (
                <span>
                  Last donation: {new Date(donor.lastDonationDate).toLocaleDateString()}
                  {daysSinceLastDonation && (
                    <span className="ml-2 text-gray-500">({daysSinceLastDonation} days ago)</span>
                  )}
                </span>
              ) : (
                <span className="text-gray-500">No previous donations recorded</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => handleEditDonor(donor)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              onClick={() => handleUpdateLastDonation(donor)}
              variant="outline"
              size="sm"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              Mark Donated Today
            </Button>
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
            <Users className="h-5 w-5" />
            All Donors ({donors.length})
          </CardTitle>
          <CardDescription>
            Manage and view all registered blood donors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, city, university, or blood group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDonors.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))}
          </div>

          {sortedDonors.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No donors found' : 'No donors registered'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search term.' : 'Add your first donor to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Donor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Donor Information</DialogTitle>
            <DialogDescription>
              Update donor details and donation history
            </DialogDescription>
          </DialogHeader>
          
          {editFormData && (
            <form onSubmit={handleUpdateDonor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editName">Full Name</Label>
                  <Input
                    id="editName"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, name: e.target.value } : null)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editContact">Contact Number</Label>
                  <Input
                    id="editContact"
                    value={editFormData.contact}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, contact: e.target.value } : null)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editCity">City</Label>
                  <Input
                    id="editCity"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, city: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editUniversity">University</Label>
                  <Input
                    id="editUniversity"
                    value={editFormData.university}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, university: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDepartment">Department</Label>
                  <Input
                    id="editDepartment"
                    value={editFormData.department}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, department: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editSemester">Semester</Label>
                  <Input
                    id="editSemester"
                    value={editFormData.semester}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, semester: e.target.value } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editBloodGroup">Blood Group</Label>
                  <Select 
                    value={editFormData.bloodGroup} 
                    onValueChange={(value) => setEditFormData(prev => prev ? { ...prev, bloodGroup: value as BloodGroup } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editLastDonationDate">Last Donation Date</Label>
                  <Input
                    id="editLastDonationDate"
                    type="date"
                    value={editFormData.lastDonationDate}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, lastDonationDate: e.target.value } : null)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Donor
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonorList;
