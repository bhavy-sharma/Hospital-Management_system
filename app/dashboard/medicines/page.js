'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState('add'); // 'add', 'out', 'restock'
  const [formData, setFormData] = useState({ name: '', mg: '', quantity: '' });
  const [outData, setOutData] = useState({ medicineId: '', quantity: '' });
  const [restockData, setRestockData] = useState({ medicineId: '', quantity: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const router = useRouter();

  // Fetch medicines from API
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
    setLoading(true);

    try {
      const response = await fetch('/api/medicines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Medicine added to stock successfully!');
        await fetchMedicines();
        setFormData({ name: '', mg: '', quantity: '' });
      } else {
        showToast(data.message || 'Failed to add medicine', 'error');
      }
    } catch (error) {
      console.error('Error adding medicine:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Dispense (Out) medicine
  const handleOut = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/medicines/${outData.medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quantity: outData.quantity,
          action: 'dispense' 
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
      setLoading(false);
    }
  };

  // ✅ Restock medicine (NEW)
  const handleRestock = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/medicines/${restockData.medicineId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          quantity: restockData.quantity,
          action: 'restock' 
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
      setLoading(false);
    }
  };

  // Delete medicine with modal
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

  // Get selected medicine details for restock/out
  const getSelectedMedicine = (id) => {
    return medicines.find(m => (m._id || m.id) === id);
  };

  const selectedOutMedicine = getSelectedMedicine(outData.medicineId);
  const selectedRestockMedicine = getSelectedMedicine(restockData.medicineId);

  return (
    <div className="text-black">
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
        message={toast.message}
        type={toast.type}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Medicine"
        message="Are you sure you want to delete this medicine? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Medicine Inventory</h2>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 text-black">
        <button 
          onClick={() => setActiveTab('add')} 
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'add' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={loading}
        >
          ➕ Add Medicine
        </button>
        <button 
          onClick={() => setActiveTab('restock')} 
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'restock' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={loading}
        >
          📦 Restock Medicine
        </button>
        <button 
          onClick={() => setActiveTab('out')} 
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'out' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={loading}
        >
          📤 Out Medicine
        </button>
      </div>

      {/* Add Medicine Form */}
      {activeTab === 'add' && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Medicine</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
            <input 
              type="text" 
              required 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              placeholder="e.g., Paracetamol"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">MG (e.g., 500)</label>
            <input 
              type="text" 
              required 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.mg} 
              onChange={(e) => setFormData({ ...formData, mg: e.target.value })}
              disabled={loading}
              placeholder="e.g., 500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input 
              type="number" 
              required 
              min="1"
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.quantity} 
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              disabled={loading}
              placeholder="e.g., 100"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add to Stock'}
          </button>
        </form>
      )}

      {/* ✅ Restock Medicine Form */}
      {activeTab === 'restock' && (
        <form onSubmit={handleRestock} className="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📦 Restock Medicine</h3>
          <p className="text-sm text-gray-500 mb-4">
            Existing medicine mein aur quantity add karein
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Medicine</label>
            <select 
              required 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              value={restockData.medicineId} 
              onChange={(e) => setRestockData({ ...restockData, medicineId: e.target.value })}
              disabled={loading}
            >
              <option value="">Choose Medicine</option>
              {medicines.map(med => (
                <option key={med._id || med.id} value={med._id || med.id}>
                  {med.name} ({med.mg}mg) - Current Stock: {med.quantity}
                </option>
              ))}
            </select>
            {medicines.length === 0 && (
              <p className="text-xs text-red-500 mt-1">
                No medicines found. Pehle "Add Medicine" tab se medicine add karein.
              </p>
            )}
          </div>

          {/* Show current stock if selected */}
          {selectedRestockMedicine && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Current Stock:</strong> {selectedRestockMedicine.quantity} units
              </p>
              {restockData.quantity && (
                <p className="text-sm text-green-800 mt-1">
                  <strong>After Restock:</strong> {selectedRestockMedicine.quantity + parseInt(restockData.quantity || 0)} units
                </p>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
            <input 
              type="number" 
              required 
              min="1"
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
              value={restockData.quantity} 
              onChange={(e) => setRestockData({ ...restockData, quantity: e.target.value })}
              disabled={loading}
              placeholder="e.g., 50"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            disabled={loading || !restockData.medicineId}
          >
            {loading ? 'Restocking...' : '📦 Add to Stock'}
          </button>
        </form>
      )}

      {/* Out Medicine Form */}
      {activeTab === 'out' && (
        <form onSubmit={handleOut} className="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📤 Dispense Medicine</h3>
          <p className="text-sm text-gray-500 mb-4">
            Stock se medicine nikaalein
          </p>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Medicine</label>
            <select 
              required 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              value={outData.medicineId} 
              onChange={(e) => setOutData({ ...outData, medicineId: e.target.value })}
              disabled={loading}
            >
              <option value="">Choose Medicine</option>
              {medicines.map(med => (
                <option key={med._id || med.id} value={med._id || med.id}>
                  {med.name} ({med.mg}mg) - Stock: {med.quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Show current stock if selected */}
          {selectedOutMedicine && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Available Stock:</strong> {selectedOutMedicine.quantity} units
              </p>
              {outData.quantity && parseInt(outData.quantity) > selectedOutMedicine.quantity && (
                <p className="text-sm text-red-600 mt-1 font-medium">
                  ⚠️ Insufficient stock! Maximum: {selectedOutMedicine.quantity} units
                </p>
              )}
              {outData.quantity && parseInt(outData.quantity) <= selectedOutMedicine.quantity && (
                <p className="text-sm text-red-800 mt-1">
                  <strong>Remaining After:</strong> {selectedOutMedicine.quantity - parseInt(outData.quantity || 0)} units
                </p>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Dispense</label>
            <input 
              type="number" 
              required 
              min="1"
              max={selectedOutMedicine?.quantity || undefined}
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              value={outData.quantity} 
              onChange={(e) => setOutData({ ...outData, quantity: e.target.value })}
              disabled={loading}
              placeholder="e.g., 10"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            disabled={
              loading || 
              !outData.medicineId || 
              (selectedOutMedicine && parseInt(outData.quantity || 0) > selectedOutMedicine.quantity)
            }
          >
            {loading ? 'Processing...' : '📤 Dispense Medicine'}
          </button>
        </form>
      )}

      {/* Medicines Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-3 bg-gray-100 border-b">
          <h3 className="font-semibold text-gray-700">Current Stock</h3>
          <span className="text-sm text-gray-500">Total: {medicines.length} medicines</span>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-gray-600">Medicine Name</th>
              <th className="px-6 py-3 text-gray-600">MG</th>
              <th className="px-6 py-3 text-gray-600">Current Stock</th>
              <th className="px-6 py-3 text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !medicines.length ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : medicines.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No medicines in stock.
                </td>
              </tr>
            ) : 
              medicines.map((med) => (
                <tr key={med._id || med.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{med.name}</td>
                  <td className="px-6 py-4">{med.mg} mg</td>
                  <td className={`px-6 py-4 font-semibold ${
                    med.quantity < 10 ? 'text-red-600' : 
                    med.quantity < 50 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {med.quantity}
                    {med.quantity < 10 && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Low Stock
                      </span>
                    )}
                    {med.quantity >= 10 && med.quantity < 50 && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                        Medium
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setRestockData({ medicineId: med._id || med.id, quantity: '' });
                        setActiveTab('restock');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors mr-2"
                      disabled={loading}
                    >
                      Restock
                    </button>
                    <button
                      onClick={() => {
                        setOutData({ medicineId: med._id || med.id, quantity: '' });
                        setActiveTab('out');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm transition-colors mr-2"
                      disabled={loading}
                    >
                      Out
                    </button>
                    <button
                      onClick={() => handleDeleteClick(med._id || med.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}