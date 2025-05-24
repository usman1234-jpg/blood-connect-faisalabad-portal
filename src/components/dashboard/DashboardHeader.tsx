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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Blood Connect Faisalabad
        </h1>
        <p className="text-gray-600">Donor Management Portal</p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <UniversityManager 
          universities={universities}
          onAddUniversity={onAddUniversity}
        />
        
        <Button 
          onClick={onExportCSV}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        
        <Button 
          onClick={handleLogout}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
