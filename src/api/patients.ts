import api from './axios';
import type { Patient } from '../types';


export const getAllPatients = async (): Promise<Patient[]> => {
  const response = await api.get('/api/patients');
  return response.data;
};

export const getMyPatientProfile = async (): Promise<Patient> => {
  const response = await api.get('/api/patients/me');
  return response.data;
};

export const getPatientById = async (id: number): Promise<Patient> => {
  const response = await api.get(`/api/patients/${id}`);
  return response.data;
};

export const createPatient = async (patientData: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
  const response = await api.post('/api/patients/register', patientData);
  return response.data;
};

export const updatePatient = async (id: number, patientData: Partial<Patient>): Promise<Patient> => {
  const response = await api.put(`/api/patients/${id}`, patientData);
  return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
  await api.delete(`/api/patients/${id}`);
};