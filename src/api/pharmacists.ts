import api from './axios';
import type { PharmacistRequest, PharmacistResponse } from '../types';

export const updatePharmacist = async (email: string, request: PharmacistRequest): Promise<PharmacistResponse> => {
  const response = await api.put('/api/pharmacists', request, {
    headers: {
      'X-User-Email': email
    }
  });
  return response.data;
};

export const getAllPharmacists = async (): Promise<PharmacistResponse[]> => {
  const response = await api.get('/api/pharmacists');
  return response.data;
};

export const deletePharmacist = async (id: number): Promise<void> => {
  await api.delete(`/api/pharmacists/${id}`);
};

export const createPharmacistProfile = async (email: string, request: PharmacistRequest): Promise<PharmacistResponse> => {
  const response = await api.post('/api/pharmacists/register', request, {
    headers: {
      'X-User-Email': email
    }
  });
  return response.data;
};

export const getPharmacistProfile = async (email: string): Promise<PharmacistResponse> => {
  const response = await api.get('/api/pharmacists/me', {
    headers: {
      'X-User-Email': email
    }
  });
  return response.data;
};
