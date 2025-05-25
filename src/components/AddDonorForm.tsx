import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Donor, BloodGroup, bloodGroups, calculateNextDonationDate } from '../types/donor';
import { UserPlus, Lock } from 'lucide-react';
import MassEntryMode from './MassEntryMode';
import { useAuth } from '../contexts/AuthContext';

interface AddDonorFormProps {
  onAddDonor: (donor: Omit<Donor, 'id'>) => void;
  universities: string[];
  massEntryState: { enabled: boolean; preset: any };
  onMassEntryStateChange: (enabled: boolean, preset: any) => void;
}

const AddDonorForm = ({ onAddDonor, universities, massEntryState, onMassEntryStateChange }: AddDonorFormProps) => {
  const { toast } = useToast();
  const { isAdmin } = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  
  // If user is not admin, show access denied message
  if (!isAdmin()) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <Lock className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Access Restricted</h3>
            <p className="text-gray-500">Only administrators can add new donors to the system.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
  
  const [formData, setFormData] = useState(() => ({
    ...initialFormState,
    ...(massEntryState.enabled ? massEntryState.preset : {})
  }));

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

  // Apply mass entry preset when it changes or when component mounts
  useEffect(() => {
    if (massEntryState.enabled && massEntryState.preset) {
      setFormData(prev => ({
        ...prev,
        ...massEntryState.preset
      }));
    }
  }, [massEntryState]);

  const handleMassEntryToggle = (enabled: boolean) => {
    onMassEntryStateChange(enabled, enabled ? massEntryState.preset : {});
  };

  const handleMassEntryPresetChange = (preset: any) => {
    onMassEntryStateChange(massEntryState.enabled, preset);
  };

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

    const nextDonationDate = formData.lastDonationDate ? 
      calculateNextDonationDate(formData.lastDonationDate) : '';

    onAddDonor({
      ...formData,
      nextDonationDate,
      dateAdded: new Date().toISOString().split('T')[0] // Add current date
    });
    
    toast({
      title: 'Success',
      description: 'Donor added successfully!',
      variant: 'default'
    });

    // Reset form but keep mass entry preset data
    if (massEntryState.enabled) {
      setFormData({
        ...initialFormState,
        ...massEntryState.preset
      });
    } else {
      setFormData(initialFormState);
    }

    // Focus on the first input for quick entry
    const firstInput = formRef.current?.querySelector('input[name="name"]') as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      if (field === 'lastDonationDate' && typeof value === 'string') {
        newData.nextDonationDate = value ? calculateNextDonationDate(value) : '';
      }
      
      return newData;
    });
  };

  const getFocusableElements = () => {
    if (!formRef.current) return [];
    const selector = 'input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), [role="radio"], [role="checkbox"]';
    return Array.from(formRef.current.querySelectorAll(selector)) as HTMLElement[];
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Shift + Enter to submit form
    if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault();
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
      return;
    }

    // Ctrl + Q for backward navigation
    if (e.ctrlKey && e.key === 'q' && e.target instanceof HTMLElement) {
      const focusableElements = getFocusableElements();
      const currentIndex = focusableElements.indexOf(e.target);
      
      if (currentIndex > 0) {
        e.preventDefault();
        focusableElements[currentIndex - 1].focus();
      }
      return;
    }

    // Enter key navigation
    if (e.key === 'Enter' && e.target instanceof HTMLElement) {
      // Don't prevent default for calendar inputs to allow date picker functionality
      if (e.target instanceof HTMLInputElement && e.target.type === 'date') {
        return;
      }

      e.preventDefault();
      const focusableElements = getFocusableElements();
      const currentIndex = focusableElements.indexOf(e.target);
      
      if (currentIndex < focusableElements.length - 1) {
        focusableElements[currentIndex + 1].focus();
      } else {
        // If we're at the last element, submit the form
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }
    }

    // Space key for checkboxes and radio buttons
    if (e.key === ' ' && (e.target as HTMLElement).getAttribute('role') === 'checkbox') {
      e.preventDefault();
      const checkbox = e.target as HTMLElement;
      checkbox.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <MassEntryMode
        universities={universities}
        onToggle={handleMassEntryToggle}
        onPresetChange={handleMassEntryPresetChange}
        isEnabled={massEntryState.enabled}
        preset={massEntryState.preset}
      />
      
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
            Add New Donor
          </CardTitle>
          <CardDescription className="text-red-100 text-sm sm:text-base">
            Register a new blood donor in the system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 sm:space-y-8" onKeyDown={handleKeyDown}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className="border-2 focus:border-red-400 h-10 sm:h-11"
                  required
                  autoFocus
                  tabIndex={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact" className="text-sm font-semibold">Contact Number *</Label>
                <Input
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={(e) => handleInputChange('contact', e.target.value)}
                  placeholder="03xxxxxxxxx"
                  className="border-2 focus:border-red-400 h-10 sm:h-11"
                  required
                  tabIndex={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup" className="text-sm font-semibold">Blood Group *</Label>
                <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value as BloodGroup)}>
                  <SelectTrigger className="border-2 focus:border-red-400 h-10 sm:h-11" tabIndex={3}>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {bloodGroups.map((group) => (
                      <SelectItem key={group} value={group}>
                        <span className="font-semibold text-red-600">{group}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city"
                  className="border-2 focus:border-red-400 h-10 sm:h-11"
                  tabIndex={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-semibold">University</Label>
                <Select value={formData.university} onValueChange={(value) => handleInputChange('university', value)}>
                  <SelectTrigger className="border-2 focus:border-red-400 h-10 sm:h-11" tabIndex={5}>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
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
                  name="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="e.g., Computer Science"
                  className="border-2 focus:border-red-400 h-10 sm:h-11"
                  tabIndex={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semester" className="text-sm font-semibold">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                  <SelectTrigger className="border-2 focus:border-red-400 h-10 sm:h-11" tabIndex={7}>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 sm:col-span-2 lg:col-span-1">
                <Label className="text-sm font-semibold">Gender *</Label>
                <RadioGroup 
                  value={formData.gender} 
                  onValueChange={(value) => handleInputChange('gender', value)}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" tabIndex={8} />
                    <Label htmlFor="male" className="cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" tabIndex={9} />
                    <Label htmlFor="female" className="cursor-pointer">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastDonationDate" className="text-sm font-semibold">Last Donation Date</Label>
                <Input
                  id="lastDonationDate"
                  name="lastDonationDate"
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={(e) => handleInputChange('lastDonationDate', e.target.value)}
                  className="border-2 focus:border-red-400 h-10 sm:h-11"
                  tabIndex={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="semesterEndDate" className="text-sm font-semibold">Semester End Date</Label>
                <Input
                  id="semesterEndDate"
                  name="semesterEndDate"
                  type="date"
                  value={formData.semesterEndDate || ''}
                  onChange={(e) => handleInputChange('semesterEndDate', e.target.value)}
                  className="border-2 focus:border-red-400 h-10 sm:h-11"
                  tabIndex={11}
                />
              </div>

              <div className="space-y-3 flex items-center sm:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id="isHostelResident" 
                    checked={formData.isHostelResident}
                    onCheckedChange={(checked) => handleInputChange('isHostelResident', !!checked)}
                    tabIndex={12}
                    role="checkbox"
                    aria-checked={formData.isHostelResident}
                  />
                  <Label htmlFor="isHostelResident" className="cursor-pointer font-semibold text-sm">Lives in Hostel</Label>
                </div>
              </div>

              {formData.lastDonationDate && (
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="nextDonationDate" className="text-sm font-semibold">Next Possible Donation Date</Label>
                  <Input
                    id="nextDonationDate"
                    type="date"
                    value={formData.nextDonationDate}
                    disabled
                    className="bg-gray-50 border-2 h-10 sm:h-11"
                  />
                  <p className="text-xs text-gray-500">Automatically calculated (3 months after last donation)</p>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-600 hover:bg-red-700 text-base sm:text-lg py-3 sm:py-4 rounded-lg font-semibold shadow-lg"
              tabIndex={13}
            >
              <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Donor
            </Button>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Navigation: Tab (next) • Ctrl+Q (previous) • Enter (next/submit) • Shift+Enter (submit) • Space (select)</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddDonorForm;
