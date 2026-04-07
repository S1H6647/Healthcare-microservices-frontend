import api from './axios';
import type { Prescription, CreatePrescriptionRequest } from '../types';

// Request sent to prescription-service /addMedicine endpoint
export interface MedicineItemRequest {
  medicineId: number;    // inventory-service medicine ID — this is how prescription-service knows which medicine
  drugName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  route: string;
  instructions?: string;
}

// Request sent to inventory-service /deduct endpoint
export interface DeductItem {
  medicineId: number;
  quantityToDeduct: number;
}

export const getAllPrescriptions = async (): Promise<Prescription[]> => {
  const response = await api.get<Prescription[]>('/api/prescriptions');
  return response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPrescriptionsByDoctor = async (doctorId: number): Promise<Prescription[]> => {
  const response = await api.get<Prescription[]>(`/api/prescriptions/doctor/${doctorId}`);
  return response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getPrescriptionsByPatient = async (patientId: number): Promise<Prescription[]> => {
  const response = await api.get<Prescription[]>(`/api/prescriptions/patient/${patientId}`);
  return response.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const createPrescription = async (request: CreatePrescriptionRequest): Promise<Prescription> => {
  const response = await api.post<Prescription>('/api/prescriptions', request);
  return response.data;
};

export const deletePrescription = async (id: number): Promise<void> => {
  await api.delete(`/api/prescriptions/${id}`);
};

export const updatePrescriptionStatus = async (id: number, status: 'PENDING' | 'DISPENSED' | 'CANCELLED'): Promise<Prescription> => {
  const response = await api.patch<Prescription>(`/api/prescriptions/${id}/status`, null, {
    params: { status }
  });
  return response.data;
};

/**
 * Called by doctor when adding a medicine to a prescription.
 * Sends medicineId (from inventory-service) alongside drug details.
 * prescription-service stores this medicineId for later deduction.
 */
export const addMedicineToPrescription = async (
  prescriptionId: number,
  item: MedicineItemRequest
): Promise<void> => {
  await api.post(`/api/prescriptions/${prescriptionId}/items`, item);
};

/**
 * Called by pharmacist when dispensing — deducts medicine quantities from inventory.
 * Sent BEFORE marking prescription as DISPENSED.
 */
export const deductMedicines = async (items: DeductItem[]): Promise<void> => {
  await api.post('/api/medicines/deduct', items);
};
