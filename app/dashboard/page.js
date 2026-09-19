'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Pill,
  UserCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  IndianRupee,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Stethoscope,
  Briefcase,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ChevronRight,
  RefreshCw,
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
} from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    doctors: 0,
    patients: 0,
    medicines: 0,
    staff: 0,
    totalMembers: 0,
    expenses: 0,
    lowStockCount: 0,
  });
  const [roleData, setRoleData] = useState([]);
  const [medicineData, setMedicineData] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const router = useRouter();

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

  // Fetch data from API
  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [membersRes, medicinesRes, expensesRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/medicines'),
        fetch('/api/expenses'),
      ]);

      const [membersData, medicinesData, expensesData] = await Promise.all([
        membersRes.json(),
        medicinesRes.json(),
        expensesRes.json(),
      ]);

      // Process members
      if (membersData.success) {
        const members = membersData.data || [];
        const doctors = members.filter((m) => m.role === 'Doctor');
        const patients = members.filter((m) => m.role === 'Patient');
        const staff = members.filter((m) => m.role === 'Staff');

        const roleDistribution = [
          { name: 'Doctors', value: doctors.length },
          { name: 'Patients', value: patients.length },
          { name: 'Staff', value: staff.length },
        ].filter((item) => item.value > 0);

        setRoleData(roleDistribution);
        setRecentMembers(members.slice(0, 5));

        setStats((prev) => ({
          ...prev,
          doctors: doctors.length,
          patients: patients.length,
          staff: staff.length,
          totalMembers: members.length,
        }));
      }

      // Process medicines
      if (medicinesData.success) {
        const medicines = medicinesData.data || [];
        const totalStock = medicines.reduce(
          (sum, med) => sum + (parseInt(med.quantity) || 0),
          0
        );

        const medicineStock = medicines
          .slice()
          .sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
          .slice(0, 8)
          .map((med) => ({
            name:
              med.name.length > 10 ? med.name.substring(0, 10) + '...' : med.name,
            fullName: med.name,
            stock: parseInt(med.quantity) || 0,
            mg: med.mg || '0',
          }));

        const lowStock = medicines
          .filter((m) => (parseInt(m.quantity) || 0) < 10)
          .sort((a, b) => (a.quantity || 0) - (b.quantity || 0));

        setMedicineData(medicineStock);
        setLowStockMedicines(lowStock);

        setStats((prev) => ({
          ...prev,
          medicines: totalStock,
          lowStockCount: lowStock.length,
        }));
      }

      // Process expenses
      if (expensesData.success) {
        const expenses = expensesData.data || [];
        const totalExpenses = expenses.reduce(
          (sum, exp) => sum + (parseFloat(exp.amount) || 0),
          0
        );
        setRecentExpenses(expenses.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          expenses: totalExpenses,
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchDashboardData();
  }, []);

  // Trend data with realistic variation
  const generateTrendData = () => {
    const data = [];
    const days =
      selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 12;
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      if (selectedPeriod === 'year') {
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString('en-IN', { month: 'short' }),
          patients: Math.floor(Math.random() * 200) + 100,
          appointments: Math.floor(Math.random() * 150) + 50,
          revenue: Math.floor(Math.random() * 200000) + 50000,
        });
      } else {
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
          }),
          patients: Math.floor(Math.random() * 30) + 10,
          appointments: Math.floor(Math.random() * 20) + 5,
          revenue: Math.floor(Math.random() * 50000) + 10000,
        });
      }
    }
    return data;
  };

  const trendData = generateTrendData();
  const totalRevenue = trendData.reduce((sum, d) => sum + d.revenue, 0);
  const totalAppointments = trendData.reduce(
    (sum, d) => sum + d.appointments,
    0
  );
  const avgPatients = Math.round(
    trendData.reduce((sum, d) => sum + d.patients, 0) / trendData.length
  );

  // Stats cards
  const cards = [
    {
      title: 'Doctors',
      value: stats.doctors,
      icon: Stethoscope,
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      link: '/dashboard/members',
    },
    {
      title: 'Patients',
      value: stats.patients,
      icon: UserCircle,
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      link: '/dashboard/members',
    },
    {
      title: 'Staff',
      value: stats.staff,
      icon: Briefcase,
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      link: '/dashboard/members',
    },
    {
      title: 'Medicine Stock',
      value: stats.medicines,
      icon: Package,
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      link: '/dashboard/medicines',
    },
    {
      title: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      link: '/dashboard/members',
    },
    {
      title: 'Total Expenses',
      value: `₹${stats.expenses.toLocaleString('en-IN')}`,
      icon: IndianRupee,
      gradient: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      link: '/dashboard/expenses',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Filter */}
          <div className="flex gap-1 bg-white rounded-lg shadow-sm p-1">
            {['week', 'month', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-800">
              Low Stock Alert
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              {stats.lowStockCount} medicine
              {stats.lowStockCount > 1 ? 's are' : ' is'} running low. Please
              restock soon.
            </p>
          </div>
          <Link
            href="/dashboard/medicines"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-900"
          >
            View
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.link}
              className="bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2.5 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {card.title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 truncate">
                {card.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Bar Chart - Medicine Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Medicine Stock
                </h3>
                <p className="text-xs text-gray-500">Top 8 by quantity</p>
              </div>
            </div>
          </div>
          <div className="h-56 sm:h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={medicineData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`${value} units`, 'Stock']}
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                  {medicineData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Role Distribution */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <PieChartIcon className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Member Distribution
                </h3>
                <p className="text-xs text-gray-500">By role</p>
              </div>
            </div>
          </div>
          <div className="h-56 sm:h-64">
            {roleData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {roleData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} members`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No member data available
              </div>
            )}
          </div>
        </div>

        {/* Line Chart - Trends */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <LineChartIcon className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Patient & Appointment Trends
                </h3>
                <p className="text-xs text-gray-500">Last {selectedPeriod}</p>
              </div>
            </div>
          </div>
          <div className="h-56 sm:h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="patients"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Patients"
                />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                  name="Appointments"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart - Revenue */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  Revenue Trend
                </h3>
                <p className="text-xs text-gray-500">Last {selectedPeriod}</p>
              </div>
            </div>
          </div>
          <div className="h-56 sm:h-64 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorRevenue"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString('en-IN')}`,
                    'Revenue',
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm opacity-90 font-medium">
              Total Revenue
            </p>
            <TrendingUp className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-xl sm:text-2xl font-bold truncate">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs opacity-80 mt-1">Last {selectedPeriod}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm opacity-90 font-medium">
              Total Patients
            </p>
            <Users className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.patients}</p>
          <p className="text-xs opacity-80 mt-1">Active patients</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm opacity-90 font-medium">
              Appointments
            </p>
            <Calendar className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-xl sm:text-2xl font-bold">{totalAppointments}</p>
          <p className="text-xs opacity-80 mt-1">Last {selectedPeriod}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs sm:text-sm opacity-90 font-medium">
              Avg Daily Patients
            </p>
            <Activity className="w-4 h-4 opacity-80" />
          </div>
          <p className="text-xl sm:text-2xl font-bold">{avgPatients}</p>
          <p className="text-xs opacity-80 mt-1">Per day average</p>
        </div>
      </div>

      {/* Two Column Layout - Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Members */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                Recent Members
              </h3>
            </div>
            <Link
              href="/dashboard/members"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentMembers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                No members yet
              </p>
            ) : (
              recentMembers.map((member) => (
                <div
                  key={member._id || member.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0 ${
                        member.role === 'Doctor'
                          ? 'bg-blue-500'
                          : member.role === 'Patient'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }`}
                    >
                      {member.name?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {member.role}
                        {member.specialization &&
                          member.specialization !== 'N/A' &&
                          ` • ${member.specialization}`}
                        {member.staffType &&
                          member.staffType !== 'N/A' &&
                          ` • ${member.staffType}`}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${
                      member.role === 'Doctor'
                        ? 'bg-blue-100 text-blue-700'
                        : member.role === 'Patient'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Medicines */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                Low Stock Medicines
              </h3>
            </div>
            <Link
              href="/dashboard/medicines"
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {lowStockMedicines.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-sm text-gray-500">
                  All medicines are in stock
                </p>
              </div>
            ) : (
              lowStockMedicines.slice(0, 5).map((med) => (
                <div
                  key={med._id || med.id}
                  className="flex items-center justify-between p-2.5 bg-red-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Pill className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {med.name}
                      </p>
                      <p className="text-xs text-gray-500">{med.mg} mg</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex-shrink-0">
                    {med.quantity} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}