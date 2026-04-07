import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { getAllAppointments, cancelAppointment } from '../../api/appointments';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';
import { formatTime } from '../../utils/formatTime';
import { ArrowRight, Calendar, User, UserRound, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import type { Appointment } from '../../types';
import AppointmentDetailsModal from '../../components/common/AppointmentDetailsModal';
import FilterBar from '../../components/common/FilterBar';

export default function ReceptionistAppointments() {
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchAppointments = async (page: number = 0) => {
    try {
      setIsLoading(true);
      const response = await getAllAppointments(page, pageSize);
      setAppointments(response?.content || []);
      setTotalPages(response?.totalPages || 0);
      setCurrentPage(response?.number || 0);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleCancelByReceptionist = async () => {
    if (!cancelModal.id) return;
    try {
      setIsCancelling(true);
      await cancelAppointment(cancelModal.id);
      toast.success('Appointment cancelled successfully');
      setCancelModal({ isOpen: false, id: null });
      fetchAppointments();
    } catch (error) {
      toast.error('Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <Layout title="Manage Appointments"><LoadingSpinner /></Layout>;
  }

  const filteredAppointments = (appointments || []).filter(apt => {
    const matchesSearch = 
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'CANCELLED': return 'status-cancelled';
      case 'COMPLETED': return 'status-completed';
      default: return 'status-pending';
    }
  };

  return (
    <Layout
      title="Manage Appointments"
      subtitle="Comprehensive control for scheduling and index management."
    >
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Universal Queue</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Live Consultation Schedule</p>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
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
                placeholder="Queue Search (Name, Doc, ID)..."
              />
              <Button
                onClick={() => navigate('/receptionist/book-appointment')}
                className="h-14 px-8 rounded-3xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
              >
                Book New Consultation <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Cluster</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Provider</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Schedule</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operations</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-gray-50 rounded-full">
                        <Filter className="h-8 w-8 text-gray-200" />
                      </div>
                      <p className="text-gray-300 font-medium italic">No appointments match your search criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt: Appointment) => (
                  <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mr-4">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{apt.patientName}</div>
                          <div className="text-xs text-gray-400 font-medium">{apt.patientEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 mr-4">
                          <UserRound className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-bold text-gray-900">{apt.doctorName}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 mr-4">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-bold text-gray-900">
                          {formatDate(apt.appointmentDate)} @ {formatTime(apt.startTime)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`status-badge !px-4 !py-1.5 !font-black !uppercase !tracking-widest !text-[10px] shadow-sm ${getStatusBadgeClass(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm space-x-2">
                       <Button
                        variant="ghost"
                        onClick={() => handleViewDetails(apt)}
                        className="text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-4 transition-all active:scale-95"
                      >
                        Details
                      </Button>
                      {apt.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          onClick={() => setCancelModal({ isOpen: true, id: apt.id })}
                          className="text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-4 transition-all active:scale-95"
                        >
                          Cancel
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-10 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-10 px-6 rounded-xl border-gray-200 text-gray-600 font-black uppercase tracking-widest text-[10px] disabled:opacity-50 transition-all active:scale-95 hover:bg-white"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={currentPage === totalPages - 1}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-10 px-6 rounded-xl border-gray-200 text-gray-600 font-black uppercase tracking-widest text-[10px] disabled:opacity-50 transition-all active:scale-95 hover:bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <AppointmentDetailsModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedAppointment}
        userRole="RECEPTIONIST"
      />

      <ConfirmationModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, id: null })}
        onConfirm={handleCancelByReceptionist}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel Appointment"
        variant="destructive"
        isLoading={isCancelling}
      />
    </Layout>
  );
}
