import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import BookAppointmentModal from '../../components/common/BookAppointmentModal';
import { getMyPatientProfile } from '../../api/patients';
import { getAppointmentsByPatient } from '../../api/appointments';
import { formatTime } from '../../utils/formatTime';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import type { Appointment } from '../../types';

export default function PatientDashboard() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const navigate = useNavigate();
  const [isProfileIncomplete, setIsProfileIncomplete] = useState<boolean | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [patientId, setPatientId] = useState<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getMyPatientProfile();
        setIsProfileIncomplete(!profile.isProfileCompleted);
        setPatientId(profile.id);

        const allAppointments = await getAppointmentsByPatient(profile.id);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        today.setHours(0, 0, 0, 0);

        const upcoming = allAppointments.filter(app => {
          const appDate = new Date(app.appointmentDate);
          return (app.status === 'CONFIRMED' || app.status === 'PENDING') &&
            appDate >= today &&
            appDate <= nextWeek;
        });

        const sorted = upcoming.sort((a, b) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        );

        setUpcomingAppointments(sorted);
      } catch (error) {
        console.error('Dashboard init error:', error);
        setIsProfileIncomplete(true); // Treat as incomplete if profile doesn't exist
      }
    };

    init();
  }, []);

  return (
    <Layout
      title="Welcome back!"
      subtitle="Here's what's happening with your health journey today."
    >
      {isProfileIncomplete && (
        <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-amber-100/50 animate-pulse-slow">
          <div className="flex items-center space-x-6 mb-6 md:mb-0">
            <div className="p-4 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-900 tracking-tight">Complete Your Medical Profile</h3>
              <p className="text-sm text-amber-700 font-medium mt-1">Please provide your missing details (Email, Date of Birth, Gender) to unlock all features.</p>
              <p className="text-xs text-amber-600 font-bold mt-2 uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                Security Tip: Change your default password for enhanced protection.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/patient/profile')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest px-8 h-14 rounded-xl shadow-lg shadow-amber-600/20"
          >
            Update My Profile <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Welcome to your Dashboard</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage your health journey</p>
            <div className="mt-5">
                <Button
                  onClick={() => setIsBookingOpen(true)}
                  disabled={isProfileIncomplete === true}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Book Appointment
                </Button>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments Weekly View */}
        <div className="bg-white overflow-hidden shadow-sm rounded-[2rem] border border-gray-100 flex flex-col h-full">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Weekly Outlook</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1">Next 7 Days</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1 px-8 py-6 space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold text-sm">Quiet week ahead.</p>
                <p className="text-xs text-gray-400 mt-1">No consultations found.</p>
              </div>
            ) : (
              upcomingAppointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment.id}
                  className="group relative flex items-center p-4 rounded-2xl border border-gray-50 hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer"
                  onClick={() => navigate('/patient/appointments')}
                >
                  <div className="flex flex-col items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="text-[10px] font-black uppercase leading-none mb-1">
                      {new Date(appointment.appointmentDate).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-sm font-black leading-none">
                      {new Date(appointment.appointmentDate).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{appointment.doctorName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{formatTime(appointment.startTime)}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-[10px] icon-badge bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg font-black uppercase tracking-widest">{appointment.status.toLowerCase()}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
          {upcomingAppointments.length > 3 && (
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-50">
              <Link to="/patient/appointments" className="text-xs font-black text-primary uppercase tracking-widest hover:underline flex items-center justify-center">
                View all upcoming ({upcomingAppointments.length})
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-5 space-y-3">
              <button
                onClick={() => navigate('/patient/profile')}
                className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm"
              >
                View Profile
              </button>
              <button
                onClick={() => navigate('/patient/appointments')}
                className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm"
              >
                My Appointments
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        patientId={patientId || 0}
        onSuccess={() => patientId && navigate('/patient/appointments')}
      />
    </Layout>
  );
}