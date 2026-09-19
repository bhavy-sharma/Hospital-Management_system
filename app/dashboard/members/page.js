'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  UserCircle,
  Stethoscope,
  Briefcase,
  FileText,
  GraduationCap,
  Award,
  Droplet,
  Calendar,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import ConfirmationModal from '../../components/ConfirmationModal';
import Toast from '../../components/Toast';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
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
    address: '',
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });
  const [selectedMember, setSelectedMember] = useState(null);
  const router = useRouter();

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
    setSubmitting(true);

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/members/${editingId}` : '/api/members';

      const submitData = {
        name: formData.name,
        role: formData.role,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        details: formData.details,
      };

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          editingId ? 'Member updated successfully!' : 'Member added successfully!'
        );
        await fetchMembers();
        resetForm();
      } else {
        showToast(data.message || 'Failed to save member', 'error');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      showToast('Network error. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      role: member.role,
      specialization:
        member.specialization && member.specialization !== 'N/A'
          ? member.specialization
          : '',
      experience:
        member.experience && member.experience !== 'N/A'
          ? member.experience
          : '',
      qualification:
        member.qualification && member.qualification !== 'N/A'
          ? member.qualification
          : '',
      disease: member.disease && member.disease !== 'N/A' ? member.disease : '',
      bloodGroup:
        member.bloodGroup && member.bloodGroup !== 'N/A' ? member.bloodGroup : '',
      age: member.age && member.age !== 'N/A' ? member.age : '',
      gender: member.gender && member.gender !== 'N/A' ? member.gender : '',
      staffType:
        member.staffType && member.staffType !== 'N/A' ? member.staffType : '',
      details: member.details || '',
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || '',
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
      address: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Doctor':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Patient':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Staff':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleGradient = (role) => {
    switch (role) {
      case 'Doctor':
        return 'from-blue-500 to-blue-600';
      case 'Patient':
        return 'from-green-500 to-green-600';
      case 'Staff':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Doctor':
        return Stethoscope;
      case 'Patient':
        return UserCircle;
      case 'Staff':
        return Briefcase;
      default:
        return Users;
    }
  };

  const roleCounts = {
    Doctor: members.filter((m) => m.role === 'Doctor').length,
    Patient: members.filter((m) => m.role === 'Patient').length,
    Staff: members.filter((m) => m.role === 'Staff').length,
  };

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
        title="Delete Member"
        message="Are you sure you want to delete this member? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* ===== Member Details Modal ===== */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with gradient */}
            <div
              className={`bg-gradient-to-r ${getRoleGradient(
                selectedMember.role
              )} p-6 text-white relative`}
            >
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedMember.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                  <p className="text-white/80 text-sm">{selectedMember.role}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Doctor fields */}
              {selectedMember.role === 'Doctor' && (
                <>
                  <DetailRow
                    icon={Stethoscope}
                    label="Specialization"
                    value={selectedMember.specialization}
                  />
                  <DetailRow
                    icon={Award}
                    label="Experience"
                    value={selectedMember.experience}
                  />
                  <DetailRow
                    icon={GraduationCap}
                    label="Qualification"
                    value={selectedMember.qualification}
                  />
                </>
              )}

              {/* Patient fields */}
              {selectedMember.role === 'Patient' && (
                <>
                  <DetailRow
                    icon={FileText}
                    label="Condition"
                    value={selectedMember.disease}
                  />
                  <DetailRow
                    icon={Droplet}
                    label="Blood Group"
                    value={selectedMember.bloodGroup}
                  />
                  <DetailRow
                    icon={Calendar}
                    label="Age"
                    value={selectedMember.age}
                  />
                  <DetailRow
                    icon={UserCircle}
                    label="Gender"
                    value={selectedMember.gender}
                  />
                </>
              )}

              {/* Staff fields */}
              {selectedMember.role === 'Staff' && (
                <DetailRow
                  icon={Briefcase}
                  label="Staff Type"
                  value={selectedMember.staffType}
                />
              )}

              {/* Common fields */}
              {selectedMember.details && (
                <DetailRow
                  icon={FileText}
                  label="Details"
                  value={selectedMember.details}
                />
              )}
              {selectedMember.phone && (
                <DetailRow
                  icon={Phone}
                  label="Phone"
                  value={selectedMember.phone}
                />
              )}
              {selectedMember.email && (
                <DetailRow
                  icon={Mail}
                  label="Email"
                  value={selectedMember.email}
                />
              )}
              {selectedMember.address && (
                <DetailRow
                  icon={MapPin}
                  label="Address"
                  value={selectedMember.address}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t">
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Header ===== */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Members Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage doctors, patients, and staff members
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md ${
            showForm
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Add Member
            </>
          )}
        </button>
      </div>

      {/* ===== Stats Cards ===== */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope className="w-4 h-4 opacity-90" />
            <p className="text-xs sm:text-sm opacity-90 font-medium">Doctors</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{roleCounts.Doctor}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle className="w-4 h-4 opacity-90" />
            <p className="text-xs sm:text-sm opacity-90 font-medium">Patients</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{roleCounts.Patient}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-xl shadow-md text-white">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="w-4 h-4 opacity-90" />
            <p className="text-xs sm:text-sm opacity-90 font-medium">Staff</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold">{roleCounts.Staff}</p>
        </div>
      </div>

      {/* ===== Search & Filter ===== */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, specialization, disease..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="All">All Roles</option>
            <option value="Doctor">Doctors</option>
            <option value="Patient">Patients</option>
            <option value="Staff">Staff</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ===== Add/Edit Form ===== */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 animate-slide-up">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              {editingId ? (
                <>
                  <Pencil className="w-5 h-5 text-blue-600" />
                  Edit Member
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-green-600" />
                  Add New Member
                </>
              )}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection - Pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Doctor', icon: Stethoscope, color: 'blue' },
                  { value: 'Patient', icon: UserCircle, color: 'green' },
                  { value: 'Staff', icon: Briefcase, color: 'yellow' },
                ].map(({ value, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        role: value,
                        specialization: '',
                        disease: '',
                        staffType: '',
                      })
                    }
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                      formData.role === value
                        ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                    style={
                      formData.role === value
                        ? {
                            borderColor:
                              value === 'Doctor'
                                ? '#3B82F6'
                                : value === 'Patient'
                                ? '#10B981'
                                : '#F59E0B',
                            backgroundColor:
                              value === 'Doctor'
                                ? '#EFF6FF'
                                : value === 'Patient'
                                ? '#ECFDF5'
                                : '#FFFBEB',
                            color:
                              value === 'Doctor'
                                ? '#1D4ED8'
                                : value === 'Patient'
                                ? '#047857'
                                : '#B45309',
                          }
                        : {}
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs sm:text-sm font-medium">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter full name"
                disabled={submitting}
              />
            </div>

            {/* Doctor Fields */}
            {formData.role === 'Doctor' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Specialization *
                  </label>
                  <select
                    required
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({ ...formData, specialization: e.target.value })
                    }
                    disabled={submitting}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Experience
                  </label>
                  <input
                    type="text"
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.experience}
                    onChange={(e) =>
                      setFormData({ ...formData, experience: e.target.value })
                    }
                    placeholder="e.g., 5 years"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Qualification
                  </label>
                  <input
                    type="text"
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({ ...formData, qualification: e.target.value })
                    }
                    placeholder="e.g., MBBS, MD"
                    disabled={submitting}
                  />
                </div>
              </div>
            )}

            {/* Patient Fields */}
            {formData.role === 'Patient' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Disease / Condition
                  </label>
                  <input
                    type="text"
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={formData.disease}
                    onChange={(e) =>
                      setFormData({ ...formData, disease: e.target.value })
                    }
                    placeholder="e.g., Diabetes, Fever"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Blood Group
                  </label>
                  <select
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    value={formData.bloodGroup}
                    onChange={(e) =>
                      setFormData({ ...formData, bloodGroup: e.target.value })
                    }
                    disabled={submitting}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Age
                  </label>
                  <input
                    type="number"
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    placeholder="Age in years"
                    disabled={submitting}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    disabled={submitting}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {/* Staff Fields */}
            {formData.role === 'Staff' && (
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Staff Type *
                </label>
                <select
                  required
                  className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
                  value={formData.staffType}
                  onChange={(e) =>
                    setFormData({ ...formData, staffType: e.target.value })
                  }
                  disabled={submitting}
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

            {/* Common Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    className="w-full text-black pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Phone number"
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    className="w-full text-black pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Email address"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Additional Details
              </label>
              <textarea
                className="w-full text-black px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                placeholder="Enter any additional information"
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  className="w-full text-black pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Full address"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  'Update Member'
                ) : (
                  'Save Member'
                )}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== Members List ===== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 bg-gray-50 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Members List
          </h3>
          <span className="text-xs sm:text-sm px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
            {members.length} total
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && !members.length ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading members...</p>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No members found
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Click "Add Member" to get started
                    </p>
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const RoleIcon = getRoleIcon(m.role);
                  return (
                    <tr
                      key={m._id || m.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${getRoleGradient(
                              m.role
                            )} rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm`}
                          >
                            {m.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{m.name}</p>
                            {m.details && (
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                                {m.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                            m.role
                          )}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {m.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm space-y-0.5">
                          {m.role === 'Doctor' && (
                            <>
                              <p className="text-gray-700 font-medium">
                                {m.specialization &&
                                m.specialization !== 'N/A'
                                  ? m.specialization
                                  : 'General Physician'}
                              </p>
                              {(m.experience || m.qualification) && (
                                <p className="text-xs text-gray-500">
                                  {m.experience && m.experience !== 'N/A'
                                    ? m.experience
                                    : ''}
                                  {m.experience &&
                                    m.experience !== 'N/A' &&
                                    m.qualification &&
                                    m.qualification !== 'N/A' &&
                                    ' • '}
                                  {m.qualification &&
                                    m.qualification !== 'N/A'
                                    ? m.qualification
                                    : ''}
                                </p>
                              )}
                            </>
                          )}
                          {m.role === 'Patient' && (
                            <>
                              <p className="text-gray-700 font-medium">
                                {m.disease && m.disease !== 'N/A'
                                  ? m.disease
                                  : 'General Checkup'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {m.age && m.age !== 'N/A' && `${m.age}y`}
                                {m.gender && m.gender !== 'N/A' && ` • ${m.gender}`}
                                {m.bloodGroup &&
                                  m.bloodGroup !== 'N/A' &&
                                  ` • ${m.bloodGroup}`}
                              </p>
                            </>
                          )}
                          {m.role === 'Staff' && (
                            <p className="text-gray-700 font-medium">
                              {m.staffType && m.staffType !== 'N/A'
                                ? m.staffType
                                : 'Staff Member'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs space-y-1">
                          {m.phone && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{m.phone}</span>
                            </div>
                          )}
                          {m.email && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="truncate max-w-[150px]">
                                {m.email}
                              </span>
                            </div>
                          )}
                          {!m.phone && !m.email && (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedMember(m)}
                            className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(m)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(m._id || m.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
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
          {loading && !members.length ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Loading members...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No members found</p>
            </div>
          ) : (
            members.map((m) => {
              const RoleIcon = getRoleIcon(m.role);
              return (
                <div key={m._id || m.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 bg-gradient-to-br ${getRoleGradient(
                          m.role
                        )} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
                      >
                        {m.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {m.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${getRoleBadgeColor(
                            m.role
                          )}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {m.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                    {m.role === 'Doctor' && (
                      <>
                        <p className="text-gray-700">
                          <span className="text-gray-500">Specialization: </span>
                          {m.specialization && m.specialization !== 'N/A'
                            ? m.specialization
                            : 'N/A'}
                        </p>
                        {m.experience && m.experience !== 'N/A' && (
                          <p className="text-gray-700">
                            <span className="text-gray-500">Experience: </span>
                            {m.experience}
                          </p>
                        )}
                      </>
                    )}
                    {m.role === 'Patient' && (
                      <>
                        <p className="text-gray-700">
                          <span className="text-gray-500">Condition: </span>
                          {m.disease && m.disease !== 'N/A' ? m.disease : 'N/A'}
                        </p>
                        {(m.age || m.bloodGroup) && (
                          <p className="text-gray-700">
                            <span className="text-gray-500">Info: </span>
                            {m.age && `${m.age}y`}
                            {m.gender && ` • ${m.gender}`}
                            {m.bloodGroup && ` • ${m.bloodGroup}`}
                          </p>
                        )}
                      </>
                    )}
                    {m.role === 'Staff' && (
                      <p className="text-gray-700">
                        <span className="text-gray-500">Type: </span>
                        {m.staffType && m.staffType !== 'N/A'
                          ? m.staffType
                          : 'N/A'}
                      </p>
                    )}
                    {m.phone && (
                      <p className="text-gray-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {m.phone}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedMember(m)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(m)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(m._id || m.id)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
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

// Helper Component
function DetailRow({ icon: Icon, label, value }) {
  if (!value || value === 'N/A') return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm text-gray-800 break-words">{value}</p>
      </div>
    </div>
  );
}