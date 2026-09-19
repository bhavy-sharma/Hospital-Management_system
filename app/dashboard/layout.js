'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Pill,
  Wallet,
  LogOut,
  Menu,
  X,
  Activity,
  CalendarDays,
  HeartPulse,
  ChevronRight,
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const storedUser = localStorage.getItem('user');
    
    if (!auth) {
      router.push('/login');
    } else {
      setIsAuth(true);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error('Failed to parse user');
        }
      }
    }
  }, [router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (!isAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Members', href: '/dashboard/members', icon: Users },
    { name: 'Pharmacy', href: '/dashboard/medicines', icon: Pill },
    { name: 'Expenses', href: '/dashboard/expense', icon: Wallet },
  ];

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Sidebar Content Component (Reusable)
  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Hospital<span className="text-blue-600">MS</span>
            </h1>
            <p className="text-xs text-gray-500 leading-tight">Management Panel</p>
          </div>
        </Link>
        {/* Close button (mobile only) */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Menu
        </p>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {active && (
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-gray-100 p-3">
        {/* User Info */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-800 truncate">Admin</p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email || 'admin@gmail.com'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ===== Desktop Sidebar (Always visible on lg+) ===== */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-md fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* ===== Mobile Sidebar (Slide-in from left) ===== */}
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Mobile Sidebar Panel */}
        <aside
          className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 flex flex-col lg:hidden transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarContent />
        </aside>
      </>

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        {/* Top Bar (Mobile Only) */}
        <header className="lg:hidden sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-gray-800">
                Hospital<span className="text-blue-600">MS</span>
              </span>
            </Link>

            {/* User Avatar */}
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}