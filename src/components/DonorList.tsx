
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Donor } from '../types/donor';
import { useAuth } from '../contexts/AuthContext';

interface DonorListProps {
  donors: Donor[];
  onUpdateDonor: (donor: Donor) => void;
  onRemoveDonor: (id: string) => void;
  isDonorAvailable: (donor: Donor) => boolean;
}

const DonorList = ({ donors, onUpdateDonor, onRemoveDonor, isDonorAvailable }: DonorListProps) => {
  const { canEdit } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Donor>>({});
  const [sortBy, setSortBy] = useState<keyof Donor>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterUniversity, setFilterUniversity] = useState<string>('all');
  const [filterBloodType, setFilterBloodType] = useState<string>('all');
  const [filterAvailability, setFilterAvailability] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredDonors = useMemo(() => {
    let filtered = [...donors];

    if (filterUniversity !== 'all') {
      filtered = filtered.filter(donor => donor.university === filterUniversity);
    }

    if (filterBloodType !== 'all') {
      filtered = filtered.filter(donor => donor.bloodGroup === filterBloodType);
    }

    if (filterAvailability !== 'all') {
      const available = filterAvailability === 'available';
      filtered = filtered.filter(donor => isDonorAvailable(donor) === available);
    }

    return filtered;
  }, [donors, filterUniversity, filterBloodType, filterAvailability, isDonorAvailable]);

  const sortedDonors = useMemo(() => {
    const sorted = [...filteredDonors];
    sorted.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
    return sorted;
  }, [filteredDonors, sortBy, sortOrder]);

  const paginatedDonors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedDonors.slice(startIndex, endIndex);
  }, [sortedDonors, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedDonors.length / itemsPerPage);

  const handleSort = (column: keyof Donor) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    const donorToEdit = donors.find(donor => donor.id === id);
    setEditForm(donorToEdit ? { ...donorToEdit } : {});
  };

  const handleSave = () => {
    if (editingId && editForm) {
      onUpdateDonor({ ...donors.find(donor => donor.id === editingId)!, ...editForm, id: editingId });
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Donors ({filteredDonors.length} total)</CardTitle>
        <CardDescription>
          Complete list of registered blood donors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 mb-4 grid-cols-1 md:grid-cols-3">
          <div>
            <label htmlFor="filterUniversity" className="block text-sm font-medium text-gray-700">
              University:
            </label>
            <Select value={filterUniversity} onValueChange={value => setFilterUniversity(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {Array.from(new Set(donors.map(donor => donor.university))).map(university => (
                  <SelectItem key={university} value={university}>{university}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filterBloodType" className="block text-sm font-medium text-gray-700">
              Blood Type:
            </label>
            <Select value={filterBloodType} onValueChange={value => setFilterBloodType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Blood Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => (
                  <SelectItem key={bloodType} value={bloodType}>{bloodType}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filterAvailability" className="block text-sm font-medium text-gray-700">
              Availability:
            </label>
            <Select value={filterAvailability} onValueChange={value => setFilterAvailability(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                Name {sortBy === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead onClick={() => handleSort('bloodGroup')} className="cursor-pointer">
                Blood Type {sortBy === 'bloodGroup' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead onClick={() => handleSort('university')} className="cursor-pointer">
                University {sortBy === 'university' && (sortOrder === 'asc' ? '▲' : '▼')}
              </TableHead>
              <TableHead>Last Donated</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDonors.map(donor => (
              <TableRow key={donor.id}>
                <TableCell>
                  {editingId === donor.id ? (
                    <Input name="name" value={editForm.name || ''} onChange={handleChange} />
                  ) : (
                    donor.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === donor.id ? (
                    <Select value={editForm.bloodGroup || ''} onValueChange={(value) => setEditForm(prev => ({ ...prev, bloodGroup: value }))}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bloodType => (
                          <SelectItem key={bloodType} value={bloodType}>{bloodType}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    donor.bloodGroup
                  )}
                </TableCell>
                <TableCell>
                  {editingId === donor.id ? (
                    <Input name="university" value={editForm.university || ''} onChange={handleChange} />
                  ) : (
                    donor.university
                  )}
                </TableCell>
                <TableCell>
                  {editingId === donor.id ? (
                    <Input
                      type="date"
                      name="lastDonationDate"
                      value={editForm.lastDonationDate || ''}
                      onChange={handleChange}
                    />
                  ) : (
                    donor.lastDonationDate
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={isDonorAvailable(donor) ? 'outline' : 'secondary'}>
                    {isDonorAvailable(donor) ? 'Available' : 'Unavailable'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {editingId === donor.id ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {canEdit() && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleEdit(donor.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => onRemoveDonor(donor.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <span>Page {currentPage} of {totalPages}</span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorList;
