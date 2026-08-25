'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, Pill, DollarSign, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (!auth) router.push('/login');
    else setIsAuth(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  if (!isAuth) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Add Members', href: '/dashboard/members', icon: Users },
    { name: 'Medicines', href: '/dashboard/medicines', icon: Pill },
    { name: 'Expense', href: '/dashboard/expense', icon: DollarSign },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">HMS Panel</h1>
        </div>
        <nav className="flex-1 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${isActive ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600' : ''}`}>
                <Icon className="w-5 h-5 mr-3" /> {item.name}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="flex items-center w-full px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-600 border-t">
          <LogOut className="w-5 h-5 mr-3" /> Logout
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}