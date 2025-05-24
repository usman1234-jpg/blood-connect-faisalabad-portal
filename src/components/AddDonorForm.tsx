import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Donor, BloodGroup, bloodGroups, calculateNextDonationDate, universities } from '../types/donor';
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
    gender: 'Male' as 'Male' | 'Female',
    bloodGroup: '' as BloodGroup,
    lastDonationDate: '',
    nextDonationDate: '',
    isHostelResident: false,
    semesterEndDate: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);

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

    // Reset form to initial state
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

  return (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <UserPlus className="h-6 w-6" />
          Add New Donor
        </CardTitle>
        <CardDescription className="text-red-100">
          Register a new blood donor in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                className="border-2 focus:border-red-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact" className="text-sm font-semibold">Contact Number *</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="03xxxxxxxxx"
                className="border-2 focus:border-red-400"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-semibold">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter city"
                className="border-2 focus:border-red-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="university" className="text-sm font-semibold">University</Label>
              <Select value={formData.university} onValueChange={(value) => handleInputChange('university', value)}>
                <SelectTrigger className="border-2 focus:border-red-400">
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
              <Label htmlFor="department" className="text-sm font-semibold">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="e.g., Computer Science"
                className="border-2 focus:border-red-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester" className="text-sm font-semibold">Semester</Label>
              <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                <SelectTrigger className="border-2 focus:border-red-400">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold">Gender *</Label>
              <RadioGroup 
                value={formData.gender} 
                onValueChange={(value) => handleInputChange('gender', value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Male" id="male" />
                  <Label htmlFor="male" className="cursor-pointer">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Female" id="female" />
                  <Label htmlFor="female" className="cursor-pointer">Female</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="text-sm font-semibold">Blood Group *</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value as BloodGroup)}>
                <SelectTrigger className="border-2 focus:border-red-400">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      <span className="font-semibold text-red-600">{group}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastDonationDate" className="text-sm font-semibold">Last Donation Date</Label>
              <Input
                id="lastDonationDate"
                type="date"
                value={formData.lastDonationDate}
                onChange={(e) => handleInputChange('lastDonationDate', e.target.value)}
                className="border-2 focus:border-red-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semesterEndDate" className="text-sm font-semibold">Semester End Date</Label>
              <Input
                id="semesterEndDate"
                type="date"
                value={formData.semesterEndDate || ''}
                onChange={(e) => handleInputChange('semesterEndDate', e.target.value)}
                placeholder="When will the semester end?"
                className="border-2 focus:border-red-400"
              />
            </div>

            <div className="space-y-3 flex items-center">
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="isHostelResident" 
                  checked={formData.isHostelResident}
                  onCheckedChange={(checked) => handleInputChange('isHostelResident', !!checked)}
                />
                <Label htmlFor="isHostelResident" className="cursor-pointer font-semibold">Lives in Hostel</Label>
              </div>
            </div>

            {formData.lastDonationDate && (
              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="nextDonationDate" className="text-sm font-semibold">Next Possible Donation Date</Label>
                <Input
                  id="nextDonationDate"
                  type="date"
                  value={formData.nextDonationDate}
                  disabled
                  className="bg-gray-50 border-2"
                />
                <p className="text-xs text-gray-500">Automatically calculated (3 months after last donation)</p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-lg py-3 rounded-lg font-semibold shadow-lg">
            <UserPlus className="h-5 w-5 mr-2" />
            Add Donor
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddDonorForm;
