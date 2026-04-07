import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import { useState, useEffect } from 'react';
import { getDoctorById } from '../../api/doctors';
import type { Doctor, Appointment } from '../../types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
    Calendar,
    Clock,
    User,
    FileText,
    Fingerprint,
    ShieldCheck,
    Activity,
    Info,
    CheckCircle2
} from "lucide-react";

interface AppointmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment | null;
    userRole: 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'RECEPTIONIST';
}

export default function AppointmentDetailsModal({
    isOpen,
    onClose,
    appointment,
    userRole,
}: AppointmentDetailsModalProps) {
    const [doctorDetails, setDoctorDetails] = useState<Doctor | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (isOpen && appointment && userRole === 'PATIENT') {
                try {
                    const data = await getDoctorById(appointment.doctorId);
                    setDoctorDetails(data);
                } catch (error) {
                    console.error('Error fetching doctor details:', error);
                } finally {
                }
            } else {
                setDoctorDetails(null);
            }
        };

        fetchDetails();
    }, [isOpen, appointment, userRole]);

    if (!appointment) return null;

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'CONFIRMED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'CANCELLED': return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'COMPLETED': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-white">
                <DialogHeader className="px-12 py-10 border-b border-gray-100 bg-white relative">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                        <Activity className="w-64 h-64 text-primary" />
                    </div>

                    <div className="flex items-center space-x-2 text-primary mb-3">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Consultation</span>
                    </div>

                    <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight">
                        Consultation Details
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium text-base mt-2">
                        Record ID: <span className="text-primary font-bold">#{appointment.id}</span> • Clinical Reference
                    </DialogDescription>
                </DialogHeader>

                <div className="p-12 bg-gray-50/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        {/* Left Column: Profiles */}
                        <div className="space-y-6 flex flex-col">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <User className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                            {userRole === 'DOCTOR' ? 'Patient' : 'Practitioner'}
                                        </h4>
                                        <p className="text-xl font-black text-gray-900 leading-none">
                                            {userRole === 'DOCTOR' ? appointment.patientName : appointment.doctorName}
                                        </p>
                                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mt-1">
                                            {userRole === 'DOCTOR' ? appointment.patientEmail : appointment.specialization}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(appointment.status)}`}>
                                    {appointment.status.toLowerCase()}
                                </div>
                            </div>

                            {userRole === 'PATIENT' && doctorDetails && (
                                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 space-y-5 flex-1">
                                    <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                                        <div className="flex items-center space-x-3 text-primary">
                                            <CheckCircle2 className="w-5 h-5 opacity-70" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Practitioner Profile</span>
                                        </div>
                                        {doctorDetails.qualificationUrl && (
                                            <a
                                                href={doctorDetails.qualificationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                                            >
                                                Credentials
                                            </a>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-2">
                                        <div>
                                            <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5 font-bold">Qualification</h5>
                                            <p className="text-xs font-black text-gray-900 leading-normal">{doctorDetails.qualification}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5 font-bold">License ID</h5>
                                            <p className="text-xs font-black text-gray-900 tabular-nums">{doctorDetails.licenseNumber}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5 font-bold">Clinic Phone</h5>
                                            <p className="text-xs font-black text-gray-900 tabular-nums">{doctorDetails.phone}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1.5 font-bold">Fee (USD)</h5>
                                            <p className="text-xs font-black text-primary tabular-nums">${doctorDetails.consultationFee.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between px-6 py-4 bg-white rounded-[1.5rem] border border-gray-100 mt-auto">
                                <div className="flex items-center space-x-3">
                                    <Fingerprint className="w-5 h-5 text-primary opacity-30" />
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Record Created: {new Date(appointment.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-primary font-bold text-[9px] uppercase tracking-widest opacity-60">
                                    <Info className="w-4 h-4" />
                                    <span>SL-RECORD</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Appointment Body */}
                        <div className="space-y-6 flex flex-col">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                    <div className="flex items-center space-x-3 text-primary mb-3">
                                        <Calendar className="w-5 h-5 opacity-70" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Scheduled Date</span>
                                    </div>
                                    <p className="text-lg font-black text-gray-900">{formatDate(appointment.appointmentDate)}</p>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
                                    <div className="flex items-center space-x-3 text-primary mb-3">
                                        <Clock className="w-5 h-5 opacity-70" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Session Window</span>
                                    </div>
                                    <p className="text-lg font-black text-gray-900 leading-none">
                                        {formatTime(appointment.startTime)}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Ending @ {formatTime(appointment.endTime)}</p>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden flex-1 min-h-[16rem]">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
                                    <FileText className="w-24 h-24 text-primary" />
                                </div>
                                <div className="relative">
                                    <div className="flex items-center space-x-3 text-primary mb-4">
                                        <FileText className="w-5 h-5 opacity-70" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Physician's Clinical Notes</span>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-relaxed italic pr-12 text-justify">
                                        {appointment.notes || 'No detailed clinical notes provided for this specific consultation session.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-12 py-10 bg-white border-t border-gray-100 flex justify-end">
                    <Button
                        onClick={onClose}
                        className="h-12 px-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        Close Details
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
