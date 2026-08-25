'use client';
import { useEffect, useState } from 'react';
import { Users, Pill, UserCircle } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({ doctors: 5, patients: 120, medicines: 450 });

  useEffect(() => {
    const members = JSON.parse(localStorage.getItem('hospital_members') || '[]');
    const medicines = JSON.parse(localStorage.getItem('hospital_medicines') || '[]');
    
    setStats({
      doctors: members.filter(m => m.role === 'Doctor').length || 5,
      patients: members.filter(m => m.role === 'Patient').length || 120,
      medicines: medicines.reduce((acc, curr) => acc + parseInt(curr.quantity || 0), 0) || 450
    });
  }, []);

  const cards = [
    { title: 'Total Doctors', value: stats.doctors, icon: UserCircle, color: 'bg-blue-500' },
    { title: 'Total Patients', value: stats.patients, icon: Users, color: 'bg-green-500' },
    { title: 'Total Medicine Stock', value: stats.medicines, icon: Pill, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-center">
              <div className={`p-4 rounded-full ${card.color} text-white mr-4`}><Icon className="w-8 h-8" /></div>
              <div>
                <p className="text-gray-500 text-sm">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}