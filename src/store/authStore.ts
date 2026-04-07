import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'PHARMACIST' | 'RECEPTIONIST' | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  isAuthenticated: boolean;
  login: (token: string, role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'PHARMACIST' | 'RECEPTIONIST', email: string, firstName?: string, lastName?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      email: null,
      firstName: null,
      lastName: null,
      isAuthenticated: false,
      login: (token, role, email, firstName, lastName) => {
        set({
          token,
          role,
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({
          token: null,
          role: null,
          email: null,
          firstName: null,
          lastName: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);