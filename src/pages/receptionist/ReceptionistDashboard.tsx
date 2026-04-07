import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { getAllAppointments } from '../../api/appointments';
import { getReceptionistProfile, createReceptionistProfile } from '../../api/receptionists';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { AlertTriangle, ArrowRight, Phone, MapPin, Loader2, Calendar, User, Users, Clock, CheckCircle } from 'lucide-react';
import { getAllPatients } from '../../api/patients';
import { Button } from '../../components/ui/button';
import type { Appointment } from '../../types';
import AppointmentDetailModal from '../../components/common/AppointmentDetailModal';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const onboardingSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Valid phone number is required'),
  address: z.string().min(5, 'Work address is required'),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function ReceptionistDashboard() {
  const navigate = useNavigate();
  const { email: storeEmail, firstName: storeFirstName, lastName: storeLastName } = useAuthStore();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: storeFirstName || '',
      lastName: storeLastName || '',
      email: storeEmail || '',
      phone: '',
      address: '',
    }
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [appointmentsPaginated, patientsData, profileData] = await Promise.all([
        getAllAppointments(0, 10),
        getAllPatients(),
        storeEmail ? getReceptionistProfile(storeEmail) : Promise.resolve(null)
      ]);
      
      setAppointments(appointmentsPaginated.content);
      setTotalPatients(patientsData.length);

      // Check if profile is incomplete (missing phone or address)
      if (profileData && (!profileData.phone || !profileData.address || profileData.phone === 'Not provided' || profileData.address === 'Not provided')) {
        setIsProfileIncomplete(true);
        setIsOnboardingOpen(true);
        reset({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone === 'Not provided' ? '' : profileData.phone,
          address: profileData.address === 'Not provided' ? '' : profileData.address,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // If profile 404s, it means it's not created yet in the receptionist table
      if ((error as any).response?.status === 404) {
        setIsProfileIncomplete(true);
        setIsOnboardingOpen(true);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [storeEmail]);

  const handleOnboardingSubmit = async (data: OnboardingFormData) => {
    if (!storeEmail) return;
    try {
      setIsSubmitting(true);
      await createReceptionistProfile(storeEmail, data);
      toast.success('Profile completed successfully!');
      setIsOnboardingOpen(false);
      setIsProfileIncomplete(false);
      fetchDashboardData(); // Refresh to get the updated profile
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

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

  if (isLoading) {
    return <Layout title="Receptionist Dashboard"><LoadingSpinner /></Layout>;
  }

  return (
    <Layout
      title="Receptionist Operations"
      subtitle="Centralized control for scheduling and patient management."
    >
      {/* Profile Incomplete Alert */}
      {isProfileIncomplete && (
        <div className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-[2rem] p-6 flex items-center justify-between shadow-lg shadow-amber-100/50 animate-pulse-slow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-amber-900">Action Required: Complete Your Profile</h3>
              <p className="text-sm text-amber-700 font-medium">Please provide your contact details to enable full system features.</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsOnboardingOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest px-6 rounded-xl shadow-md shadow-amber-600/20"
          >
            Complete Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Overview</h2>
          <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-widest">Real-time Clinical Operations</p>
        </div>
        <Button
          onClick={() => navigate('/receptionist/book-appointment')}
          className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          Book New Consultation <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="p-3 bg-blue-50 rounded-2xl w-fit mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <Calendar className="h-6 w-6 text-primary group-hover:text-white" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Appointments</p>
            <h4 className="text-3xl font-black text-gray-900 mt-1">{appointments.length}</h4>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 p-12 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all"></div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="p-3 bg-amber-50 rounded-2xl w-fit mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
              <Clock className="h-6 w-6 text-amber-600 group-hover:text-white" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Sync</p>
            <h4 className="text-3xl font-black text-gray-900 mt-1">{appointments.filter(a => a.status === 'PENDING').length}</h4>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 p-12 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="p-3 bg-emerald-50 rounded-2xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
              <CheckCircle className="h-6 w-6 text-emerald-600 group-hover:text-white" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confirmed</p>
            <h4 className="text-3xl font-black text-gray-900 mt-1">{appointments.filter(a => a.status === 'CONFIRMED').length}</h4>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 p-12 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="p-3 bg-indigo-50 rounded-2xl w-fit mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
              <Users className="h-6 w-6 text-indigo-600 group-hover:text-white" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Patients</p>
            <h4 className="text-3xl font-black text-gray-900 mt-1">{totalPatients}</h4>
          </div>
          <div className="absolute top-0 right-0 -mt-4 -mr-4 p-12 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Synchronizations</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Latest schedule updates</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/receptionist/appointments')}
          className="text-primary font-black uppercase tracking-widest text-[10px]"
        >
          View Full Queue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments Table */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Provider</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Operations</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-gray-300 font-medium italic">No recent activity detected.</td>
                    </tr>
                  ) : (
                    appointments.slice(0, 5).map((apt: Appointment) => (
                      <tr key={apt.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mr-4">
                              <User className="w-5 h-5" />
                            </div>
                            <div className="text-sm font-black text-gray-900 truncate max-w-[150px]">{apt.patientName}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-bold text-gray-900">
                          {apt.doctorName}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`status-badge !px-4 !py-1.5 !font-black !uppercase !tracking-widest !text-[10px] shadow-sm ${getStatusBadgeClass(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <Button
                            variant="ghost"
                            onClick={() => handleViewDetails(apt)}
                            className="text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-4 transition-all"
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
            {appointments.length > 5 && (
              <div className="bg-gray-50/50 p-4 border-t border-gray-100 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/receptionist/appointments')}
                  className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
                >
                  +{appointments.length - 5} more records in universal index
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20 group cursor-pointer" onClick={() => navigate('/receptionist/book-appointment')}>
            <div className="relative z-10">
              <Calendar className="w-10 h-10 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h4 className="text-lg font-black tracking-tight mb-2">Book Consultation</h4>
              <p className="text-sm text-white/70 font-medium leading-relaxed">Instantly schedule a new medical visit for registered or quick-entry patients.</p>
            </div>
            <div className="absolute top-0 right-0 -mt-8 -mr-8 p-16 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/receptionist/appointments')}>
            <div className="relative z-10">
              <Users className="w-10 h-10 mb-4 text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
              <h4 className="text-lg font-black text-gray-900 tracking-tight mb-2">Manage Queue</h4>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">Access the full universal scheduling index to modify or cancel pending consults.</p>
            </div>
            <div className="absolute bottom-0 right-0 -mb-8 -mr-8 p-16 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
          </div>
        </div>
      </div>

      <AppointmentDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedAppointment}
      />

      {/* Onboarding Modal */}
      <Dialog open={isOnboardingOpen} onOpenChange={setIsOnboardingOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] p-8 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 p-16 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <DialogHeader className="relative">
            <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Complete Registration</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium pt-2">
              Welcome to the team! Please provide your additional details to activate your staff account fully.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleOnboardingSubmit)} className="space-y-6 mt-6 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">First Name</Label>
                <Input {...register('firstName')} readOnly className="rounded-xl h-12 bg-gray-50 border-gray-100 focus:ring-0 cursor-not-allowed opacity-70" />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Last Name</Label>
                <Input {...register('lastName')} readOnly className="rounded-xl h-12 bg-gray-50 border-gray-100 focus:ring-0 cursor-not-allowed opacity-70" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Email Address</Label>
              <Input {...register('email')} readOnly className="rounded-xl h-12 bg-gray-50 border-gray-100 focus:ring-0 cursor-not-allowed opacity-70" />
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                <Phone className="w-3 h-3 mr-1" /> Contact Phone Number
              </Label>
              <Input 
                {...register('phone')} 
                placeholder="+1 (555) 000-0000" 
                className={`rounded-xl h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all ${errors.phone ? 'border-red-300 ring-1 ring-red-100' : ''}`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight ml-1">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                <MapPin className="w-3 h-3 mr-1" /> Work Address
              </Label>
              <Textarea 
                {...register('address')} 
                placeholder="Clinic floor, building or street address..." 
                className={`rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all ${errors.address ? 'border-red-300 ring-1 ring-red-100' : ''}`}
                rows={3}
              />
              {errors.address && <p className="text-[10px] text-red-500 font-bold uppercase tracking-tight ml-1">{errors.address.message}</p>}
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  <>Activate Account <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AppointmentDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        appointment={selectedAppointment}
      />
    </Layout>
  );
}
