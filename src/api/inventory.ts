import api from './axios';

export type MedicineType = 'LIQUID' | 'TABLETS';
export type DosageType = 'MG' | 'ML' | 'MCG' | 'TABLET' | 'SYRUP';

export interface MedicineRequest {
    medicineName: string;
    shortDescription: string;
    quantity: number;
    medicineType: MedicineType;
    dosage: string;
    dosageType: DosageType;
}

export interface MedicineResponse {
    id: number;
    medicineName: string;
    shortDescription: string;
    quantity: number;
    medicineType: MedicineType;
    dosage: string;
    dosageType: DosageType;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
}

export const getAllMedicines = async (): Promise<MedicineResponse[]> => {
    const response = await api.get<MedicineResponse[]>('/api/medicines');
    return response.data;
};

export const addMedicine = async (request: MedicineRequest, file: File): Promise<MedicineResponse> => {
    const formData = new FormData();
    // Providing a filename ('request.json') alongside the JSON content ensures 
    // that Spring Boot's MultipartResolver can correctly identify and deserialize this part.
    const requestFile = new File([JSON.stringify(request)], 'request.json', { type: 'application/json' });
    formData.append('request', requestFile);
    formData.append('file', file);

    const response = await api.post<MedicineResponse>('/api/medicines', formData);
    return response.data;
};

export const updateMedicine = async (id: number, request: MedicineRequest, file?: File): Promise<MedicineResponse> => {
    const formData = new FormData();
    const requestFile = new File([JSON.stringify(request)], 'request.json', { type: 'application/json' });
    formData.append('request', requestFile);
    
    if (file) {
        formData.append('file', file);
    }

    const response = await api.put<MedicineResponse>(`/api/medicines/${id}`, formData);
    return response.data;
};

export const deleteMedicine = async (id: number): Promise<void> => {
    await api.delete(`/api/medicines/${id}`);
};
