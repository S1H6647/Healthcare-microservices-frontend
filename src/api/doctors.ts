import api from './axios';
import type { Doctor } from '../types';

export const getAllDoctors = async (): Promise<Doctor[]> => {
  const response = await api.get('/api/doctors');
  return response.data;
};

export const getMyDoctorProfile = async (): Promise<Doctor> => {
  const response = await api.get('/api/doctors/me');
  return response.data;
};

export const getDoctorsBySpecialization = async (specialization: string): Promise<Doctor[]> => {
  const response = await api.get(`/api/doctors?specialization=${specialization}`);
  return response.data;
};

export const getDoctorById = async (id: number): Promise<Doctor> => {
  const response = await api.get(`/api/doctors/${id}`);
  return response.data;
};

export const createDoctor = async (formData: FormData): Promise<Doctor> => {
  const response = await api.post('/api/doctors/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const updateDoctor = async (id: number, formData: FormData): Promise<Doctor> => {
  const response = await api.put(`/api/doctors/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteDoctor = async (id: number): Promise<void> => {
  await api.delete(`/api/doctors/${id}`);
};