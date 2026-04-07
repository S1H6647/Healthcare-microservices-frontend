import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { useAuthStore } from '../../store/authStore';
import { getAllPatients, createPatient, updatePatient } from '../../api/patients';
import { updatePassword } from '../../api/auth';
import { Loader2, Lock, Heart, UserCircle, Phone, Calendar, MapPin, Save, BadgeCheck, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  dateOfBirth: z.string().regex(/\d{4}-\d{2}-\d{2}/, 'Invalid date format (YYYY-MM-DD)'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PatientProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const { email, firstName, lastName } = useAuthStore();
  const [patientId, setPatientId] = useState<number | null>(null);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdatePassword = async (data: any) => {
    if (!email) return;
    try {
      setIsPasswordLoading(true);
      await updatePassword(email, {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully');
      setIsPasswordModalOpen(false);
      passwordForm.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchPatient = async () => {
      if (!email) {
        setIsLoading(false);
        return;
      }
      try {
        const patients = await getAllPatients();
        const patient = patients.find((p: any) => p.email === email);

        if (patient) {
          setPatientId(patient.id);
          reset({
            email: patient.email || email || '',
            phone: patient.phone,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender,
            address: patient.address,
          });
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [email, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      const submissionData = {
        ...data,
        firstName: firstName || '',
        lastName: lastName || '',
        isProfileCompleted: true,
      };

      if (patientId) {
        await updatePatient(patientId, submissionData);
        toast.success('Profile updated successfully!');
      } else {
        const newPatientData = {
          ...submissionData,
          email: data.email, // Use provided email
        };
        const created = await createPatient(newPatientData as any);
        setPatientId(created.id);
        toast.success('Profile created successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

    if (isLoading) {
      return (
        <Layout title="Patient Profile" subtitle="Syncing your medical record...">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        </Layout>
      );
    }

    return (
        <Layout
            title="Patient Profile"
            subtitle="Manage your personal information and institutional healthcare records."
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-primary to-blue-700">
                        <div className="absolute -bottom-16 left-12">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                <div className="h-full w-full rounded-[2rem] bg-gray-50 flex items-center justify-center text-primary text-4xl font-black">
                                    {firstName?.[0]}{lastName?.[0]}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-12">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tight">{firstName} {lastName}</h2>
                                <div className="flex items-center mt-2 text-gray-500 font-bold uppercase tracking-widest text-xs">
                                    <Heart className="w-4 h-4 mr-2 text-rose-500" />
                                    Institutional Patient • ID-{patientId?.toString().padStart(4, '0') || 'NEW'}
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <Button 
                                    variant="outline"
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="px-8 py-6 border-2 border-gray-200 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Security
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Side */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-12">
                            <div className="flex items-center space-x-4 mb-10">
                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <UserCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Medical Account Identity</h3>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Personal Records & Details</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                                {/* Identity Block */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Legal First Name (Read-only)</Label>
                                        <Input value={firstName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Legal Last Name (Read-only)</Label>
                                        <Input value={lastName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Official Email Address</Label>
                                    <Input 
                                        {...register('email')}
                                        className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                                        placeholder="your.email@example.com"
                                    />
                                    {errors.email && <p className="text-xs text-red-500 font-bold ml-1">{errors.email.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                            <Phone className="w-3 h-3 mr-1" /> Contact Phone
                                        </Label>
                                        <Input 
                                            {...register('phone')} 
                                            className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                                            placeholder="e.g. +1 (555) 000-0000"
                                        />
                                        {errors.phone && <p className="text-xs text-red-500 font-bold ml-1">{errors.phone.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1" /> Date of Birth
                                        </Label>
                                        <Input 
                                            type="date"
                                            {...register('dateOfBirth')} 
                                            className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                                        />
                                        {errors.dateOfBirth && <p className="text-xs text-red-500 font-bold ml-1">{errors.dateOfBirth.message}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Gender Identification</Label>
                                    <select 
                                        {...register('gender')} 
                                        className="w-full rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold px-4 text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                    {errors.gender && <p className="text-xs text-red-500 font-bold ml-1">{errors.gender.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" /> Residential Address
                                    </Label>
                                    <textarea 
                                        {...register('address')}
                                        rows={4}
                                        className="w-full rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 transition-all font-bold p-4 text-sm"
                                        placeholder="Enter your current residential address"
                                    />
                                    {errors.address && <p className="text-xs text-red-500 font-bold ml-1">{errors.address.message}</p>}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin h-6 w-6" />
                                    ) : (
                                        <><Save className="mr-2 h-5 w-5" /> Sync Personal Health Data</>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        {patientId && (
                            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                                        <BadgeCheck className="w-6 h-6" />
                                    </div>
                                    <span className="text-sm font-black text-gray-900 tracking-tight">Verified Patient</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                                    Your institutional medical ID has been verified. You can now schedule appointments and access clinical reports.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical ID</span>
                                        <span className="text-[10px] font-black text-gray-900 uppercase">INST-{patientId.toString().padStart(4, '0')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Care Level</span>
                                        <span className="text-[10px] font-black text-gray-900 uppercase">Tier 1 • Primary</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/20 p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <Activity className="w-10 h-10 mb-4 opacity-50 text-white" />
                                <h4 className="text-lg font-black tracking-tight mb-2">Healthcare Access</h4>
                                <p className="text-sm text-white/80 font-medium leading-relaxed">
                                    You have full access to patient-portal features including telemedicine consultations, prescription history, and clinical documentation.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 p-20 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Update Password Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-10 overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 p-24 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                    <DialogHeader className="relative">
                        <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Security Vault</DialogTitle>
                        <p className="text-gray-500 font-medium pt-2">Update your secure portal access code.</p>
                    </DialogHeader>

                    <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-6 mt-8 relative">
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Current Password</Label>
                            <Input
                                type="password"
                                {...passwordForm.register('oldPassword')}
                                className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                                placeholder="••••••••"
                            />
                            {passwordForm.formState.errors.oldPassword && <p className="text-xs text-red-500 font-bold ml-1">{(passwordForm.formState.errors.oldPassword as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">New Password</Label>
                            <Input
                                type="password"
                                {...passwordForm.register('newPassword')}
                                className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                                placeholder="••••••••"
                            />
                            {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500 font-bold ml-1">{(passwordForm.formState.errors.newPassword as any).message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Verify New Password</Label>
                            <Input
                                type="password"
                                {...passwordForm.register('confirmPassword')}
                                className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                                placeholder="••••••••"
                            />
                            {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 font-bold ml-1">{(passwordForm.formState.errors.confirmPassword as any).message}</p>}
                        </div>
                        <DialogFooter className="pt-6">
                            <Button
                                type="submit"
                                disabled={isPasswordLoading}
                                className="w-full h-16 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 transition-all active:scale-[0.98]"
                            >
                                {isPasswordLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Update Secure Access'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
