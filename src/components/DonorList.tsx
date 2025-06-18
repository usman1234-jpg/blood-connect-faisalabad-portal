import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Users, Edit, Phone, MapPin, Calendar, Search, Trash2, AlertCircle, Clock, School, Heart, Home, Lock } from 'lucide-react';
import { Donor, BloodGroup, bloodGroups, calculateNextDonationDate, hasDonorGraduated, universities } from '../types/donor';
import { useAuth } from '../contexts/AuthContext';

interface DonorListProps {
  donors: Donor[];
  onUpdateDonor: (donor: Donor) => void;
  onRemoveDonor?: (id: string) => void;
  isDonorAvailable: (lastDonationDate: string) => boolean;
}

const DonorList = ({ donors, onUpdateDonor, onRemoveDonor, isDonorAvailable }: DonorListProps) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [editFormData, setEditFormData] = useState<Donor | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [donorToDelete, setDonorToDelete] = useState<string | null>(null);

  // Sort donors: available first, then by last donation date
  const filteredDonors = donors.filter(donor =>
    donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.contact.includes(searchTerm) ||
    donor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donor.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    if (!isAdmin()) return;
    setEditFormData({ ...donor });
    setSelectedDonor(donor);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData || !isAdmin()) return;

    // Calculate next donation date if last donation date is provided
    const nextDonationDate = editFormData.lastDonationDate ? 
      calculateNextDonationDate(editFormData.lastDonationDate) : '';

    const updatedDonor = {
      ...editFormData,
      nextDonationDate
    };

    onUpdateDonor(updatedDonor);
    setIsEditDialogOpen(false);
    setEditFormData(null);
    setSelectedDonor(null);

    toast({
      title: 'Success',
      description: 'Donor information updated successfully!',
    });
  };

  const handleUpdateLastDonation = (donor: Donor) => {
    if (!isAdmin()) return;
    
    const today = new Date().toISOString().split('T')[0];
    const nextDonationDate = calculateNextDonationDate(today);
    
    const updatedDonor = { 
      ...donor, 
      lastDonationDate: today,
      nextDonationDate
    };
    
    onUpdateDonor(updatedDonor);

    toast({
      title: 'Success',
      description: 'Last donation date updated to today!',
    });
  };

  const confirmDeleteDonor = (id: string) => {
    if (!isAdmin()) return;
    setDonorToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDonor = () => {
    if (donorToDelete && onRemoveDonor && isAdmin()) {
      onRemoveDonor(donorToDelete);
      setIsDeleteDialogOpen(false);
      setDonorToDelete(null);

      toast({
        title: 'Success',
        description: 'Donor has been removed successfully.',
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Trigger form submission if inside a form
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  };

  const DonorCard = ({ donor }: { donor: Donor }) => {
    const available = isDonorAvailable(donor.lastDonationDate);
    const daysSinceLastDonation = donor.lastDonationDate 
      ? Math.floor((new Date().getTime() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24))
      : null;
    const hasGraduated = hasDonorGraduated(donor.semesterEndDate);

    return (
      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-lg">{donor.name}</h3>
                <Badge variant="outline" className={`${donor.gender === 'Male' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-pink-100 text-pink-800 border-pink-300'}`}>
                  {donor.gender}
                </Badge>
                {donor.isHostelResident && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                    <Home className="h-3 w-3 mr-1" />
                    Hostel
                  </Badge>
                )}
                {hasGraduated && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                    <School className="h-3 w-3 mr-1" />
                    Graduated
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{donor.university}</p>
              <p className="text-sm text-gray-500">{donor.department} - {donor.semester} Semester</p>
            </div>
            <div className="text-right">
              <Badge 
                variant={available ? 'default' : 'secondary'} 
                className={`${available ? 'bg-green-500' : 'bg-gray-500'} flex items-center gap-1`}
              >
                {available ? <Heart className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                {available ? 'Available' : 'Not Available'}
              </Badge>
              <div className="text-2xl font-bold text-red-600 mt-1">{donor.bloodGroup}</div>
            </div>
          </div>
          
          <div className="space-y-1 text-sm mb-4 border-t border-b py-2 my-2 border-gray-100">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{donor.contact}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{donor.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
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
            {donor.nextDonationDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-green-600">
                  Can donate again: {new Date(donor.nextDonationDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {isAdmin() ? (
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
              {onRemoveDonor && (
                <Button
                  onClick={() => confirmDeleteDonor(donor.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-2 text-gray-500">
              <Lock className="h-4 w-4 mr-2" />
              <span className="text-sm">View only access</span>
            </div>
          )}
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
            {isAdmin() ? 'Manage and view all registered blood donors' : 'View all registered blood donors'}
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
                onKeyDown={handleKeyDown}
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

      {/* Edit Donor Dialog - Only for Admins */}
      {isAdmin() && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Donor Information</DialogTitle>
              <DialogDescription>
                Update donor details and donation history
              </DialogDescription>
            </DialogHeader>
            
            {editFormData && (
              <form onSubmit={handleUpdateDonor} className="space-y-4" onKeyDown={handleKeyDown}>
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
                    <Select 
                      value={editFormData.university} 
                      onValueChange={(value) => setEditFormData(prev => prev ? { ...prev, university: value } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setEditFormData(prev => {
                          if (!prev) return null;
                          const nextDonationDate = newDate ? calculateNextDonationDate(newDate) : '';
                          return { 
                            ...prev, 
                            lastDonationDate: newDate,
                            nextDonationDate
                          };
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editSemesterEndDate">Semester End Date</Label>
                    <Input
                      id="editSemesterEndDate"
                      type="date"
                      value={editFormData.semesterEndDate || ''}
                      onChange={(e) => setEditFormData(prev => prev ? { 
                        ...prev, 
                        semesterEndDate: e.target.value
                      } : null)}
                    />
                  </div>

                  <div className="space-y-2 flex items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="editIsHostelResident" 
                        checked={editFormData.isHostelResident}
                        onCheckedChange={(checked) => setEditFormData(prev => prev ? { 
                          ...prev, 
                          isHostelResident: !!checked
                        } : null)}
                      />
                      <Label htmlFor="editIsHostelResident" className="cursor-pointer">Lives in Hostel</Label>
                    </div>
                  </div>

                  {editFormData.lastDonationDate && (
                    <div className="space-y-2">
                      <Label htmlFor="editNextDonationDate">Next Possible Donation Date</Label>
                      <Input
                        id="editNextDonationDate"
                        type="date"
                        value={editFormData.nextDonationDate || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Automatically calculated (3 months after last donation)</p>
                    </div>
                  )}
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
      )}

      {/* Delete Confirmation Dialog - Only for Admins */}
      {isAdmin() && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Remove Donor</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove this donor? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteDonor}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Donor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DonorList;
