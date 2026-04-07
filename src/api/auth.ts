import api from './axios';
import type { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse, UpdatePasswordRequest } from '../types';

export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const updatePassword = async (email: string, request: UpdatePasswordRequest): Promise<void> => {
  await api.put('/api/auth/password', request, {
    headers: { 'X-User-Email': email }
  });
};

export const register = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const registerReceptionist = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post('/api/auth/receptionist/register', userData);
  return response.data;
};

export const registerDoctor = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post('/api/auth/doctor/register', userData);
  return response.data;
};

export const registerPharmacist = async (userData: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post('/api/auth/pharmacist/register', userData);
  return response.data;
};

export const logout = (): void => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};