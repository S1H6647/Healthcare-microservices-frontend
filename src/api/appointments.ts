import api from './axios';
import type { Appointment, BookAppointmentRequest, PaginatedResponse } from '../types';

export const getAllAppointments = async (page: number = 0, size: number = 10, sortBy: string = 'DESC'): Promise<PaginatedResponse<Appointment>> => {
  const response = await api.get<PaginatedResponse<Appointment>>(`/api/appointments?page=${page}&size=${size}&sortBy=${sortBy}`);
  return response.data;
};

export const getAppointmentById = async (id: number): Promise<Appointment> => {
  const response = await api.get(`/api/appointments/${id}`);
  return response.data;
};

export const getAppointmentsByPatient = async (patientId: number): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`/api/appointments/patient/${patientId}`);
  return response.data.sort((a, b) => b.id - a.id);
};

export const getAppointmentsByDoctor = async (doctorId: number): Promise<Appointment[]> => {
  const response = await api.get<Appointment[]>(`/api/appointments/doctor/${doctorId}`);
  return response.data.sort((a, b) => b.id - a.id);
};

export const bookAppointment = async (appointmentData: BookAppointmentRequest): Promise<Appointment> => {
  const response = await api.post('/api/appointments', appointmentData);
  return response.data;
};

export const updateAppointmentStatus = async (id: number, status: string): Promise<Appointment> => {
  const response = await api.patch(`/api/appointments/${id}/status?status=${status}`);
  return response.data;
};

export const cancelAppointment = async (id: number): Promise<void> => {
  await api.delete(`/api/appointments/${id}`);
};