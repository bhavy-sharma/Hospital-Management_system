'use client';
import { useState, useEffect } from 'react';

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({ name: '', role: 'Doctor', staffType: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('hospital_members');
    if (stored) setMembers(JSON.parse(stored));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newMember = { id: Date.now(), name: formData.name, role: formData.role, staffType: formData.role === 'Staff' ? formData.staffType : 'N/A' };
    const updated = [...members, newMember];
    setMembers(updated);
    localStorage.setItem('hospital_members', JSON.stringify(updated));
    setFormData({ name: '', role: 'Doctor', staffType: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Members</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          {showForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-lg">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" required className="w-full text-black px-3 py-2 border rounded-md" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full text-black px-3 py-2 border rounded-md" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value, staffType: '' })}>
              <option value="Doctor">Doctor</option>
              <option value="Patient">Patient</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
          {formData.role === 'Staff' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Type</label>
              <select required className="w-full px-3 py-2 border rounded-md" value={formData.staffType} onChange={(e) => setFormData({ ...formData, staffType: e.target.value })}>
                <option value="">Select Staff Type</option>
                <option value="Nurse">Nurse</option>
                <option value="Compounder">Compounder</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}
          <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save Member</button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr><th className="px-6 py-3 text-gray-600">Name</th><th className="px-6 py-3 text-gray-600">Role</th><th className="px-6 py-3 text-gray-600">Details</th></tr>
          </thead>
          <tbody>
            {members.length === 0 ? <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No members added yet.</td></tr> : 
              members.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="px-6 py-4">{m.name}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${m.role === 'Doctor' ? 'bg-blue-100 text-blue-800' : m.role === 'Patient' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{m.role}</span></td>
                  <td className="px-6 py-4 text-gray-600">{m.staffType !== 'N/A' ? m.staffType : '-'}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}