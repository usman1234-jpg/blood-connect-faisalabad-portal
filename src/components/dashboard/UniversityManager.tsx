
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, University } from 'lucide-react';

interface UniversityManagerProps {
  universities: string[];
  onAddUniversity: (university: string) => void;
}

const UniversityManager = ({ universities, onAddUniversity }: UniversityManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newUniversity, setNewUniversity] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUniversity.trim() && !universities.includes(newUniversity.trim())) {
      onAddUniversity(newUniversity.trim());
      setNewUniversity('');
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <University className="h-4 w-4" />
          Add University
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New University</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="university">University Name</Label>
            <Input
              id="university"
              value={newUniversity}
              onChange={(e) => setNewUniversity(e.target.value)}
              placeholder="Enter university name"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Add University
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UniversityManager;
