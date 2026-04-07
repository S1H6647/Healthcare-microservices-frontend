import type { Appointment } from '../../types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { getAppointmentsByDoctor, updateAppointmentStatus } from '../../api/appointments';
import { getMyDoctorProfile } from '../../api/doctors';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import AppointmentDetailsModal from '../../components/common/AppointmentDetailsModal';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Pill, Activity, User, Calendar } from 'lucide-react';
import FilterBar from '../../components/common/FilterBar';
import { Button } from '../../components/ui/button';

export default function DoctorAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ id: number; status: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAppointments = async (id: number) => {
    const data = await getAppointmentsByDoctor(id);
    const sortedData = data.sort((a, b) => b.id - a.id);
    setAppointments(sortedData);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMyDoctorProfile();
        setDoctorId(me.id);
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
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return 'status-pending';
    }
  };

  const handleStatusChange = async () => {
    if (!pendingAction) return;
    try {
      setIsUpdating(true);
      await updateAppointmentStatus(pendingAction.id, pendingAction.status);
      if (doctorId) await fetchAppointments(doctorId);
      setIsConfirmModalOpen(false);
      setIsCompleteModalOpen(false);
      setIsCancelModalOpen(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Layout
        title="My Appointments"
        subtitle="Complete list of scheduled patient consultations and status management."
      >
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout
      title="My Appointments"
      subtitle="Complete list of scheduled patient consultations and status management."
    >
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Consultation Queue</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Your Clinical Schedule</p>
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
                placeholder="Search patients..."
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Cluster</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Schedule</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Clinical Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {appointments
                .filter(apt => {
                  const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                       apt.patientEmail.toLowerCase().includes(searchQuery.toLowerCase());
                  const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
                  return matchesSearch && matchesStatus;
                })
                .map((appointment: any) => (
                  <tr key={appointment.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mr-4">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{appointment.patientName}</div>
                          <div className="text-xs text-gray-400 font-medium">{appointment.patientEmail}</div>
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
                    <td className="px-8 py-6 whitespace-nowrap text-right space-x-2">
                       {appointment.status === 'COMPLETED' && (
                        <Button
                          variant="ghost"
                          onClick={() => navigate('/doctor/prescriptions', { 
                            state: { 
                              selectedPatientId: appointment.patientId,
                              selectedAppointmentId: appointment.id,
                              patientName: appointment.patientName
                            } 
                          })}
                          className="h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 inline-flex items-center"
                        >
                          <Pill className="w-3.5 h-3.5 mr-2" />
                          Prescribe
                        </Button>
                      )}
                      {appointment.status === 'PENDING' && (
                        <>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setPendingAction({ id: appointment.id, status: 'CONFIRMED' });
                              setIsConfirmModalOpen(true);
                            }}
                            className="h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setPendingAction({ id: appointment.id, status: 'CANCELLED' });
                              setIsCancelModalOpen(true);
                            }}
                            className="h-10 px-4 text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-xl transition-all"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setPendingAction({ id: appointment.id, status: 'COMPLETED' });
                            setIsCompleteModalOpen(true);
                          }}
                          className="h-10 px-4 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedAppointment(appointment)}
                        className="h-10 px-5 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20 hover:border-primary hover:bg-primary/5 rounded-xl transition-all active:scale-95"
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {appointments.length === 0 && (
            <div className="text-center py-20 bg-gray-50/30">
               <Activity className="w-12 h-12 text-gray-200 mx-auto mb-4" />
               <p className="text-gray-400 font-bold italic">Clinical queue is currently empty.</p>
            </div>
          )}
        </div>
      </div>

      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        appointment={selectedAppointment}
        userRole="DOCTOR"
      />

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleStatusChange}
        title="Confirm Appointment"
        description="Are you sure you want to confirm this consultation? This will block the slot and notify the patient."
        confirmText="Confirm Session"
        variant="success"
        isLoading={isUpdating}
      />

      <ConfirmationModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        onConfirm={handleStatusChange}
        title="Mark as Completed?"
        description="Has the clinical consultation been successfully conducted? This will close the record."
        confirmText="Finalize Session"
        variant="info"
        isLoading={isUpdating}
      />

      <ConfirmationModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleStatusChange}
        title="Cancel Appointment?"
        description="This will permanently cancel the scheduled consultation. The patient will be notified immediately."
        confirmText="Yes, Cancel"
        variant="destructive"
        isLoading={isUpdating}
      />
    </Layout>
  );
}