'use client';
import { useState, useEffect } from 'react';

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [formData, setFormData] = useState({ name: '', mg: '', quantity: '' });
  const [outData, setOutData] = useState({ medicineId: '', quantity: '' });

  useEffect(() => {
    const stored = localStorage.getItem('hospital_medicines');
    if (stored) setMedicines(JSON.parse(stored));
  }, []);

  const handleAdd = (e) => {
    e.preventDefault();
    const newMed = { id: Date.now(), name: formData.name, mg: formData.mg, quantity: parseInt(formData.quantity) };
    const updated = [...medicines, newMed];
    setMedicines(updated);
    localStorage.setItem('hospital_medicines', JSON.stringify(updated));
    setFormData({ name: '', mg: '', quantity: '' });
  };

  const handleOut = (e) => {
    e.preventDefault();
    const updated = medicines.map(med => {
      if (med.id.toString() === outData.medicineId) {
        const newQty = med.quantity - parseInt(outData.quantity);
        return { ...med, quantity: newQty >= 0 ? newQty : 0 };
      }
      return med;
    });
    setMedicines(updated);
    localStorage.setItem('hospital_medicines', JSON.stringify(updated));
    setOutData({ medicineId: '', quantity: '' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Medicine Inventory</h2>
      <div className="flex space-x-4 mb-6">
        <button onClick={() => setActiveTab('add')} className={`px-4 py-2 rounded-md ${activeTab === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Add Medicine</button>
        <button onClick={() => setActiveTab('out')} className={`px-4 py-2 rounded-md ${activeTab === 'out' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Out Medicine</button>
      </div>

      {activeTab === 'add' ? (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label><input type="text" required className="w-full text-black px-3 py-2 border rounded-md" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">MG (e.g., 500)</label><input type="text" required className="w-full px-3 py-2 text-black border rounded-md" value={formData.mg} onChange={(e) => setFormData({ ...formData, mg: e.target.value })} /></div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label><input type="number" required className="w-full px-3 py-2 text-black border rounded-md" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} /></div>
          <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add to Stock</button>
        </form>
      ) : (
        <form onSubmit={handleOut} className="bg-white p-6 rounded-lg shadow-md max-w-lg mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Medicine</label>
            <select required className="w-full px-3 text-black py-2 border rounded-md" value={outData.medicineId} onChange={(e) => setOutData({ ...outData, medicineId: e.target.value })}>
              <option value="">Choose Medicine</option>
              {medicines.map(med => (<option key={med.id} value={med.id}>{med.name} ({med.mg}mg) - Stock: {med.quantity}</option>))}
            </select>
          </div>
          <div className="mb-4"><label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Out</label><input type="number" required min="1" className="w-full px-3 py-2 text-black border rounded-md" value={outData.quantity} onChange={(e) => setOutData({ ...outData, quantity: e.target.value })} /></div>
          <button type="submit" className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Dispense Medicine</button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100"><tr><th className="px-6 py-3 text-gray-600">Medicine Name</th><th className="px-6 py-3 text-gray-600">MG</th><th className="px-6 py-3 text-gray-600">Current Stock</th></tr></thead>
          <tbody>
            {medicines.length === 0 ? <tr><td colSpan="3" className="px-6 py-4 text-center text-gray-500">No medicines in stock.</td></tr> : 
              medicines.map((med) => (<tr key={med.id} className="border-t"><td className="px-6 py-4">{med.name}</td><td className="px-6 py-4">{med.mg} mg</td><td className={`px-6 py-4 font-semibold ${med.quantity < 10 ? 'text-red-600' : 'text-green-600'}`}>{med.quantity}</td></tr>))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}