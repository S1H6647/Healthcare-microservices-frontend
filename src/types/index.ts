// User and Auth types
export interface User {
  id: number;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'PHARMACIST' | 'RECEPTIONIST';
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'PHARMACIST' | 'RECEPTIONIST';
}

export interface LoginResponse {
  token: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'PHARMACIST' | 'RECEPTIONIST';
}

export interface RegisterResponse {
  email: string;
  name: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'PHARMACIST' | 'RECEPTIONIST';
}

// Receptionist types
export interface Receptionist {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceptionistRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  address: string;
}

export interface ReceptionistResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Pharmacist types
export interface Pharmacist {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacistRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone: string;
  licenseNumber: string;
}

export interface PharmacistResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Patient types
export interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: string;
  address: string;
  isProfileCompleted: boolean;
  createdAt: string; // datetime
}

// Doctor types
export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  availableDays: string; // e.g., "MONDAY,WEDNESDAY,FRIDAY"
  consultationFee: number;
  qualification: string;
  qualificationUrl: string;
  createdAt: string; // datetime
}

// Appointment types
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  patientName: string;
  patientEmail: string;
  doctorName: string;
  specialization: string;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  status: AppointmentStatus;
  notes: string;
  createdAt: string; // datetime
  updatedAt: string; // datetime
}

export interface BookAppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  notes: string;
}

// Prescription types
export interface PrescriptionItem {
  id: number;
  medicineId: number;       // References inventory-service medicine ID
  drugName: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  route: string;
  instructions: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number | null;
  patientName: string;
  doctorName: string;
  diagnosis: string;
  instruction: string;
  symptoms: string;
  visitDate: string;
  note: string;
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED';
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionRequest {
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  instruction: string;
  visitDate: string; // YYYY-MM-DD
  symptoms: string;
  diagnosis: string;
  note?: string;
  items: {
    medicineId: number;     // References inventory-service medicine ID
    drugName: string;
    dosage: string;
    frequency: string;
    durationDays: number;
    route: string;
  }[];
}

// Error response
export interface ErrorResponse {
  message: string;
  status: number;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}
