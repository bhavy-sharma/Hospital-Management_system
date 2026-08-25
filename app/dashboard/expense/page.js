'use client';
import { useState, useEffect } from 'react';

export default function ExpensePage() {
  const [expenses, setExpenses] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [formData, setFormData] = useState({ type: 'Maintenance', staffId: '', amount: '', description: '' });

  useEffect(() => {
    const storedExpenses = localStorage.getItem('hospital_expenses');
    if (storedExpenses) setExpenses(JSON.parse(storedExpenses));

    const storedMembers = localStorage.getItem('hospital_members');
    if (storedMembers) setStaffMembers(JSON.parse(storedMembers).filter(m => m.role === 'Staff'));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const staffName = formData.type === 'Salary' ? staffMembers.find(s => s.id.toString() === formData.staffId)?.name || 'Unknown' : 'N/A';

    const newExpense = { id: Date.now(), type: formData.type, staffName, amount: formData.amount, description: formData.description, date: new Date().toLocaleDateString() };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    localStorage.setItem('hospital_expenses', JSON.stringify(updated));
    setFormData({ type: 'Maintenance', staffId: '', amount: '', description: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Expense Management</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Expense Type</label>
          <select className="w-full text-black px-3 py-2 border rounded-md" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value, staffId: '' })}>
            <option value="Salary">Salary</option>
            <option value="Equipment">Equipment</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {formData.type === 'Salary' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Staff</label>
            <select required className="w-full text-black px-3 py-2 border rounded-md" value={formData.staffId} onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}>
              <option value="">Choose Staff Member</option>
              {staffMembers.map(staff => (<option key={staff.id} value={staff.id}>{staff.name} ({staff.staffType})</option>))}
            </select>
            {staffMembers.length === 0 && <p className="text-xs text-red-500 mt-1">No staff members found. Please add staff in "Add Members" tab.</p>}
          </div>
        )}

        <div className="mb-4"><label className="block text-black text-sm font-medium text-gray-700 mb-1">Amount (₹)</label><input type="number" required className="w-full text-black px-3 py-2 border rounded-md" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></div>
        <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea className="w-full text-black px-3 py-2 border rounded-md" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea></div>
        <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Expense</button>
      </form>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100"><tr><th className="px-6 py-3 text-gray-600">Date</th><th className="px-6 py-3 text-gray-600">Type</th><th className="px-6 py-3 text-gray-600">Staff/Details</th><th className="px-6 py-3 text-gray-600">Amount</th></tr></thead>
          <tbody>
            {expenses.length === 0 ? <tr><td colSpan="4" className="px-6 py-4 text-center text-gray-500">No expenses recorded yet.</td></tr> : 
              expenses.map((exp) => (
                <tr key={exp.id} className="border-t">
                  <td className="px-6 py-4">{exp.date}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs ${exp.type === 'Salary' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>{exp.type}</span></td>
                  <td className="px-6 py-4">{exp.type === 'Salary' ? exp.staffName : exp.description}</td>
                  <td className="px-6 py-4 font-semibold text-red-600">- ₹{exp.amount}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}