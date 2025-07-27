
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Donor, bloodGroups } from '../../types/donor';

interface DashboardChartsProps {
  donors: Donor[];
}

const DashboardCharts = ({ donors }: DashboardChartsProps) => {
  const totalDonors = donors.length;
  
  // Blood group distribution data
  const bloodGroupData = bloodGroups.map(group => ({
    group,
    count: donors.filter(donor => donor.bloodGroup === group).length,
    percentage: totalDonors > 0 ? ((donors.filter(donor => donor.bloodGroup === group).length / totalDonors) * 100).toFixed(1) : 0
  }));

  // Gender distribution data
  const maleDonors = donors.filter(donor => donor.gender === 'Male').length;
  const femaleDonors = donors.filter(donor => donor.gender === 'Female').length;
  const genderData = [
    { gender: 'Male', count: maleDonors, percentage: totalDonors > 0 ? ((maleDonors / totalDonors) * 100).toFixed(1) : 0 },
    { gender: 'Female', count: femaleDonors, percentage: totalDonors > 0 ? ((femaleDonors / totalDonors) * 100).toFixed(1) : 0 }
  ];

  // City distribution data
  const cityData = [...new Set(donors.map(donor => donor.city))]
    .filter(Boolean)
    .map(city => ({
      city,
      count: donors.filter(donor => donor.city === city).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // University distribution data with colors
  const universityColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', 
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f59e0b', '#10b981', '#6366f1'
  ];
  
  const universityData = [...new Set(donors.map(donor => donor.university))]
    .filter(Boolean)
    .map((university, index) => ({
      university,
      shortName: university.split(' ').map(word => word[0]).join('').substring(0, 3),
      count: donors.filter(donor => donor.university === university).length,
      color: universityColors[index % universityColors.length]
    }))
    .sort((a, b) => b.count - a.count);

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Blood Group Distribution</CardTitle>
          <CardDescription>Percentage of donors by blood group</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bloodGroupData.filter(d => d.count > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({group, percentage}) => `${group} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {bloodGroupData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>University Distribution</CardTitle>
          <CardDescription>Donors by university (hover for details)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={universityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="shortName" 
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value} donors`,
                  props.payload.university
                ]}
                labelFormatter={(label) => ''}
              />
              <Bar dataKey="count" fill="#3b82f6">
                {universityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>City Distribution</CardTitle>
          <CardDescription>Number of donors by city</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gender Distribution</CardTitle>
          <CardDescription>Male vs Female donors</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData.filter(d => d.count > 0)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({gender, percentage}) => `${gender} (${percentage}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#ec4899" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Blood Group Details</CardTitle>
          <CardDescription>Count and percentage breakdown with compatibility info</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bloodGroupData.filter(d => d.count > 0).map((group, index) => (
              <div key={group.group} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div>
                    <span className="font-bold text-lg">{group.group}</span>
                    {group.group === 'O-' && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Universal Donor</span>}
                    {group.group === 'AB+' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Universal Recipient</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{group.count} donors</span>
                  <Badge variant="secondary">{group.percentage}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
