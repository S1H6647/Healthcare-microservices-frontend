import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { getMyDoctorProfile } from '../../api/doctors';
import { getAppointmentsByDoctor } from '../../api/appointments';
import { formatTime } from '../../utils/formatTime';
import { Calendar, Users, Clock, ArrowRight, Activity, TrendingUp } from 'lucide-react';
import type { Appointment } from '../../types';


export default function DoctorDashboard() {
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({ totalPatients: 0, appointments: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getMyDoctorProfile();
        setProfileExists(true);

        const allAppointments = await getAppointmentsByDoctor(profile.id);
        const todayStr = new Date().toISOString().split('T')[0];

        const todayApps = allAppointments.filter(app =>
          app.appointmentDate === todayStr && app.status !== 'CANCELLED'
        );

        setTodayAppointments(todayApps.sort((a, b) => a.startTime.localeCompare(b.startTime)));

        // Compute stats
        const uniquePatients = new Set(allAppointments.map(a => a.patientEmail)).size;
        setStats({
          totalPatients: uniquePatients,
          appointments: allAppointments.filter(a => a.status === 'CONFIRMED').length
        });
      } catch (error) {
        console.error('Doctor Dashboard init error:', error);
        setProfileExists(false);
      }
    };

    init();
  }, []);

  return (
    <Layout
      title="Doctor Workspace"
      subtitle="Overview of your daily schedule, patient statistics, and quick clinical actions."
    >
      {profileExists === false && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Action Required: Complete Your Profile
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Creating your doctor's profile is the top priority. Patients will not be able to book appointments with you until your profile is complete.
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <Link
                    to="/doctor/profile"
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600 transition-colors"
                  >
                    Create Profile Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Daily Schedule View */}
        <div className="bg-white overflow-hidden shadow-sm rounded-[2rem] border border-gray-100 flex flex-col h-full lg:col-span-2">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Daily Schedule</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1">Today's Consultations</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl text-primary">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1 px-8 py-6 space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 font-bold text-sm">No appointments scheduled for today.</p>
                <p className="text-xs text-gray-400 mt-1">Enjoy your break or check upcoming days.</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="group relative flex items-center p-4 rounded-2xl border border-gray-50 hover:border-primary/20 hover:bg-primary/[0.02] transition-all cursor-pointer"
                  onClick={() => window.location.href = '/doctor/appointments'}
                >
                  <div className="flex flex-col items-center justify-center w-20 h-14 bg-gray-50 rounded-xl border border-gray-100 mr-4 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="text-[10px] font-black uppercase leading-none mb-1 opacity-60">Time</span>
                    <span className="text-xs font-black leading-none">
                      {formatTime(appointment.startTime)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{appointment.patientName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{appointment.patientEmail}</span>
                      <span className="text-gray-300">•</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black uppercase tracking-widest ${appointment.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                        {appointment.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Performance Stats */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
              <Users className="w-24 h-24 text-primary" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Patients</h4>
            <p className="text-5xl font-black text-gray-900 tabular-nums mb-1">{stats.totalPatients}</p>
            <div className="flex items-center text-emerald-600 space-x-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Active base</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
              <Activity className="w-24 h-24 text-primary" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Confirmed Appts</h4>
            <p className="text-5xl font-black text-gray-900 tabular-nums mb-1">{stats.appointments}</p>
            <div className="flex items-center text-primary space-x-1">
              <Activity className="w-4 h-4" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">Upcoming peak</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Quick Actions</h3>
            <div className="mt-5 space-y-3">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm">
                View Profile
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm">
                Manage Schedule
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm">
                Patient Records
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}