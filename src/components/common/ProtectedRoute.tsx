import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  allowedRoles: ('PATIENT' | 'DOCTOR' | 'ADMIN' | 'PHARMACIST' | 'RECEPTIONIST')[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for zustand persist to rehydrate from localStorage
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // If already hydrated (e.g. not the first render), mark immediately
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsub();
    };
  }, []);

  // Show a loading state while the store is rehydrating
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && !allowedRoles.includes(role)) {
    switch (role as string) {
      case 'PATIENT':
        return <Navigate to="/patient/dashboard" replace />;
      case 'DOCTOR':
        return <Navigate to="/doctor/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'PHARMACIST':
        return <Navigate to="/pharmacist/dashboard" replace />;
      case 'RECEPTIONIST':
        return <Navigate to="/receptionist/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}