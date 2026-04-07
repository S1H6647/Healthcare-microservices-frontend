import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getAllPatients } from '../../api/patients';
import { getAllDoctors } from '../../api/doctors';
import { getAllReceptionists } from '../../api/receptionists';
import { getAllPharmacists } from '../../api/pharmacists';
import { getAllAppointments } from '../../api/appointments';
import { Users, UserCheck, Calendar, Activity, TrendingUp, ShieldAlert, BookOpen, ArrowRight, FlaskConical } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    patients: 0,
    doctors: 0,
    receptionists: 0,
    pharmacists: 0,
    appointments: 0,
    pending: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [patients, doctors, receptionists, pharmacists, appointmentsPaginated] = await Promise.all([
          getAllPatients(),
          getAllDoctors(),
          getAllReceptionists(),
          getAllPharmacists(),
          getAllAppointments(0, 1000) // Get a larger sample for dashboard stats or handle totalElements
        ]);

        const appointments = appointmentsPaginated.content;
        const totalAppointments = appointmentsPaginated.totalElements;
        setStats({
          patients: patients.length,
          doctors: doctors.length,
          receptionists: receptionists.length,
          pharmacists: pharmacists.length,
          appointments: totalAppointments,
          pending: appointments.filter(a => a.status === 'PENDING').length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Layout title="Operations Hub" subtitle="Real-time synchronization of medical infrastructure metrics.">
        <LoadingSpinner />
      </Layout>
    );
  }

  const statCards = [
    { title: 'Total Patients', value: stats.patients, icon: Users, color: 'bg-primary', lightColor: 'bg-primary/10', textColor: 'text-primary' },
    { title: 'Total Doctors', value: stats.doctors, icon: Activity, color: 'bg-emerald-500', lightColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { title: 'Total Receptionists', value: stats.receptionists, icon: UserCheck, color: 'bg-sky-500', lightColor: 'bg-sky-50', textColor: 'text-sky-600' },
    { title: 'Total Pharmacists', value: stats.pharmacists, icon: FlaskConical, color: 'bg-indigo-500', lightColor: 'bg-indigo-50', textColor: 'text-indigo-600' },
    { title: 'Total Appointments', value: stats.appointments, icon: Calendar, color: 'bg-orange-500', lightColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ];

  return (
    <Layout
      title="Global Control Hub"
      subtitle="Strategic cross-functional oversight of platform health and operational throughput."
    >
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {statCards.map((card, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 -mt-8 -mr-8 p-16 ${card.lightColor} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500`}></div>
              
              <div className="relative">
                <div className={`h-14 w-14 rounded-2xl ${card.lightColor} flex items-center justify-center ${card.textColor} mb-6 shadow-inner`}>
                  <card.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{card.title}</h3>
                <div className="flex items-baseline space-x-2">
                  <p className="text-4xl font-black text-gray-900 tracking-tighter">{card.value}</p>
                  <span className="text-emerald-500 text-xs font-bold flex items-center bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" /> Stable
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 p-40 bg-rose-50 rounded-full blur-3xl opacity-50"></div>
            <div className="relative">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">Priority Interventions</h3>
                  <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">Awaiting Platform Action</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-rose-100 transition-colors">
                  <div className="flex items-center space-x-6">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-rose-500">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-rose-400 uppercase tracking-widest">Pending Approvals</p>
                      <p className="text-2xl font-black text-rose-900 leading-none mt-1">{stats.pending} Appointments</p>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-8 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
                   <div className="flex items-center space-x-6">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Account Verifications</p>
                      <p className="text-2xl font-black text-gray-900 leading-none mt-1">0 Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/40 flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 p-24 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative">
               <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-8">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black tracking-tight leading-tight mb-4">Platform Oversight Status: Operational</h3>
              <p className="text-primary-foreground font-medium text-lg leading-relaxed">
                All clinical systems are currently operating within nominal throughput parameters for the current cycle.
              </p>
            </div>
            
            <div className="relative mt-12 bg-white/10 backdrop-blur-md rounded-[1.5rem] p-6 border border-white/20">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">System Integrity</p>
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-white rounded-full"></div>
              </div>
              <p className="text-right text-[10px] font-black mt-2">98.4% Efficiency</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}