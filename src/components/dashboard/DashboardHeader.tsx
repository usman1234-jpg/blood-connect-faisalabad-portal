import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import UniversityManager from './UniversityManager';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';

interface DashboardHeaderProps {
  onExportCSV: () => void;
  universities: string[];
  onAddUniversity: (university: string) => void;
}

const DashboardHeader = ({ onExportCSV, universities, onAddUniversity }: DashboardHeaderProps) => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col gap-4 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
            Blood Connect Faisalabad
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Donor Management Portal</p>
        </div>
        
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <UniversityManager 
            universities={universities}
            onAddUniversity={onAddUniversity}
          />
          
          <Button 
            onClick={onExportCSV}
            className="bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2 sm:py-2.5"
            size="sm"
          >
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Export CSV
          </Button>
          
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 text-sm sm:text-base py-2 sm:py-2.5"
            size="sm"
          >
            <LogOut className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
