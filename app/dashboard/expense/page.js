'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../../components/Toast';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [formData, setFormData] = useState({ 
    type: 'Maintenance', 
    staffId: '', 
    amount: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [totalExpenses, setTotalExpenses] = useState(0);
  const router = useRouter();

  // Fetch staff members
  const fetchStaffMembers = async () => {
    try {
      console.log('Fetching staff members...');
      const response = await fetch('/api/members');
      const data = await response.json();
      console.log('Staff members response:', data);
      
      if (data.success) {
        const allMembers = data.data || [];
        console.log('All members:', allMembers);
        
        // Filter only Staff role
        const staff = allMembers.filter(m => m.role === 'Staff');
        console.log('Filtered staff:', staff);
        
        setStaffMembers(staff);
        
        if (staff.length === 0) {
          console.log('No staff members found');
        }
      } else {
        console.error('Failed to fetch members:', data.message);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  // Fetch expenses
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
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Load data
    const loadData = async () => {
      await fetchStaffMembers();
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
    setLoading(true);

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Expense added successfully!');
        await fetchExpenses();
        setFormData({ type: 'Maintenance', staffId: '', amount: '', description: '' });
      } else {
        showToast(data.message || 'Failed to add expense', 'error');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
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

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

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
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expense Management</h2>
        <div className="text-sm bg-white px-4 py-2 rounded-lg shadow">
          <span className="text-gray-600">Total Expenses: </span>
          <span className="font-bold text-red-600">₹{totalExpenses.toLocaleString()}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Add New Expense</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
          <select 
            className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={formData.type} 
            onChange={(e) => setFormData({ ...formData, type: e.target.value, staffId: '' })}
            disabled={loading}
          >
            <option value="Salary">Salary</option>
            <option value="Equipment">Equipment</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {formData.type === 'Salary' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff</label>
            <select 
              required 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.staffId} 
              onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
              disabled={loading}
            >
              <option value="">Choose Staff Member</option>
              {staffMembers.map(staff => (
                <option key={staff._id || staff.id} value={staff._id || staff.id}>
                  {staff.name} ({staff.staffType || 'Staff'})
                </option>
              ))}
            </select>
            {staffMembers.length === 0 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  ⚠️ No staff members found. Please add staff in the "Members" tab first.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/members')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Go to Members →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
          <input 
            type="number" 
            required 
            min="1"
            step="0.01"
            className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            value={formData.amount} 
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            rows="3" 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description (optional)"
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center px-6 py-3 bg-gray-100 border-b">
          <h3 className="font-semibold text-gray-700">Expense History</h3>
          <span className="text-sm text-gray-500">Total: {expenses.length} entries</span>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-gray-600">Date</th>
              <th className="px-6 py-3 text-gray-600">Type</th>
              <th className="px-6 py-3 text-gray-600">Staff/Details</th>
              <th className="px-6 py-3 text-gray-600 text-right">Amount</th>
              <th className="px-6 py-3 text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !expenses.length ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No expenses recorded yet.
                </td>
              </tr>
            ) : 
              expenses.map((exp) => (
                <tr key={exp._id || exp.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm">{formatDate(exp.date)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      exp.type === 'Salary' ? 'bg-purple-100 text-purple-800' : 
                      exp.type === 'Equipment' ? 'bg-blue-100 text-blue-800' :
                      exp.type === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {exp.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {exp.type === 'Salary' ? (
                      <div>
                        <span className="font-medium">{exp.staffName}</span>
                        {exp.staffDetails?.staffType && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({exp.staffDetails.staffType})
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-600">{exp.description || '-'}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-red-600">
                    - ₹{exp.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteClick(exp._id || exp.id)}
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