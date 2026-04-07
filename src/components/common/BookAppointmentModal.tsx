import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { getAllDoctors } from '../../api/doctors';
import { bookAppointment } from '../../api/appointments';
import type { Doctor } from '../../types';

const bookingSchema = z.object({
    doctorId: z.string().min(1, 'Please select a doctor'),
    appointmentDate: z.string().min(1, 'Please select a date'),
    startTime: z.string().min(1, 'Please select a start time'),
    endTime: z.string().min(1, 'Please select an end time'),
    notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    patientId: number;
    onSuccess?: () => void;
}

export default function BookAppointmentModal({
    isOpen,
    onClose,
    patientId,
    onSuccess,
}: BookAppointmentModalProps) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isDoctorsLoading, setIsDoctorsLoading] = useState(true);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<BookingFormData>({
        resolver: zodResolver(bookingSchema),
    });

    useEffect(() => {
        if (isOpen) {
            const fetchDoctors = async () => {
                try {
                    setIsDoctorsLoading(true);
                    const data = await getAllDoctors();
                    setDoctors(data);
                } catch (error) {
                    console.error('Error fetching doctors:', error);
                    toast.error('Failed to load doctors');
                } finally {
                    setIsDoctorsLoading(false);
                }
            };
            fetchDoctors();
        }
    }, [isOpen]);

    const onSubmit = async (data: BookingFormData) => {
        try {
            setIsLoading(true);
            await bookAppointment({
                patientId,
                doctorId: parseInt(data.doctorId),
                appointmentDate: data.appointmentDate,
                startTime: data.startTime + ':00',
                endTime: data.endTime + ':00',
                notes: data.notes || '',
            });
            toast.success('Appointment booked successfully!');
            reset();
            onClose();
            onSuccess?.();
        } catch (error: any) {
            console.error('Booking error:', error);
            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to book appointment. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    // Get today's date in YYYY-MM-DD for min date
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Book Appointment
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Doctor Select */}
                        <div>
                            <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-1">
                                Select Doctor
                            </label>
                            {isDoctorsLoading ? (
                                <div className="text-sm text-gray-500">Loading doctors...</div>
                            ) : (
                                <select
                                    id="doctorId"
                                    {...register('doctorId')}
                                    className={`w-full px-3 py-2 border ${errors.doctorId ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
                                >
                                    <option value="">Choose a doctor...</option>
                                    {doctors.map((doctor) => (
                                        <option key={doctor.id} value={doctor.id}>
                                            Dr. {doctor.firstName} {doctor.lastName} — {doctor.specialization} (${doctor.consultationFee})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {errors.doctorId && (
                                <p className="mt-1 text-sm text-red-600">{errors.doctorId.message}</p>
                            )}
                        </div>

                        {/* Date */}
                        <div>
                            <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Appointment Date
                            </label>
                            <input
                                id="appointmentDate"
                                type="date"
                                min={today}
                                {...register('appointmentDate')}
                                className={`w-full px-3 py-2 border ${errors.appointmentDate ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
                            />
                            {errors.appointmentDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.appointmentDate.message}</p>
                            )}
                        </div>

                        {/* Time Range */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    Start Time
                                </label>
                                <input
                                    id="startTime"
                                    type="time"
                                    {...register('startTime')}
                                    className={`w-full px-3 py-2 border ${errors.startTime ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
                                />
                                {errors.startTime && (
                                    <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    End Time
                                </label>
                                <input
                                    id="endTime"
                                    type="time"
                                    {...register('endTime')}
                                    className={`w-full px-3 py-2 border ${errors.endTime ? 'border-red-300' : 'border-gray-300'
                                        } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm`}
                                />
                                {errors.endTime && (
                                    <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                Notes (optional)
                            </label>
                            <textarea
                                id="notes"
                                rows={3}
                                {...register('notes')}
                                placeholder="Describe your symptoms or reason for visit..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-2">
                            <button
                                type="button"
                                onClick={() => { reset(); onClose(); }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`px-4 py-2 border border-primary rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading ? 'Booking...' : 'Book Appointment'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
