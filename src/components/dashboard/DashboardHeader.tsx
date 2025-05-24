
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import UniversityManager from './UniversityManager';

interface DashboardHeaderProps {
  onExportCSV: () => void;
  universities: string[];
  onAddUniversity: (university: string) => void;
}

const DashboardHeader = ({ onExportCSV, universities, onAddUniversity }: DashboardHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blood Donor Portal</h1>
          <p className="text-gray-600">Riphah University Faisalabad</p>
        </div>
        <div className="flex gap-3">
          <UniversityManager universities={universities} onAddUniversity={onAddUniversity} />
          <Button onClick={onExportCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
