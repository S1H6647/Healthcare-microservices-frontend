import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth';
import {
  User,
  Calendar,
  LogOut,
  Users,
  ShieldCheck,
  Pill,
  LayoutDashboard,
  FlaskConical,
  FileText
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const { role, email, firstName, lastName } = useAuthStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const getNavLinks = () => {
    const baseClasses = "group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200";
    const activeClasses = "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20";
    const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";

    const links = [];
    switch (role) {
      case 'PATIENT':
        links.push(
          { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'Profile', path: '/patient/profile', icon: User },
          { name: 'Appointments', path: '/patient/appointments', icon: Calendar },
          { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
        );
        break;
      case 'DOCTOR':
        links.push(
          { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Profile', path: '/doctor/profile', icon: User },
          { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'Prescriptions', path: '/doctor/prescriptions', icon: Pill },
        );
        break;
      case 'ADMIN':
        links.push(
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Profile', path: '/admin/profile', icon: User },
          { name: 'Patients', path: '/admin/patients', icon: Users },
          { name: 'Doctors', path: '/admin/doctors', icon: Users },
          { name: 'Receptionists', path: '/admin/receptionists', icon: Users },
          { name: 'Pharmacists', path: '/admin/pharmacists', icon: FlaskConical },
          { name: 'Appointments', path: '/admin/appointments', icon: Calendar },
          { name: 'Medicines', path: '/pharmacist/medicines', icon: Pill },
        );
        break;
      case 'RECEPTIONIST':
        links.push(
          { name: 'Dashboard', path: '/receptionist/dashboard', icon: LayoutDashboard },
          { name: 'Appointments', path: '/receptionist/appointments', icon: Calendar },
          { name: 'Profile', path: '/receptionist/profile', icon: User },
        );
        break;
      case 'PHARMACIST':
        links.push(
          { name: 'Dashboard', path: '/pharmacist/dashboard', icon: LayoutDashboard },
          { name: 'Prescriptions', path: '/pharmacist/prescriptions', icon: FileText },
          { name: 'Medicines', path: '/pharmacist/medicines', icon: Pill },
          { name: 'Profile', path: '/pharmacist/profile', icon: User },
        );
        break;
    }

    return (
      <nav className="mt-5 flex-1 px-2 space-y-2">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
              <link.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-500'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="bg-gradient-to-br from-primary to-blue-700 p-2 rounded-xl shadow-lg shadow-primary/30">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-black text-gray-900 tracking-tight">HealthSync</span>
          </div>

          {getNavLinks()}

          <div className="mt-auto px-4 py-4 border-t border-gray-100">
            <div className="flex items-center group">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {firstName?.[0]}{lastName?.[0]}
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                  {firstName} {lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto scroll-smooth">
        {/* Top bar (Mobile) */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
          {/* Mobile Header could be expanded here */}
          <span className="font-bold">HealthSync</span>
          <button onClick={handleLogout} className="text-red-600 p-2"><LogOut className="h-6 w-6" /></button>
        </div>

        {/* Hero Header Area */}
        <div className="bg-white border-b border-gray-100 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 opacity-[0.03] pointer-events-none rotate-12">
            <ShieldCheck className="w-96 h-96 text-primary" />
          </div>

          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"></div>

          <div className="max-w-[1600px] mx-auto px-4 py-16 sm:px-6 lg:px-8 relative">
            <div className="flex items-center space-x-3 text-primary text-xs font-black tracking-[0.2em] uppercase mb-4">
              <div className="h-1 w-6 bg-gradient-to-r from-primary to-blue-400 rounded-full"></div>
              <span>{role?.replace('_', ' ')} PORTAL</span>
            </div>

            <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-6xl mb-6">
              {title}
            </h1>

            {subtitle && (
              <p className="text-lg text-gray-500 max-w-3xl leading-relaxed font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <main className="max-w-[1600px] mx-auto py-8 pb-16 px-4 sm:px-6 lg:px-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}