import type { Appointment } from '../../types';
import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getAppointmentsByPatient, cancelAppointment } from '../../api/appointments';
import { getMyPatientProfile } from '../../api/patients';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import BookAppointmentModal from '../../components/common/BookAppointmentModal';
import AppointmentDetailsModal from '../../components/common/AppointmentDetailsModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import FilterBar from '../../components/common/FilterBar';
import { UserRound, Calendar, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchAppointments = async (id: number) => {
    const data = await getAppointmentsByPatient(id);
    const sortedData = data.sort((a, b) => b.id - a.id);
    setAppointments(sortedData);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    try {
      setIsCancelling(true);
      await cancelAppointment(appointmentToCancel);
      if (patientId) await fetchAppointments(patientId);
      setIsCancelModalOpen(false);
      setAppointmentToCancel(null);
    } catch (error) {
      console.error('Error canceling appointment:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMyPatientProfile();
        setPatientId(me.id);
        await fetchAppointments(me.id);
      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-pending';
    }
  };

  if (isLoading) {
    return (
      <Layout title="My Appointments">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout
      title="My Appointments"
      subtitle="Track your upcoming consultations and review medical history."
    >
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Your Queue</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Consultation History</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              <FilterBar 
                searchTerm={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                statuses={[
                  { label: 'All View', value: 'ALL' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Confirmed', value: 'CONFIRMED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                  { label: 'Completed', value: 'COMPLETED' },
                ]}
                placeholder="Search history..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Provider</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Schedule</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Record Review</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {appointments
                .filter(apt => {
                  const matchesSearch = apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                       apt.specialization.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((appointment: Appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mr-4">
                          <UserRound className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{appointment.doctorName}</div>
                          <div className="text-xs text-gray-400 font-medium uppercase tracking-widest leading-none mt-1">{appointment.specialization}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mr-4">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`status-badge !px-4 !py-1.5 !font-black !uppercase !tracking-widest !text-[10px] shadow-sm ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                       <div className="flex justify-end space-x-3">
                        <Button
                          variant="ghost"
                          onClick={() => setSelectedAppointment(appointment)}
                          className="h-10 px-6 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 hover:border-primary hover:bg-primary/5 rounded-xl transition-all active:scale-95"
                        >
                          View Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <div className="text-center py-20 bg-gray-50/30">
               <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-bold italic">No medical records found in your queue.</p>
            </div>
          )}
        </div>
      </div>

      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        patientId={patientId ?? 0}
        onSuccess={() => patientId && fetchAppointments(patientId)}
      />

      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        userRole="PATIENT"
      />

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelAppointment}
        title="Finalize Cancellation?"
        description="Are you sure you want to cancel this appointment? This action will notify your physician and cannot be undone."
        confirmText="Yes, Cancel Now"
        variant="destructive"
        isLoading={isCancelling}
      />
    </Layout>
  );
}