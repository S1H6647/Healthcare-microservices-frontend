import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';
import { getAllAppointments } from '../../api/appointments';
import type { Appointment } from '../../types';
import { Calendar, UserRound, User } from 'lucide-react';
import { Button } from '../../components/ui/button';
import FilterBar from '../../components/common/FilterBar';
import AppointmentDetailsModal from '../../components/common/AppointmentDetailsModal';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  if (isLoading) {
    return (
      <Layout
        title="Administrative Overview"
        subtitle="Complete system-wide oversight of all medical consultations."
      >
        <LoadingSpinner />
      </Layout>
    );
  }

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

  const currentAppointments = appointments || [];

  const filteredByStatus = statusFilter === 'ALL'
    ? currentAppointments
    : currentAppointments.filter((appointment: Appointment) => appointment.status === statusFilter);

  const filteredAppointments = filteredByStatus.filter(a => 
    a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toString().includes(searchTerm)
  );

  const appointmentStatuses = [
    { label: 'All View', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Cancelled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  return (
    <Layout
      title="Platform Appointments"
      subtitle="Strategic management and tracking of all platform-wide medical interactions."
    >
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">System Calendar</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Global Scheduling Audit</p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
              <FilterBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                statuses={appointmentStatuses}
                placeholder="Audit Search (Name, Doc, ID)..."
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Cluster</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Provider</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Schedule</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Audit</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-300 font-medium italic">
                    Universal index remains empty for current filters.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment: Appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mr-4">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">
                            {appointment.patientName}
                          </div>
                          <div className="text-xs text-gray-400 font-medium">{appointment.patientEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 mr-4">
                          <UserRound className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {appointment.doctorName}
                          </div>
                          <div className="text-xs text-gray-400 font-medium uppercase tracking-widest">{appointment.specialization}</div>
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
                            {appointment.startTime} - {appointment.endTime}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`status-badge !px-4 !py-1.5 !font-black !uppercase !tracking-widest !text-[10px] shadow-sm ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewDetails(appointment)}
                        className="text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 transition-all active:scale-95"
                      >
                        Details
                      </Button>
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
        userRole="DOCTOR"
      />
    </Layout>
  );
}