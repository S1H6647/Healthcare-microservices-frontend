import api from './axios';
import type { ReceptionistRequest, ReceptionistResponse } from '../types';

export const updateReceptionist = async (email: string, request: ReceptionistRequest): Promise<ReceptionistResponse> => {
  const response = await api.put('/api/receptionists', request, {
    headers: {
      'X-User-Email': email
    }
  });
  return response.data;
};

export const getAllReceptionists = async (): Promise<ReceptionistResponse[]> => {
  const response = await api.get('/api/receptionists');
  return response.data;
};

export const deleteReceptionist = async (id: number): Promise<void> => {
  await api.delete(`/api/receptionists/${id}`);
};

export const createReceptionistProfile = async (email: string, request: ReceptionistRequest): Promise<ReceptionistResponse> => {
  const response = await api.post('/api/receptionists/register', request, {
    headers: {
      'X-User-Email': email
    }
  });
  return response.data;
};

export const getReceptionistProfile = async (email: string): Promise<ReceptionistResponse> => {
  const response = await api.get('/api/receptionists/me', {
    headers: {
      'X-User-Email': email
    }
  });
  return response.data;
};
