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
    // Doctor fields
    specialization: '',
    experience: '',
    qualification: '',
    // Patient fields
    disease: '',
    bloodGroup: '',
    age: '',
    gender: '',
    // Staff fields
    staffType: '',
    // Common fields
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
      
      // Prepare data based on role
      const submitData = {
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        details: formData.details
      };

      // Add role-specific fields
      if (formData.role === 'Doctor') {
        submitData.specialization = formData.specialization;
        submitData.experience = formData.experience;
        submitData.qualification = formData.qualification;
        submitData.staffType = 'N/A';
        submitData.disease = 'N/A';
        submitData.bloodGroup = 'N/A';
        submitData.age = 'N/A';
        submitData.gender = 'N/A';
      } else if (formData.role === 'Patient') {
        submitData.disease = formData.disease;
        submitData.bloodGroup = formData.bloodGroup;
        submitData.age = formData.age;
        submitData.gender = formData.gender;
        submitData.staffType = 'N/A';
        submitData.specialization = 'N/A';
        submitData.experience = 'N/A';
        submitData.qualification = 'N/A';
      } else if (formData.role === 'Staff') {
        submitData.staffType = formData.staffType;
        submitData.specialization = 'N/A';
        submitData.experience = 'N/A';
        submitData.qualification = 'N/A';
        submitData.disease = 'N/A';
        submitData.bloodGroup = 'N/A';
        submitData.age = 'N/A';
        submitData.gender = 'N/A';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
      specialization: member.specialization && member.specialization !== 'N/A' ? member.specialization : '',
      experience: member.experience && member.experience !== 'N/A' ? member.experience : '',
      qualification: member.qualification && member.qualification !== 'N/A' ? member.qualification : '',
      disease: member.disease && member.disease !== 'N/A' ? member.disease : '',
      bloodGroup: member.bloodGroup && member.bloodGroup !== 'N/A' ? member.bloodGroup : '',
      age: member.age && member.age !== 'N/A' ? member.age : '',
      gender: member.gender && member.gender !== 'N/A' ? member.gender : '',
      staffType: member.staffType && member.staffType !== 'N/A' ? member.staffType : '',
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
      specialization: '',
      experience: '',
      qualification: '',
      disease: '',
      bloodGroup: '',
      age: '',
      gender: '',
      staffType: '',
      details: '',
      phone: '',
      email: '',
      address: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Get role-specific display info
  const getRoleDetails = (member) => {
    if (member.role === 'Doctor') {
      return member.specialization && member.specialization !== 'N/A' ? member.specialization : 'Not specified';
    } else if (member.role === 'Patient') {
      return member.disease && member.disease !== 'N/A' ? member.disease : 'Checkup';
    } else if (member.role === 'Staff') {
      return member.staffType && member.staffType !== 'N/A' ? member.staffType : 'Staff';
    }
    return '-';
  };

  // Get role-specific badge color
  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Doctor': return 'bg-blue-100 text-blue-800';
      case 'Patient': return 'bg-green-100 text-green-800';
      case 'Staff': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch(role) {
      case 'Doctor': return '👨‍⚕️';
      case 'Patient': return '🧑‍⚕️';
      case 'Staff': return '👨‍💼';
      default: return '👤';
    }
  };

  return (
    <div className="relative text-black">
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
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800">Member Details</h3>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Name</label>
                <p className="font-medium text-gray-800">{selectedMember.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Role</label>
                <span className={`px-2 py-1 inline-block rounded-full text-xs ${getRoleBadgeColor(selectedMember.role)}`}>
                  {getRoleIcon(selectedMember.role)} {selectedMember.role}
                </span>
              </div>
              
              {/* Doctor-specific fields */}
              {selectedMember.role === 'Doctor' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500">Specialization</label>
                    <p className="font-medium text-gray-800">{selectedMember.specialization && selectedMember.specialization !== 'N/A' ? selectedMember.specialization : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Experience</label>
                    <p className="font-medium text-gray-800">{selectedMember.experience && selectedMember.experience !== 'N/A' ? selectedMember.experience : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Qualification</label>
                    <p className="font-medium text-gray-800">{selectedMember.qualification && selectedMember.qualification !== 'N/A' ? selectedMember.qualification : 'Not specified'}</p>
                  </div>
                </>
              )}

              {/* Patient-specific fields */}
              {selectedMember.role === 'Patient' && (
                <>
                  <div>
                    <label className="text-xs text-gray-500">Disease/Condition</label>
                    <p className="font-medium text-gray-800">{selectedMember.disease && selectedMember.disease !== 'N/A' ? selectedMember.disease : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Blood Group</label>
                    <p className="font-medium text-gray-800">{selectedMember.bloodGroup && selectedMember.bloodGroup !== 'N/A' ? selectedMember.bloodGroup : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Age</label>
                    <p className="font-medium text-gray-800">{selectedMember.age && selectedMember.age !== 'N/A' ? selectedMember.age : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Gender</label>
                    <p className="font-medium text-gray-800">{selectedMember.gender && selectedMember.gender !== 'N/A' ? selectedMember.gender : 'Not specified'}</p>
                  </div>
                </>
              )}

              {/* Staff-specific fields */}
              {selectedMember.role === 'Staff' && (
                <div>
                  <label className="text-xs text-gray-500">Staff Type</label>
                  <p className="font-medium text-gray-800">{selectedMember.staffType && selectedMember.staffType !== 'N/A' ? selectedMember.staffType : 'Not specified'}</p>
                </div>
              )}

              {selectedMember.details && (
                <div>
                  <label className="text-xs text-gray-500">Additional Details</label>
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
          <option value="Doctor">👨‍⚕️ Doctor</option>
          <option value="Patient">🧑‍⚕️ Patient</option>
          <option value="Staff">👨‍💼 Staff</option>
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
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    role: e.target.value,
                    specialization: '',
                    disease: '',
                    staffType: ''
                  });
                }}
                disabled={loading}
              >
                <option value="Doctor">👨‍⚕️ Doctor</option>
                <option value="Patient">🧑‍⚕️ Patient</option>
                <option value="Staff">👨‍💼 Staff</option>
              </select>
            </div>
          </div>

          {/* Doctor-specific fields */}
          {formData.role === 'Doctor' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <select
                    required
                    className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">Select Specialization</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Endocrinologist">Endocrinologist</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                    <option value="Gastroenterologist">Gastroenterologist</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Gynecologist">Gynecologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                    <option value="Orthopedic">Orthopedic</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Psychiatrist">Psychiatrist</option>
                    <option value="Pulmonologist">Pulmonologist</option>
                    <option value="Radiologist">Radiologist</option>
                    <option value="Surgeon">Surgeon</option>
                    <option value="Urologist">Urologist</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <input 
                    type="text" 
                    className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={formData.experience} 
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="e.g., 5 years"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                <input 
                  type="text" 
                  className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={formData.qualification} 
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g., MBBS, MD"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Patient-specific fields */}
          {formData.role === 'Patient' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disease/Condition</label>
                  <input 
                    type="text" 
                    className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={formData.disease} 
                    onChange={(e) => setFormData({ ...formData, disease: e.target.value })}
                    placeholder="e.g., Diabetes, Fever"
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select 
                    className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input 
                    type="number" 
                    className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={formData.age} 
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age in years"
                    disabled={loading}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select 
                    className="w-full text-black px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={loading}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Staff-specific fields */}
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
              placeholder="Enter any additional details"
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
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-gray-600">Name</th>
                <th className="px-6 py-3 text-gray-600">Role</th>
                <th className="px-6 py-3 text-gray-600 min-w-[200px]">Details</th>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(m.role)}`}>
                        {getRoleIcon(m.role)} {m.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {m.role === 'Doctor' && (
                          <div>
                            <span className="font-medium text-blue-600">Specialization:</span>
                            <span className="ml-1 text-gray-700">
                              {m.specialization && m.specialization !== 'N/A' ? m.specialization : 'Not specified'}
                            </span>
                            {m.experience && m.experience !== 'N/A' && (
                              <span className="ml-2 text-xs text-gray-500">({m.experience})</span>
                            )}
                            {m.qualification && m.qualification !== 'N/A' && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {m.qualification}
                              </div>
                            )}
                          </div>
                        )}
                        {m.role === 'Patient' && (
                          <div>
                            <span className="font-medium text-green-600">Condition:</span>
                            <span className="ml-1 text-gray-700">
                              {m.disease && m.disease !== 'N/A' ? m.disease : 'Checkup'}
                            </span>
                            {m.bloodGroup && m.bloodGroup !== 'N/A' && (
                              <span className="ml-2 text-xs text-gray-500">Blood: {m.bloodGroup}</span>
                            )}
                            {m.age && m.age !== 'N/A' && (
                              <span className="ml-2 text-xs text-gray-500">Age: {m.age}</span>
                            )}
                            {m.gender && m.gender !== 'N/A' && (
                              <span className="ml-2 text-xs text-gray-500">({m.gender})</span>
                            )}
                          </div>
                        )}
                        {m.role === 'Staff' && (
                          <div>
                            <span className="font-medium text-yellow-600">Type:</span>
                            <span className="ml-1 text-gray-700">
                              {m.staffType && m.staffType !== 'N/A' ? m.staffType : 'Staff'}
                            </span>
                          </div>
                        )}
                        {m.details && m.details !== 'N/A' && m.details !== '' && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            📝 {m.details}
                          </div>
                        )}
                        {/* Agar koi bhi info nahi hai toh "-" dikhao */}
                        {m.role === 'Doctor' && (!m.specialization || m.specialization === 'N/A') && !m.details && (
                          <span className="text-gray-400">-</span>
                        )}
                        {m.role === 'Patient' && (!m.disease || m.disease === 'N/A') && !m.details && (
                          <span className="text-gray-400">-</span>
                        )}
                        {m.role === 'Staff' && (!m.staffType || m.staffType === 'N/A') && !m.details && (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {m.phone || m.email ? (
                        <div>
                          {m.phone && <div className="text-xs">📞 {m.phone}</div>}
                          {m.email && <div className="text-xs text-gray-500 truncate max-w-[120px]">✉️ {m.email}</div>}
                        </div>
                      ) : (
                        '-'
                      )}
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
    </div>
  );
}