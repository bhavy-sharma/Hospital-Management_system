'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', 
    role: 'Doctor', 
    staffType: '',
    details: '',
    phone: '',
    email: '',
    address: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [selectedMember, setSelectedMember] = useState(null);
  const router = useRouter();

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      setLoading(true);
      let url = '/api/members';
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      } else if (filterRole !== 'All') {
        url += `?role=${encodeURIComponent(filterRole)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setMembers(data.data || []);
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
  }, [searchTerm, filterRole]);

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
        showToast(data.message || 'Failed to save member', 'error');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      role: member.role,
      staffType: member.staffType !== 'N/A' ? member.staffType : '',
      details: member.details || '',
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || ''
    });
    setEditingId(member._id || member.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (member) => {
    setSelectedMember(member);
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
    setFormData({ 
      name: '', 
      role: 'Doctor', 
      staffType: '',
      details: '',
      phone: '',
      email: '',
      address: ''
    });
    setEditingId(null);
    setShowForm(false);
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

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Member Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <p className="font-medium text-gray-800">{selectedMember.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Role</label>
                <span className={`px-2 py-1 inline-block rounded-full text-xs ${
                  selectedMember.role === 'Doctor' ? 'bg-blue-100 text-blue-800' : 
                  selectedMember.role === 'Patient' ? 'bg-green-100 text-green-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedMember.role}
                </span>
              </div>
              {selectedMember.staffType !== 'N/A' && (
                <div>
                  <label className="text-xs text-gray-500">Staff Type</label>
                  <p className="font-medium text-gray-800">{selectedMember.staffType}</p>
                </div>
              )}
              {selectedMember.details && (
                <div>
                  <label className="text-xs text-gray-500">Details</label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMember.details}</p>
                </div>
              )}
              {selectedMember.phone && (
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <p className="font-medium text-gray-800">{selectedMember.phone}</p>
                </div>
              )}
              {selectedMember.email && (
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <p className="font-medium text-gray-800">{selectedMember.email}</p>
                </div>
              )}
              {selectedMember.address && (
                <div>
                  <label className="text-xs text-gray-500">Address</label>
                  <p className="text-gray-700">{selectedMember.address}</p>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500">Created</label>
                <p className="text-sm text-gray-500">
                  {new Date(selectedMember.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMember(null)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-2 border rounded-md text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="All">All Roles</option>
          <option value="Doctor">Doctor</option>
          <option value="Patient">Patient</option>
          <option value="Staff">Staff</option>
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-2xl">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Edit Member' : 'Add New Member'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input 
                type="text" 
                required 
                className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                disabled={loading}
                placeholder="Full name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
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
          </div>

          {formData.role === 'Staff' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type *</label>
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
            <textarea 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              rows="3"
              value={formData.details} 
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
              placeholder="Enter any additional details (qualifications, specialization, etc.)"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="tel" 
                className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Phone number"
                disabled={loading}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email address"
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea 
              className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              rows="2"
              value={formData.address} 
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full address"
              disabled={loading}
            />
          </div>
          
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
        <div className="flex justify-between items-center px-6 py-3 bg-gray-100 border-b">
          <h3 className="font-semibold text-gray-700">Members List</h3>
          <span className="text-sm text-gray-500">Total: {members.length} members</span>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-gray-600">Name</th>
              <th className="px-6 py-3 text-gray-600">Role</th>
              <th className="px-6 py-3 text-gray-600">Details</th>
              <th className="px-6 py-3 text-gray-600">Contact</th>
              <th className="px-6 py-3 text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && !members.length ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
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
                    {m.staffType !== 'N/A' && (
                      <span className="ml-1 text-xs text-gray-500">({m.staffType})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {m.details || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {m.phone || m.email || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewDetails(m)}
                      className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 mr-1 text-xs transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(m)}
                      className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 mr-1 text-xs transition-colors"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(m._id || m.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors"
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