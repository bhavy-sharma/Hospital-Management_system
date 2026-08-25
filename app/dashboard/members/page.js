'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', role: 'Doctor', staffType: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const router = useRouter();

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/members');
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.data);
      } else {
        showToast('Failed to fetch members', 'error');
      }
    } catch (error) {
      console.error('Error fetching members:', error);
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
    fetchMembers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/members/${editingId}` : '/api/members';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast(editingId ? 'Member updated successfully!' : 'Member added successfully!');
        await fetchMembers();
        resetForm();
      } else {
        setError(data.message || 'Failed to save member');
        showToast(data.message || 'Failed to save member', 'error');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      setError('Network error. Please try again.');
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      role: member.role,
      staffType: member.staffType !== 'N/A' ? member.staffType : ''
    });
    setEditingId(member._id || member.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    const id = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null });
    
    try {
      setLoading(true);
      const response = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showToast('Member deleted successfully!');
        await fetchMembers();
      } else {
        showToast(data.message || 'Failed to delete member', 'error');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: 'Doctor', staffType: '' });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="relative">
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
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Members</h2>
        <button 
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Member' : 'Add New Member'}
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              required 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value, staffType: '' })}
              disabled={loading}
            >
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          
          {formData.role === 'Staff' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
              <select 
                required 
                className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={formData.staffType} 
                onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Staff Type</option>
                <option value="Nurse">Nurse</option>
                <option value="Compounder">Compounder</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
          
          <div className="flex gap-2">
            <button 
              type="submit" 
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingId ? 'Update Member' : 'Save Member'}
            </button>
            {editingId && (
              <button 
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-gray-600">Name</th>
              <th className="px-6 py-3 text-gray-600">Role</th>
              <th className="px-6 py-3 text-gray-600">Details</th>
              <th className="px-6 py-3 text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !members.length ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No members added yet.
                </td>
              </tr>
            ) : 
              members.map((m) => (
                <tr key={m._id || m.id} className="border-t hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium">{m.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      m.role === 'Doctor' ? 'bg-blue-100 text-blue-800' : 
                      m.role === 'Patient' ? 'bg-green-100 text-green-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {m.staffType !== 'N/A' ? m.staffType : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(m)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2 text-sm transition-colors"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(m._id || m.id)}
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

      {members.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Total members: {members.length}
        </div>
      )}
    </div>
  );
}