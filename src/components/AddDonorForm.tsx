
import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { Donor, BloodGroup, bloodGroups, calculateNextDonationDate } from '../types/donor';
import { UserPlus, ChevronDown } from 'lucide-react';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddDonorFormProps {
  onAddDonor: (donor: Omit<Donor, 'id'>) => void;
  donors: Donor[]; // To get existing data for suggestions
}

const AddDonorForm = ({ onAddDonor, donors }: AddDonorFormProps) => {
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
    livesInHostel: false,
    gender: 'male' as 'male' | 'female' | 'other',
    semesterEndDate: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  const [openCityPopover, setOpenCityPopover] = useState(false);
  const [openDeptPopover, setOpenDeptPopover] = useState(false);
  const formRefs = {
    name: useRef<HTMLInputElement>(null),
    contact: useRef<HTMLInputElement>(null),
    city: useRef<HTMLButtonElement>(null),
    university: useRef<HTMLButtonElement>(null),
    department: useRef<HTMLButtonElement>(null),
    semester: useRef<HTMLButtonElement>(null),
    bloodGroup: useRef<HTMLButtonElement>(null),
    lastDonationDate: useRef<HTMLInputElement>(null),
    semesterEndDate: useRef<HTMLInputElement>(null),
    gender: useRef<HTMLDivElement>(null),
    livesInHostel: useRef<HTMLButtonElement>(null)
  };

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

  // Get unique cities and departments from existing donors
  const uniqueCities = [...new Set(donors.map(donor => donor.city))].filter(Boolean);
  const uniqueDepartments = [...new Set(donors.map(donor => donor.department))].filter(Boolean);

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

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLFormElement>, field: keyof typeof formRefs) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Find the next field to focus
      const fields = Object.keys(formRefs) as Array<keyof typeof formRefs>;
      const currentIndex = fields.indexOf(field);
      const nextField = fields[currentIndex + 1];
      
      if (nextField) {
        const element = formRefs[nextField].current;
        if (element) {
          element.focus();
          element.click?.(); // For select elements, open the dropdown
        }
      } else {
        // If it's the last field, submit the form
        const form = e.currentTarget.closest('form');
        if (form) form.requestSubmit();
      }
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                ref={formRefs.name}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'name')}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number *</Label>
              <Input
                id="contact"
                ref={formRefs.contact}
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'contact')}
                placeholder="03xxxxxxxxx"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Popover open={openCityPopover} onOpenChange={setOpenCityPopover}>
                <PopoverTrigger asChild>
                  <Button
                    ref={formRefs.city}
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCityPopover}
                    className="w-full justify-between"
                    onClick={() => setOpenCityPopover(true)}
                  >
                    {formData.city || "Select city..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search city..." />
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup>
                      {uniqueCities.length > 0 ? uniqueCities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(currentValue) => {
                            handleInputChange('city', currentValue);
                            setOpenCityPopover(false);
                            formRefs.university.current?.focus();
                          }}
                        >
                          {city}
                        </CommandItem>
                      )) : <CommandItem value="default-city">Add a city</CommandItem>}
                      <CommandItem
                        value="add-new"
                        onSelect={(value) => {
                          if (!uniqueCities.includes(value) && value.trim()) {
                            handleInputChange('city', value);
                          }
                          setOpenCityPopover(false);
                          formRefs.university.current?.focus();
                        }}
                      >
                        + Add new city
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="university">University</Label>
              <Select 
                value={formData.university} 
                onValueChange={(value) => handleInputChange('university', value)}
                onOpenChange={() => {
                  if (!formData.university && universities.length) {
                    formRefs.department.current?.focus();
                  }
                }}
              >
                <SelectTrigger ref={formRefs.university}>
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
              <Popover open={openDeptPopover} onOpenChange={setOpenDeptPopover}>
                <PopoverTrigger asChild>
                  <Button
                    ref={formRefs.department}
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDeptPopover}
                    className="w-full justify-between"
                  >
                    {formData.department || "Select department..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search department..." />
                    <CommandEmpty>No department found.</CommandEmpty>
                    <CommandGroup>
                      {uniqueDepartments.length > 0 ? uniqueDepartments.map((dept) => (
                        <CommandItem
                          key={dept}
                          value={dept}
                          onSelect={(currentValue) => {
                            handleInputChange('department', currentValue);
                            setOpenDeptPopover(false);
                            formRefs.semester.current?.focus();
                          }}
                        >
                          {dept}
                        </CommandItem>
                      )) : <CommandItem value="default-dept">Add a department</CommandItem>}
                      <CommandItem
                        value="add-new"
                        onSelect={(value) => {
                          if (!uniqueDepartments.includes(value) && value.trim()) {
                            handleInputChange('department', value);
                          }
                          setOpenDeptPopover(false);
                          formRefs.semester.current?.focus();
                        }}
                      >
                        + Add new department
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select 
                value={formData.semester} 
                onValueChange={(value) => handleInputChange('semester', value)}
              >
                <SelectTrigger ref={formRefs.semester}>
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
              <Label htmlFor="gender">Gender</Label>
              <RadioGroup
                ref={formRefs.gender}
                value={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value as 'male' | 'female' | 'other')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group *</Label>
              <Select 
                value={formData.bloodGroup} 
                onValueChange={(value) => handleInputChange('bloodGroup', value as BloodGroup)}
              >
                <SelectTrigger ref={formRefs.bloodGroup}>
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
                ref={formRefs.lastDonationDate}
                type="date"
                value={formData.lastDonationDate}
                onChange={(e) => handleInputChange('lastDonationDate', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'lastDonationDate')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="semesterEndDate">Semester End Date</Label>
              <Input
                id="semesterEndDate"
                ref={formRefs.semesterEndDate}
                type="date"
                value={formData.semesterEndDate || ''}
                onChange={(e) => handleInputChange('semesterEndDate', e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, 'semesterEndDate')}
                placeholder="When will the semester end?"
              />
            </div>

            <div className="space-y-2 flex items-center">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="livesInHostel" 
                  checked={formData.livesInHostel}
                  onCheckedChange={(checked) => handleInputChange('livesInHostel', !!checked)}
                />
                <Label htmlFor="livesInHostel" className="cursor-pointer">Lives in Hostel</Label>
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
