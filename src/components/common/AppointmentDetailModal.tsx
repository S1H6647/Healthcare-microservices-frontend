import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { Button } from '../ui/button';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import type { Appointment } from '../../types';
import { Calendar, User, UserRound, Clock, FileText, Activity } from 'lucide-react';

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
}

export default function AppointmentDetailModal({
  isOpen,
  onClose,
  appointment,
}: AppointmentDetailModalProps) {
  if (!appointment) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200';
      case 'COMPLETED':
        return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] p-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 p-24 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 p-20 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

        <DialogHeader className="relative">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-1 w-8 bg-primary rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Appointment Reference #{appointment.id}</span>
          </div>
          <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Consultation Details</DialogTitle>
          <DialogDescription className="text-gray-500 font-medium pt-1">
            Reviewing scheduled medical interaction details for scheduling and clinical oversight.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-8 space-y-8 relative">
          <div className="grid grid-cols-2 gap-8 sticky top-0">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Patient Details</p>
                  <p className="font-bold text-gray-900">{appointment.patientName}</p>
                  <p className="text-xs text-gray-500 font-medium">{appointment.patientEmail}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 p-2 bg-gray-50 rounded-lg text-gray-400">
                  <UserRound className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Assigned Doctor</p>
                  <p className="font-bold text-gray-900">{appointment.doctorName}</p>
                  <p className="text-xs text-gray-500 font-medium">{appointment.specialization}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100/50 text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Consultation Date</p>
                <p className="text-lg font-bold text-gray-900 leading-none mt-1">{formatDate(appointment.appointmentDate)}</p>
              </div>
            </div>
            <div className="h-10 w-px bg-gray-200"></div>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100/50 text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Time Window</p>
                <p className="text-lg font-bold text-gray-900 leading-none mt-1">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400 mb-1">
                <Activity className="w-3 h-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">Current Status</p>
              </div>
              <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest shadow-sm inline-block ${getStatusBadgeClass(appointment.status)}`}>
                {appointment.status}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400 mb-1">
                <Clock className="w-3 h-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">Modified At</p>
              </div>
              <p className="text-sm font-bold text-gray-700">{new Date(appointment.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {appointment.notes && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-400 mb-1">
                <FileText className="w-3 h-3" />
                <p className="text-[10px] font-black uppercase tracking-widest">Medical Notes / Context</p>
              </div>
              <div className="p-5 bg-white border border-gray-100 rounded-2xl">
                <p className="text-sm text-gray-600 leading-relaxed font-normal italic">
                   "{appointment.notes}"
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-10 sm:justify-start">
          <Button
            type="button"
            onClick={onClose}
            className="h-12 px-8 rounded-xl bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-gray-200"
          >
            Acknowledge & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
