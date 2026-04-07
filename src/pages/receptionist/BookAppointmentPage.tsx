import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { Search, User, Calendar, FileText, ArrowLeft, CheckCircle2, AlertCircle, Users, PlusCircle, Loader2 } from 'lucide-react';
import Layout from '../../components/common/Layout';
import { getAllDoctors } from '../../api/doctors';
import { getAllPatients, createPatient } from '../../api/patients';
import { bookAppointment } from '../../api/appointments';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import type { Doctor, Patient } from '../../types';


const bookingSchema = z.object({
  patientId: z.number({ message: 'Please select a patient' }),
  doctorId: z.number({ message: 'Please select a doctor' }),
  appointmentDate: z.string().min(1, 'Please select a date'),
  startTime: z.string().min(1, 'Please select a start time'),
  endTime: z.string().min(1, 'Please select an end time'),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [patientSearch, setPatientSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Quick Patient states
  const [isQuickPatientModalOpen, setIsQuickPatientModalOpen] = useState(false);
  const [isQuickPatientSubmitting, setIsQuickPatientSubmitting] = useState(false);
  const [quickPatientData, setQuickPatientData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        const [doctorsData, patientsData] = await Promise.all([
          getAllDoctors(),
          getAllPatients(),
        ]);
        setDoctors(doctorsData);
        setPatients(patientsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load required data');
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d => 
    `${d.firstName} ${d.lastName}`.toLowerCase().includes(doctorSearch.toLowerCase()) ||
    d.specialization.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const onSubmit = async (data: BookingFormData) => {
    try {
      setIsLoading(true);
      await bookAppointment({
        ...data,
        startTime: data.startTime + ':00',
        endTime: data.endTime + ':00',
        notes: data.notes || '',
      });
      toast.success('Appointment booked successfully!');
      navigate('/receptionist/dashboard');
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to book appointment.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const handleQuickPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPatientData.firstName || !quickPatientData.lastName || !quickPatientData.phone) {
      toast.error('Please fill in all quick patient fields');
      return;
    }

    try {
      setIsQuickPatientSubmitting(true);
      // Create patient with dummy values for other mandatory fields as requested for quick creation
      const newPatient = await createPatient({
        firstName: quickPatientData.firstName,
        lastName: quickPatientData.lastName,
        phone: quickPatientData.phone,
        email: `${quickPatientData.firstName.toLowerCase()}.${quickPatientData.lastName.toLowerCase()}.${Date.now()}@quick.patient`,
        dateOfBirth: '2000-01-01',
        gender: 'Not specified',
        address: 'Quick Registration',
      });

      setPatients(prev => [...prev, newPatient]);
      setSelectedPatient(newPatient);
      setValue('patientId', newPatient.id);
      setIsQuickPatientModalOpen(false);
      setQuickPatientData({ firstName: '', lastName: '', phone: '' });
      toast.success('Quick patient created and selected!');
    } catch (error: any) {
      console.error('Quick patient creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create quick patient');
    } finally {
      setIsQuickPatientSubmitting(false);
    }
  };

  return (
    <Layout 
      title="Schedule Appointment" 
      subtitle="Complete the form below to book a new medical consultation."
    >
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 hover:bg-white/50 -ml-2 text-gray-500 font-bold uppercase tracking-widest text-xs"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Selection */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Patient Selection */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Select Patient</h3>
                </div>

                <div className="flex justify-end mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsQuickPatientModalOpen(true)}
                    className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-xs uppercase tracking-widest"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Quick Patient
                  </Button>
                </div>

                {selectedPatient ? (
                  <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                        <p className="text-sm text-gray-500">{selectedPatient.email}</p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null);
                        setValue('patientId', undefined as any);
                      }}
                      className="text-primary font-bold hover:bg-primary/10"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search patient by name or email..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
                      {isDataLoading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Loading patients...</div>
                      ) : filteredPatients.length > 0 ? (
                        filteredPatients.map(p => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              setSelectedPatient(p);
                              setValue('patientId', p.id);
                            }}
                            className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
                                {p.firstName[0]}{p.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">
                                  {p.firstName} {p.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{p.email}</p>
                              </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-gray-200 group-hover:text-primary transition-colors" />
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 font-medium">No patients found matching your search.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {errors.patientId && <p className="mt-2 text-xs text-red-600 font-bold">{errors.patientId.message}</p>}
              </div>

              {/* Doctor Selection */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Select Doctor</h3>
                </div>

                {selectedDoctor ? (
                  <div className="flex items-center justify-between p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                        DR
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</p>
                        <p className="text-sm text-purple-600 font-bold uppercase tracking-wider text-[10px]">{selectedDoctor.specialization}</p>
                      </div>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedDoctor(null);
                        setValue('doctorId', undefined as any);
                      }}
                      className="text-purple-700 font-bold hover:bg-purple-100"
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search doctor by name or specialization..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        className="pl-10 h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-50">
                      {isDataLoading ? (
                        <div className="p-4 text-center text-gray-400 text-sm">Loading doctors...</div>
                      ) : filteredDoctors.length > 0 ? (
                        filteredDoctors.map(d => (
                          <div 
                            key={d.id}
                            onClick={() => {
                              setSelectedDoctor(d);
                              setValue('doctorId', d.id);
                            }}
                            className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 text-xs font-bold">
                                DR
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                                  Dr. {d.firstName} {d.lastName}
                                </p>
                                <p className="text-xs text-gray-500">{d.specialization}</p>
                              </div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-gray-200 group-hover:text-purple-600 transition-colors" />
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-400 font-medium">No doctors found matching your search.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {errors.doctorId && <p className="mt-2 text-xs text-red-600 font-bold">{errors.doctorId.message}</p>}
              </div>
            </div>

            {/* Right Column: Schedule & Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-2 bg-green-50 rounded-xl">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900">Schedule</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label className="uppercase tracking-[0.1em] text-[10px] font-black text-gray-400 mb-2 block">Appointment Date</Label>
                    <Input
                      type="date"
                      min={today}
                      {...register('appointmentDate')}
                      className="h-12 rounded-xl bg-gray-50 border-gray-200"
                    />
                    {errors.appointmentDate && <p className="mt-2 text-xs text-red-600 font-bold">{errors.appointmentDate.message}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="uppercase tracking-[0.1em] text-[10px] font-black text-gray-400 mb-2 block">Start Time</Label>
                      <Input
                        type="time"
                        {...register('startTime')}
                        className="h-12 rounded-xl bg-gray-50 border-gray-200"
                      />
                      {errors.startTime && <p className="mt-2 text-xs text-red-600 font-bold">{errors.startTime.message}</p>}
                    </div>
                    <div>
                      <Label className="uppercase tracking-[0.1em] text-[10px] font-black text-gray-400 mb-2 block">End Time</Label>
                      <Input
                        type="time"
                        {...register('endTime')}
                        className="h-12 rounded-xl bg-gray-50 border-gray-200"
                      />
                      {errors.endTime && <p className="mt-2 text-xs text-red-600 font-bold">{errors.endTime.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="uppercase tracking-[0.1em] text-[10px] font-black text-gray-400 mb-2 block">Consultation Notes</Label>
                    <Textarea
                      {...register('notes')}
                      rows={4}
                      placeholder="Add any specific requirements or symptoms..."
                      className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 mt-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                >
                  {isLoading ? 'Processing...' : 'Confirm Appointment'}
                </Button>
              </div>

              {/* Tips / Info */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl">
                <div className="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <h4 className="text-lg font-black mb-4">Scheduling Guidelines</h4>
                <ul className="space-y-4 text-sm text-gray-300">
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 shrink-0"></div>
                    Ensure patient contact information is up to date before booking.
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 shrink-0"></div>
                    Standard consultations are typically 30 minutes in duration.
                  </li>
                  <li className="flex items-start">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 mr-3 shrink-0"></div>
                    System will automatically check for doctor availability conflicts.
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </form>
      </div>
      <Dialog open={isQuickPatientModalOpen} onOpenChange={setIsQuickPatientModalOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900">Quick Patient Registration</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium">
              Create a new patient record with just basic information.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuickPatientSubmit} className="space-y-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400">First Name</Label>
                <Input
                  required
                  placeholder="First name"
                  value={quickPatientData.firstName}
                  onChange={e => setQuickPatientData({ ...quickPatientData, firstName: e.target.value })}
                  className="rounded-xl h-12 bg-gray-50 border-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400">Last Name</Label>
                <Input
                  required
                  placeholder="Last name"
                  value={quickPatientData.lastName}
                  onChange={e => setQuickPatientData({ ...quickPatientData, lastName: e.target.value })}
                  className="rounded-xl h-12 bg-gray-50 border-gray-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400">Phone Number</Label>
              <Input
                required
                placeholder="Phone number"
                value={quickPatientData.phone}
                onChange={e => setQuickPatientData({ ...quickPatientData, phone: e.target.value })}
                className="rounded-xl h-12 bg-gray-50 border-gray-100"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={isQuickPatientSubmitting}
                className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20"
              >
                {isQuickPatientSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Create & Select Patient'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
