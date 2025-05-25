
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, X } from 'lucide-react';

interface MassEntryModeProps {
  universities: string[];
  onToggle: (enabled: boolean) => void;
  onPresetChange: (preset: any) => void;
  isEnabled: boolean;
  preset: any;
}

const MassEntryMode = ({ universities, onToggle, onPresetChange, isEnabled, preset }: MassEntryModeProps) => {
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

  const currentPreset = preset || {
    university: '',
    department: '',
    semester: '',
    city: 'Faisalabad',
    isHostelResident: false,
    semesterEndDate: ''
  };

  const handlePresetChange = (field: string, value: any) => {
    const newPreset = { ...currentPreset, [field]: value };
    onPresetChange(newPreset);
  };

  const handleToggle = (enabled: boolean) => {
    onToggle(enabled);
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <Users className="h-5 w-5" />
            Mass Entry Mode
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="mass-entry-toggle" className="text-sm font-medium">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Label>
            <Switch
              id="mass-entry-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>
        <p className="text-sm text-blue-600">
          Pre-fill common information for bulk donor registration
        </p>
      </CardHeader>
      
      {isEnabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preset-university" className="text-sm font-medium">University</Label>
              <Select 
                value={currentPreset.university} 
                onValueChange={(value) => handlePresetChange('university', value)}
              >
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
              <Label htmlFor="preset-department" className="text-sm font-medium">Department</Label>
              <Input
                id="preset-department"
                value={currentPreset.department}
                onChange={(e) => handlePresetChange('department', e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preset-semester" className="text-sm font-medium">Semester</Label>
              <Select 
                value={currentPreset.semester} 
                onValueChange={(value) => handlePresetChange('semester', value)}
              >
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
              <Label htmlFor="preset-city" className="text-sm font-medium">City</Label>
              <Input
                id="preset-city"
                value={currentPreset.city}
                onChange={(e) => handlePresetChange('city', e.target.value)}
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preset-semester-end" className="text-sm font-medium">Semester End Date</Label>
              <Input
                id="preset-semester-end"
                type="date"
                value={currentPreset.semesterEndDate}
                onChange={(e) => handlePresetChange('semesterEndDate', e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="preset-hostel"
                checked={currentPreset.isHostelResident}
                onCheckedChange={(checked) => handlePresetChange('isHostelResident', checked)}
              />
              <Label htmlFor="preset-hostel" className="text-sm font-medium">Lives in Hostel</Label>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default MassEntryMode;
