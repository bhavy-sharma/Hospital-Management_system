'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pill,
  Plus,
  PackagePlus,
  PackageMinus,
  Search,
  Trash2,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  X,
  Loader2,
  ChevronDown,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  Info,
  CheckCircle2,
} from 'lucide-react';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({ name: '', mg: '', quantity: '' });
  const [outData, setOutData] = useState({ medicineId: '', quantity: '' });
  const [restockData, setRestockData] = useState({ medicineId: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const router = useRouter();

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/medicines');
      const data = await response.json();

      if (data.success) {
        setMedicines(data.data);
      } else {
        showToast('Failed to fetch medicines', 'error');
      }
    } catch (error) {
      console.error('Error fetching medicines:', error);
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
    fetchMedicines();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  // Add new medicine
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Medicine added to pharmacy successfully!');
        await fetchMedicines();
        setFormData({ name: '', mg: '', quantity: '' });
      } else {
        showToast(data.message || 'Failed to add medicine', 'error');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Dispense medicine
  const handleOut = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/medicines/${outData.medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: outData.quantity,
          action: 'dispense',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Medicine dispensed successfully!');
        await fetchMedicines();
        setOutData({ medicineId: '', quantity: '' });
      } else {
        showToast(data.message || 'Failed to dispense medicine', 'error');
      }
    } catch (error) {
      console.error('Error dispensing medicine:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Restock medicine
  const handleRestock = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/medicines/${restockData.medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: restockData.quantity,
          action: 'restock',
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Medicine restocked successfully!');
        await fetchMedicines();
        setRestockData({ medicineId: '', quantity: '' });
      } else {
        showToast(data.message || 'Failed to restock medicine', 'error');
      }
    } catch (error) {
      console.error('Error restocking medicine:', error);
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
      const response = await fetch(`/api/medicines/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showToast('Medicine deleted successfully!');
        await fetchMedicines();
      } else {
        showToast(data.message || 'Failed to delete medicine', 'error');
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedMedicine = (id) => {
    return medicines.find((m) => (m._id || m.id) === id);
  };

  const selectedOutMedicine = getSelectedMedicine(outData.medicineId);
  const selectedRestockMedicine = getSelectedMedicine(restockData.medicineId);

  // Filter & search medicines
  const filteredMedicines = medicines.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.mg?.toString().toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStock === 'low') return med.quantity < 10;
    if (filterStock === 'medium')
      return med.quantity >= 10 && med.quantity < 50;
    if (filterStock === 'high') return med.quantity >= 50;
    return true;
  });

  // Stats
  const totalStock = medicines.reduce(
    (sum, med) => sum + (parseInt(med.quantity) || 0),
    0
  );
  const lowStockCount = medicines.filter((m) => m.quantity < 10).length;
  const totalMedicines = medicines.length;

  // Tabs config
  const tabs = [
    {
      id: 'add',
      label: 'Add Medicine',
      icon: Plus,
      activeColor: 'bg-blue-600 text-white shadow-md',
      hoverColor: 'hover:bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'restock',
      label: 'Restock',
      icon: PackagePlus,
      activeColor: 'bg-green-600 text-white shadow-md',
      hoverColor: 'hover:bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'out',
      label: 'Dispense',
      icon: PackageMinus,
      activeColor: 'bg-red-600 text-white shadow-md',
      hoverColor: 'hover:bg-red-50',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
  ];

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
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* ===== Header ===== */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md">
            <Pill className="w-6 h-6 text-white" />
          </div>
          Pharmacy
        </h1>
        <p className="text-sm text-gray-500 mt-2 ml-1">
          Manage medicine inventory, stock levels, and dispensing
        </p>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Types
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalMedicines}</p>
          <p className="text-xs opacity-90 mt-1">Medicines</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <Boxes className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Total
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{totalStock}</p>
          <p className="text-xs opacity-90 mt-1">Units in Stock</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Alert
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{lowStockCount}</p>
          <p className="text-xs opacity-90 mt-1">Low Stock</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 opacity-90" />
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              Healthy
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">
            {totalMedicines - lowStockCount}
          </p>
          <p className="text-xs opacity-90 mt-1">Well Stocked</p>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={loading}
              className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? tab.activeColor
                  : `bg-gray-50 text-gray-600 ${tab.hoverColor}`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ===== Add Medicine Form ===== */}
      {activeTab === 'add' && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Add New Medicine</h3>
              <p className="text-xs text-gray-500">
                Enter medicine details to add to pharmacy
              </p>
            </div>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Medicine Name *
              </label>
              <input
                type="text"
                required
                className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={submitting}
                placeholder="e.g., Paracetamol"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  MG (Milligrams) *
                </label>
                <input
                  type="text"
                  required
                  className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.mg}
                  onChange={(e) =>
                    setFormData({ ...formData, mg: e.target.value })
                  }
                  disabled={submitting}
                  placeholder="e.g., 500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Initial Quantity *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  disabled={submitting}
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add to Pharmacy
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ===== Restock Form ===== */}
      {activeTab === 'restock' && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <div className="p-2 bg-green-100 rounded-lg">
              <PackagePlus className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Restock Medicine</h3>
              <p className="text-xs text-gray-500">
                Add more quantity to existing stock
              </p>
            </div>
          </div>

          <form onSubmit={handleRestock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Medicine *
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none bg-white pr-10"
                  value={restockData.medicineId}
                  onChange={(e) =>
                    setRestockData({ ...restockData, medicineId: e.target.value })
                  }
                  disabled={submitting}
                >
                  <option value="">Choose Medicine</option>
                  {medicines.map((med) => (
                    <option key={med._id || med.id} value={med._id || med.id}>
                      {med.name} ({med.mg}mg) — Current: {med.quantity} units
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {medicines.length === 0 && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  No medicines found. Please add medicine first.
                </p>
              )}
            </div>

            {selectedRestockMedicine && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700 font-medium">
                    Current Stock
                  </span>
                  <span className="text-sm font-bold text-green-800">
                    {selectedRestockMedicine.quantity} units
                  </span>
                </div>
                {restockData.quantity && parseInt(restockData.quantity) > 0 && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 font-medium">
                        Adding
                      </span>
                      <span className="text-sm font-bold text-green-800">
                        +{restockData.quantity} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-green-200">
                      <span className="text-sm text-green-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        After Restock
                      </span>
                      <span className="text-base font-bold text-green-800">
                        {selectedRestockMedicine.quantity +
                          parseInt(restockData.quantity || 0)}{' '}
                        units
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity to Add *
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={restockData.quantity}
                onChange={(e) =>
                  setRestockData({ ...restockData, quantity: e.target.value })
                }
                disabled={submitting}
                placeholder="e.g., 50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !restockData.medicineId}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Restocking...
                </>
              ) : (
                <>
                  <ArrowDownToLine className="w-4 h-4" />
                  Add to Stock
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ===== Dispense Form ===== */}
      {activeTab === 'out' && (
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 animate-slide-up">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
            <div className="p-2 bg-red-100 rounded-lg">
              <PackageMinus className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                Dispense Medicine
              </h3>
              <p className="text-xs text-gray-500">
                Remove quantity from stock
              </p>
            </div>
          </div>

          <form onSubmit={handleOut} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Medicine *
              </label>
              <div className="relative">
                <select
                  required
                  className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none bg-white pr-10"
                  value={outData.medicineId}
                  onChange={(e) =>
                    setOutData({ ...outData, medicineId: e.target.value })
                  }
                  disabled={submitting}
                >
                  <option value="">Choose Medicine</option>
                  {medicines.map((med) => (
                    <option key={med._id || med.id} value={med._id || med.id}>
                      {med.name} ({med.mg}mg) — Stock: {med.quantity} units
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {selectedOutMedicine && (
              <div
                className={`p-4 rounded-lg space-y-2 animate-fade-in border ${
                  parseInt(outData.quantity || 0) >
                  selectedOutMedicine.quantity
                    ? 'bg-red-50 border-red-200'
                    : 'bg-orange-50 border-orange-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Available Stock
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {selectedOutMedicine.quantity} units
                  </span>
                </div>

                {outData.quantity && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Dispensing
                      </span>
                      <span className="text-sm font-bold text-red-600">
                        -{outData.quantity} units
                      </span>
                    </div>

                    {parseInt(outData.quantity) >
                    selectedOutMedicine.quantity ? (
                      <div className="flex items-center gap-2 pt-2 border-t border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span className="text-sm font-medium text-red-700">
                          Insufficient stock! Max:{' '}
                          {selectedOutMedicine.quantity} units
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-orange-200">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          Remaining
                        </span>
                        <span className="text-base font-bold text-gray-800">
                          {selectedOutMedicine.quantity -
                            parseInt(outData.quantity || 0)}{' '}
                          units
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity to Dispense *
              </label>
              <input
                type="number"
                required
                min="1"
                max={selectedOutMedicine?.quantity || undefined}
                className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={outData.quantity}
                onChange={(e) =>
                  setOutData({ ...outData, quantity: e.target.value })
                }
                disabled={submitting}
                placeholder="e.g., 10"
              />
            </div>

            <button
              type="submit"
              disabled={
                submitting ||
                !outData.medicineId ||
                (selectedOutMedicine &&
                  parseInt(outData.quantity || 0) >
                    selectedOutMedicine.quantity)
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4" />
                  Dispense Medicine
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ===== Medicines List ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header with search & filter */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Current Stock
            </h3>
            <span className="text-xs px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full font-medium self-start sm:self-auto">
              {filteredMedicines.length} of {medicines.length}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="relative sm:w-44">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value)}
                className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white text-sm"
              >
                <option value="all">All Stock</option>
                <option value="low">Low (&lt;10)</option>
                <option value="medium">Medium (10-50)</option>
                <option value="high">High (50+)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  MG
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !medicines.length ? (
                <tr>
                  <td colSpan="4" className="px-5 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">
                      Loading medicines...
                    </p>
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-5 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Pill className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      {searchTerm || filterStock !== 'all'
                        ? 'No medicines match your filters'
                        : 'No medicines in pharmacy'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || filterStock !== 'all'
                        ? 'Try adjusting your search or filter'
                        : 'Add a new medicine to get started'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredMedicines.map((med) => {
                  const stockStatus =
                    med.quantity < 10
                      ? 'low'
                      : med.quantity < 50
                      ? 'medium'
                      : 'high';

                  return (
                    <tr
                      key={med._id || med.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              stockStatus === 'low'
                                ? 'bg-red-100'
                                : stockStatus === 'medium'
                                ? 'bg-yellow-100'
                                : 'bg-green-100'
                            }`}
                          >
                            <Pill
                              className={`w-5 h-5 ${
                                stockStatus === 'low'
                                  ? 'text-red-600'
                                  : stockStatus === 'medium'
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {med.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {(med._id || med.id)?.toString().slice(-6)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                          {med.mg} mg
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold ${
                              stockStatus === 'low'
                                ? 'text-red-600'
                                : stockStatus === 'medium'
                                ? 'text-yellow-600'
                                : 'text-green-600'
                            }`}
                          >
                            {med.quantity}
                          </span>
                          {stockStatus === 'low' && (
                            <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              Low
                            </span>
                          )}
                          {stockStatus === 'medium' && (
                            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                              <TrendingDown className="w-3 h-3" />
                              Medium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setRestockData({
                                medicineId: med._id || med.id,
                                quantity: '',
                              });
                              setActiveTab('restock');
                              window.scrollTo({
                                top: 0,
                                behavior: 'smooth',
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-xs font-medium transition-colors"
                            disabled={loading}
                            title="Restock"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            Restock
                          </button>
                          <button
                            onClick={() => {
                              setOutData({
                                medicineId: med._id || med.id,
                                quantity: '',
                              });
                              setActiveTab('out');
                              window.scrollTo({
                                top: 0,
                                behavior: 'smooth',
                              });
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-xs font-medium transition-colors"
                            disabled={loading}
                            title="Dispense"
                          >
                            <PackageMinus className="w-3.5 h-3.5" />
                            Out
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteClick(med._id || med.id)
                            }
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            disabled={loading}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
          {loading && !medicines.length ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading medicines...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Pill className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No medicines found</p>
            </div>
          ) : (
            filteredMedicines.map((med) => {
              const stockStatus =
                med.quantity < 10
                  ? 'low'
                  : med.quantity < 50
                  ? 'medium'
                  : 'high';

              return (
                <div key={med._id || med.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          stockStatus === 'low'
                            ? 'bg-red-100'
                            : stockStatus === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-green-100'
                        }`}
                      >
                        <Pill
                          className={`w-5 h-5 ${
                            stockStatus === 'low'
                              ? 'text-red-600'
                              : stockStatus === 'medium'
                              ? 'text-yellow-600'
                              : 'text-green-600'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {med.name}
                        </p>
                        <p className="text-xs text-gray-500">{med.mg} mg</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`text-xl font-bold ${
                          stockStatus === 'low'
                            ? 'text-red-600'
                            : stockStatus === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {med.quantity}
                      </p>
                      <p className="text-xs text-gray-500">in stock</p>
                    </div>
                  </div>

                  {stockStatus === 'low' && (
                    <div className="flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-2.5 py-1.5 rounded-lg border border-red-100">
                      <AlertTriangle className="w-3 h-3" />
                      Low stock — consider restocking
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setRestockData({
                          medicineId: med._id || med.id,
                          quantity: '',
                        });
                        setActiveTab('restock');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
                    >
                      <PackagePlus className="w-3.5 h-3.5" />
                      Restock
                    </button>
                    <button
                      onClick={() => {
                        setOutData({
                          medicineId: med._id || med.id,
                          quantity: '',
                        });
                        setActiveTab('out');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                    >
                      <PackageMinus className="w-3.5 h-3.5" />
                      Out
                    </button>
                    <button
                      onClick={() => handleDeleteClick(med._id || med.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}