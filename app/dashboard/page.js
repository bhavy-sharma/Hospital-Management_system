'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Pill, 
  UserCircle, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    medicines: 0,
    staff: 0,
    totalMembers: 0,
    expenses: 0,
    appointments: 0
  });
  const [roleData, setRoleData] = useState([]);
  const [medicineData, setMedicineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const router = useRouter();

  // Colors for charts
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  // Fetch data from API
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch members
      const membersRes = await fetch('/api/members');
      const membersData = await membersRes.json();
      
      // Fetch medicines
      const medicinesRes = await fetch('/api/medicines');
      const medicinesData = await medicinesRes.json();
      
      // Fetch expenses
      const expensesRes = await fetch('/api/expenses');
      const expensesData = await expensesRes.json();

      if (membersData.success) {
        const members = membersData.data || [];
        const doctors = members.filter(m => m.role === 'Doctor');
        const patients = members.filter(m => m.role === 'Patient');
        const staff = members.filter(m => m.role === 'Staff');

        // Role distribution data for pie chart
        const roleDistribution = [
          { name: 'Doctors', value: doctors.length },
          { name: 'Patients', value: patients.length },
          { name: 'Staff', value: staff.length }
        ].filter(item => item.value > 0);

        setRoleData(roleDistribution);
        
        setStats(prev => ({
          ...prev,
          doctors: doctors.length,
          patients: patients.length,
          staff: staff.length,
          totalMembers: members.length
        }));
      }

      if (medicinesData.success) {
        const medicines = medicinesData.data || [];
        const totalStock = medicines.reduce((sum, med) => sum + (parseInt(med.quantity) || 0), 0);
        
        // Medicine stock data for bar chart
        const medicineStock = medicines.slice(0, 8).map(med => ({
          name: med.name.length > 10 ? med.name.substring(0, 10) + '...' : med.name,
          stock: parseInt(med.quantity) || 0,
          mg: med.mg || '0'
        }));

        setMedicineData(medicineStock);
        setStats(prev => ({
          ...prev,
          medicines: totalStock
        }));
      }

      if (expensesData.success) {
        const expenses = expensesData.data || [];
        const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
        setStats(prev => ({
          ...prev,
          expenses: totalExpenses
        }));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  // Sample data for trends (generated dynamically)
  const generateTrendData = () => {
    const data = [];
    const days = selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 12;
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        patients: Math.floor(Math.random() * 30) + 10,
        appointments: Math.floor(Math.random() * 20) + 5,
        revenue: Math.floor(Math.random() * 50000) + 10000
      });
    }
    return data;
  };

  const trendData = generateTrendData();

  // Stats cards data
  const cards = [
    { 
      title: 'Total Doctors', 
      value: stats.doctors, 
      icon: UserCircle, 
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Total Patients', 
      value: stats.patients, 
      icon: Users, 
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      title: 'Total Staff', 
      value: stats.staff, 
      icon: Users, 
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    { 
      title: 'Medicine Stock', 
      value: stats.medicines, 
      icon: Pill, 
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      title: 'Total Members', 
      value: stats.totalMembers, 
      icon: Users, 
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    { 
      title: 'Total Expenses', 
      value: `₹${stats.expenses.toLocaleString()}`, 
      icon: DollarSign, 
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedPeriod === 'week' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Week
          </button>
          <button 
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedPeriod === 'month' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Month
          </button>
          <button 
            onClick={() => setSelectedPeriod('year')}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedPeriod === 'year' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div 
              key={index} 
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border-l-4"
              style={{ borderLeftColor: card.color.replace('bg-', '').replace('-500', '') === 'blue' ? '#3B82F6' : 
                card.color.replace('bg-', '').replace('-500', '') === 'green' ? '#10B981' :
                card.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#F59E0B' :
                card.color.replace('bg-', '').replace('-500', '') === 'purple' ? '#8B5CF6' :
                card.color.replace('bg-', '').replace('-500', '') === 'indigo' ? '#6366F1' :
                '#EF4444' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="text-gray-400 ml-1">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Medicine Stock */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
              Medicine Stock Overview
            </h3>
            <span className="text-xs text-gray-500">Top 8 Medicines</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={medicineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} units`, 'Stock']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Bar dataKey="stock" fill="#3B82F6">
                  {medicineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Role Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <PieChartIcon className="w-5 h-5 mr-2 text-green-600" />
              Member Distribution
            </h3>
            <span className="text-xs text-gray-500">By Role</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value} members`, name]}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart - Patient Trends */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <LineChartIcon className="w-5 h-5 mr-2 text-purple-600" />
              Patient & Appointment Trends
            </h3>
            <span className="text-xs text-gray-500">Last {selectedPeriod}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="patients" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="appointments" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart - Revenue Trend */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-orange-600" />
              Revenue Trend
            </h3>
            <span className="text-xs text-gray-500">Last {selectedPeriod}</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#F59E0B" 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow-md text-white">
          <p className="text-sm opacity-90">Total Revenue</p>
          <p className="text-2xl font-bold">₹{trendData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}</p>
          <p className="text-xs opacity-80 mt-1">Last {selectedPeriod}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg shadow-md text-white">
          <p className="text-sm opacity-90">Total Patients</p>
          <p className="text-2xl font-bold">{stats.patients}</p>
          <p className="text-xs opacity-80 mt-1">Active patients</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg shadow-md text-white">
          <p className="text-sm opacity-90">Total Appointments</p>
          <p className="text-2xl font-bold">{trendData.reduce((sum, d) => sum + d.appointments, 0)}</p>
          <p className="text-xs opacity-80 mt-1">Last {selectedPeriod}</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg shadow-md text-white">
          <p className="text-sm opacity-90">Average Daily Patients</p>
          <p className="text-2xl font-bold">
            {Math.round(trendData.reduce((sum, d) => sum + d.patients, 0) / trendData.length)}
          </p>
          <p className="text-xs opacity-80 mt-1">Per day average</p>
        </div>
      </div>

      {/* Members List Preview */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-700">Recent Activity</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">New patient admitted</span>
            </div>
            <span className="text-xs text-gray-500">2 min ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Medicine stock updated</span>
            </div>
            <span className="text-xs text-gray-500">15 min ago</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-700">New doctor joined</span>
            </div>
            <span className="text-xs text-gray-500">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}