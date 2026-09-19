'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Trash2,
  Stethoscope,
  Briefcase,
  Users,
  Receipt,
  Wrench,
  Package,
  MoreHorizontal,
  Calendar,
  IndianRupee,
  TrendingDown,
  Loader2,
  ChevronDown,
  Info,
  X,
  FileText,
} from 'lucide-react';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Maintenance',
    staffId: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [showForm, setShowForm] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const router = useRouter();

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();

      if (data.success) {
        const allMembers = data.data || [];
        setStaffMembers(allMembers.filter((m) => m.role === 'Staff'));
        setDoctors(allMembers.filter((m) => m.role === 'Doctor'));
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      const data = await response.json();

      if (data.success) {
        setExpenses(data.data || []);
        setTotalExpenses(data.total || 0);
      } else {
        showToast('Failed to fetch expenses', 'error');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const loadData = async () => {
      await fetchMembers();
      await fetchExpenses();
    };
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Expense added successfully!');
        await fetchExpenses();
        setFormData({
          type: 'Maintenance',
          staffId: '',
          amount: '',
          description: '',
        });
      } else {
        showToast(data.message || 'Failed to add expense', 'error');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null });

    try {
      setLoading(true);
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showToast('Expense deleted successfully!');
        await fetchExpenses();
      } else {
        showToast(data.message || 'Failed to delete expense', 'error');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalSalaryMembers = staffMembers.length + doctors.length;

  // Type config with icons and colors
  const typeConfig = {
    Salary: {
      icon: Users,
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
      gradient: 'from-purple-500 to-purple-600',
    },
    Equipment: {
      icon: Package,
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      gradient: 'from-blue-500 to-blue-600',
    },
    Maintenance: {
      icon: Wrench,
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    Other: {
      icon: MoreHorizontal,
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-200',
      gradient: 'from-gray-500 to-gray-600',
    },
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.type?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'All' || exp.type === filterType;

    return matchesSearch && matchesType;
  });

  // Stats
  const salaryTotal = expenses
    .filter((e) => e.type === 'Salary')
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  const otherTotal = totalExpenses - salaryTotal;

  const thisMonthExpenses = expenses
    .filter((e) => {
      const expDate = new Date(e.date);
      const now = new Date();
      return (
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  return (
    <div className="relative text-black space-y-5">
      <Toast
        show={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
        message={toast.message}
        type={toast.type}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-md">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            Expense Management
          </h1>
          <p className="text-sm text-gray-500 mt-2 ml-1">
            Track salaries, equipment, and other hospital expenses
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Hide Form
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Expense
            </>
          )}
        </button>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold truncate">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-xs opacity-90 mt-1">All Expenses</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Salary
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold truncate">
            ₹{salaryTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs opacity-90 mt-1">Salaries Paid</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Others
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold truncate">
            ₹{otherTotal.toLocaleString('en-IN')}
          </p>
          <p className="text-xs opacity-90 mt-1">Non-Salary</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Month
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold truncate">
            ₹{thisMonthExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-xs opacity-90 mt-1">This Month</p>
        </div>
      </div>

      {/* ===== Add Expense Form ===== */}
      {showForm && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Add New Expense</h3>
              <p className="text-xs text-gray-500">
                Record a new hospital expense
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Expense Type - Pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expense Type *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(typeConfig).map((type) => {
                  const config = typeConfig[type];
                  const Icon = config.icon;
                  const isActive = formData.type === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, type, staffId: '' })
                      }
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isActive
                          ? `${config.bg} ${config.text} ${config.border}`
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                      disabled={submitting}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        {type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary Member Selection */}
            {formData.type === 'Salary' && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 space-y-3 animate-fade-in">
                <label className="block text-sm font-medium text-gray-700">
                  Select Doctor / Staff *
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white pr-10"
                    value={formData.staffId}
                    onChange={(e) =>
                      setFormData({ ...formData, staffId: e.target.value })
                    }
                    disabled={submitting}
                  >
                    <option value="">Choose Member</option>

                    {doctors.length > 0 && (
                      <optgroup label="👨‍⚕️ Doctors">
                        {doctors.map((doc) => (
                          <option
                            key={doc._id || doc.id}
                            value={doc._id || doc.id}
                          >
                            {doc.name} —{' '}
                            {doc.specialization && doc.specialization !== 'N/A'
                              ? doc.specialization
                              : 'Doctor'}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {staffMembers.length > 0 && (
                      <optgroup label="👨‍💼 Staff">
                        {staffMembers.map((staff) => (
                          <option
                            key={staff._id || staff.id}
                            value={staff._id || staff.id}
                          >
                            {staff.name} — {staff.staffType || 'Staff'}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {totalSalaryMembers === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        No doctors or staff found. Please add them in the
                        Members section first.
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/dashboard/members')}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Go to Members →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Amount (₹) *
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min="1"
                  step="0.01"
                  className="w-full text-black pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  disabled={submitting}
                  placeholder="e.g., 25000"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description
              </label>
              <textarea
                className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter description (optional)"
                disabled={submitting}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Expense
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ===== Expense History ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header + Search */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-red-600" />
              Expense History
            </h3>
            <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-medium self-start sm:self-auto">
              {filteredExpenses.length} of {expenses.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="relative sm:w-44">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="All">All Types</option>
                <option value="Salary">Salary</option>
                <option value="Equipment">Equipment</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Amount
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !expenses.length ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Loading expenses...
                    </p>
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Receipt className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {searchTerm || filterType !== 'All'
                        ? 'No expenses match your filters'
                        : 'No expenses recorded yet'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || filterType !== 'All'
                        ? 'Try adjusting your search or filter'
                        : 'Add your first expense to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const config =
                    typeConfig[exp.type] || typeConfig.Other;
                  const TypeIcon = config.icon;
                  const isDoctor =
                    exp.staffDetails?.role === 'Doctor';

                  return (
                    <tr
                      key={exp._id || exp.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(exp.date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
                        >
                          <TypeIcon className="w-3 h-3" />
                          {exp.type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {exp.type === 'Salary' ? (
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isDoctor
                                  ? 'bg-blue-100'
                                  : 'bg-yellow-100'
                              }`}
                            >
                              {isDoctor ? (
                                <Stethoscope className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Briefcase className="w-4 h-4 text-yellow-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {exp.staffName || 'Unknown'}
                              </p>
                              {exp.staffDetails?.specialization &&
                                exp.staffDetails.specialization !==
                                  'N/A' && (
                                  <p className="text-xs text-gray-500">
                                    {exp.staffDetails.specialization}
                                  </p>
                                )}
                              {exp.staffDetails?.staffType &&
                                exp.staffDetails.staffType !== 'N/A' && (
                                  <p className="text-xs text-gray-500">
                                    {exp.staffDetails.staffType}
                                  </p>
                                )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">
                            {exp.description || '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-red-600">
                          - ₹{exp.amount.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() =>
                            handleDeleteClick(exp._id || exp.id)
                          }
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                          disabled={loading}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {loading && !expenses.length ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading expenses...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No expenses found</p>
            </div>
          ) : (
            filteredExpenses.map((exp) => {
              const config = typeConfig[exp.type] || typeConfig.Other;
              const TypeIcon = config.icon;
              const isDoctor = exp.staffDetails?.role === 'Doctor';

              return (
                <div key={exp._id || exp.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}
                      >
                        <TypeIcon
                          className={`w-5 h-5 ${config.text}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
                        >
                          {exp.type}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(exp.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-red-600">
                        - ₹{exp.amount.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-sm">
                    {exp.type === 'Salary' ? (
                      <div className="flex items-center gap-2">
                        {isDoctor ? (
                          <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        ) : (
                          <Briefcase className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {exp.staffName}
                          </p>
                          {exp.staffDetails?.specialization &&
                            exp.staffDetails.specialization !==
                              'N/A' && (
                              <p className="text-xs text-gray-500">
                                {exp.staffDetails.specialization}
                              </p>
                            )}
                          {exp.staffDetails?.staffType &&
                            exp.staffDetails.staffType !== 'N/A' && (
                              <p className="text-xs text-gray-500">
                                {exp.staffDetails.staffType}
                              </p>
                            )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        {exp.description || 'No description'}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteClick(exp._id || exp.id)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}