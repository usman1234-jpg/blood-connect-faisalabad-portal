
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Donor, BloodGroup, bloodGroups, calculateNextDonationDate } from '../types/donor';
import { UserPlus } from 'lucide-react';

interface AddDonorFormProps {
  onAddDonor: (donor: Omit<Donor, 'id'>) => void;
}

const AddDonorForm = ({ onAddDonor }: AddDonorFormProps) => {
  const { toast } = useToast();
  const initialFormState = {
    name: '',
    contact: '',
    city: '',
    university: '',
    department: '',
    semester: '',
    bloodGroup: '' as BloodGroup,
    lastDonationDate: '',
    nextDonationDate: '',
    isHospitalized: false,
    semesterEndDate: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

  const universities = [
    'Riphah University Faisalabad',
    'University of Agriculture Faisalabad',
    'Government College University Faisalabad',
    'National Textile University',
    'University of Faisalabad',
    'Lahore College for Women University',
    'Other'
  ];

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contact || !formData.bloodGroup) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    // Calculate next donation date if last donation date is provided
    const nextDonationDate = formData.lastDonationDate ? 
      calculateNextDonationDate(formData.lastDonationDate) : '';

    onAddDonor({
      ...formData,
      nextDonationDate
    });
    
    toast({
      title: 'Success',
      description: 'Donor added successfully!',
      variant: 'default'
    });

    // Reset form
    setFormData(initialFormState);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // If updating last donation date, also calculate next donation date
      if (field === 'lastDonationDate' && typeof value === 'string') {
        newData.nextDonationDate = value ? calculateNextDonationDate(value) : '';
      }
      
      return newData;
    });
  };

  // Handle Enter key press for submission
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form');
      if (form) form.requestSubmit();
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add New Donor
        </CardTitle>
        <CardDescription>
          Register a new blood donor in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6" onKeyDown={handleKeyDown}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="03xxxxxxxxx"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select value={formData.university} onValueChange={(value) => handleInputChange('university', value)}>
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
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group *</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value as BloodGroup)}>
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
              <Label htmlFor="lastDonationDate">Last Donation Date</Label>
              <Input
                id="lastDonationDate"
                type="date"
                value={formData.lastDonationDate}
                onChange={(e) => handleInputChange('lastDonationDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semesterEndDate">Semester End Date</Label>
              <Input
                id="semesterEndDate"
                type="date"
                value={formData.semesterEndDate || ''}
                onChange={(e) => handleInputChange('semesterEndDate', e.target.value)}
                placeholder="When will the semester end?"
              />
            </div>

            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isHospitalized" 
                  checked={formData.isHospitalized}
                  onCheckedChange={(checked) => handleInputChange('isHospitalized', !!checked)}
                />
                <Label htmlFor="isHospitalized" className="cursor-pointer">Currently Hospitalized</Label>
              </div>
            </div>

            {formData.lastDonationDate && (
              <div className="space-y-2">
                <Label htmlFor="nextDonationDate">Next Possible Donation Date</Label>
                <Input
                  id="nextDonationDate"
                  type="date"
                  value={formData.nextDonationDate}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Automatically calculated (3 months after last donation)</p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Donor
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddDonorForm;
