import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import Layout from '../../components/common/Layout';
import { useAuthStore } from '../../store/authStore';
import { getAllDoctors, createDoctor, updateDoctor } from '../../api/doctors';
import { updatePassword } from '../../api/auth';
import { Loader2, FileText, Upload, Image as ImageIcon, X, Lock, Shield, Activity, Phone, BadgeCheck, Stethoscope, DollarSign, Save } from 'lucide-react';
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
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  specialization: z.string().min(3, 'Specialization must be at least 3 characters'),
  licenseNumber: z.string().min(5, 'License number must be at least 5 characters'),
  consultationFee: z.number().min(0, 'Consultation fee must be positive'),
  availableDays: z.array(z.string()).min(1, 'Available days are required'),
  qualification: z.string().min(3, 'Qualification details are required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function DoctorProfile() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const { email, firstName, lastName } = useAuthStore();
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

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
    defaultValues: {
      availableDays: [],
    }
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!email) {
        setIsLoading(false);
        return;
      }
      try {
        const doctors = await getAllDoctors();
        const doctor = doctors.find((d: any) => d.email === email);

        if (doctor) {
          setDoctorId(doctor.id);
          reset({
            phone: doctor.phone,
            specialization: doctor.specialization,
            licenseNumber: doctor.licenseNumber,
            consultationFee: doctor.consultationFee,
            availableDays: doctor.availableDays ? doctor.availableDays.split(',') : [],
            qualification: doctor.qualification || '',
          });
          setExistingFileUrl(doctor.qualificationUrl);
        }
      } catch (error) {
        console.error('Error fetching doctor:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDoctor();
  }, [email, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      const doctorData = {
        firstName: firstName || '',
        lastName: lastName || '',
        phone: data.phone,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber,
        consultationFee: data.consultationFee,
        availableDays: data.availableDays.join(','),
        qualification: data.qualification,
        email: email || '',
      };

      formData.append('doctor', new Blob([JSON.stringify(doctorData)], { type: 'application/json' }));

      if (selectedFile) {
        formData.append('qualificationFile', selectedFile);
      } else if (!doctorId) {
        toast.error('Qualification document is required for new registration');
        setIsSubmitting(false);
        return;
      }

      if (doctorId) {
        await updateDoctor(doctorId, formData);
        toast.success('Profile updated successfully!');
      } else {
        const created = await createDoctor(formData);
        setDoctorId(created.id);
        setExistingFileUrl(created.qualificationUrl);
        toast.success('Profile created successfully!');
      }
    } catch (error) {
      console.error('Profile error:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

    if (isLoading) {
      return (
        <Layout title="Doctor Profile" subtitle="Loading professional credentials...">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        </Layout>
      );
    }

    return (
        <Layout
            title="Doctor Profile"
            subtitle="Manage your professional credentials, specialization, and clinical availability."
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
                                    <Shield className="w-4 h-4 mr-2 text-primary" />
                                    Clinical Staff • {doctorId ? 'Verified' : 'Pending Verification'}
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
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Professional Credentials</h3>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Medical Licensing & Identity</p>
                        </div>
                      </div>

                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Read-only names */}
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">First Name (Read-only)</Label>
                            <Input value={firstName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                          </div>
                          <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Last Name (Read-only)</Label>
                            <Input value={lastName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Verified Email (Read-only)</Label>
                          <Input value={email || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                    <Phone className="w-3 h-3 mr-1" /> Contact Phone
                                </Label>
                                <Input 
                                    {...register('phone')} 
                                    className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                                />
                                {errors.phone && <p className="text-xs text-red-500 font-bold ml-1">{errors.phone.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                    <BadgeCheck className="w-3 h-3 mr-1" /> License Number
                                </Label>
                                <Input 
                                    {...register('licenseNumber')} 
                                    className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                                />
                                {errors.licenseNumber && <p className="text-xs text-red-500 font-bold ml-1">{errors.licenseNumber.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                    <Stethoscope className="w-3 h-3 mr-1" /> Specialization
                                </Label>
                                <Input 
                                    {...register('specialization')} 
                                    className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                                />
                                {errors.specialization && <p className="text-xs text-red-500 font-bold ml-1">{errors.specialization.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                    <DollarSign className="w-3 h-3 mr-1" /> Consultation Fee
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-400 font-black text-sm">$</span>
                                    </div>
                                    <Input 
                                        type="number"
                                        {...register('consultationFee', { valueAsNumber: true })} 
                                        className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold pl-8" 
                                    />
                                </div>
                                {errors.consultationFee && <p className="text-xs text-red-500 font-bold ml-1">{errors.consultationFee.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Academic & Clinical Qualifications</Label>
                            <textarea 
                                {...register('qualification')}
                                rows={4}
                                className="w-full rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:border-primary/30 transition-all font-bold p-4 text-sm"
                                placeholder="e.g. Master of Surgery, MD Cardiology..."
                            />
                            {errors.qualification && <p className="text-xs text-red-500 font-bold ml-1">{errors.qualification.message}</p>}
                        </div>

                        <div className="space-y-4">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Qualification Verification Document</Label>
                            
                            {!selectedFile && !existingFileUrl ? (
                                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-widest mt-4">Drop certification here</p>
                                        <p className="text-[10px] text-gray-400 mt-1">PDF or image files up to 10MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setSelectedFile(file);
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="flex items-center p-6 bg-primary/[0.03] border border-primary/10 rounded-[2rem] group">
                                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mr-6">
                                        {selectedFile?.type.includes('pdf') || existingFileUrl?.endsWith('.pdf') ? (
                                            <FileText className="w-8 h-8 text-primary" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black text-gray-900 truncate">
                                            {selectedFile ? selectedFile.name : 'Qualification_Verified.pdf'}
                                        </p>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-wider mt-1">
                                            {selectedFile ? 'Unsaved verification file' : 'Institutionally Verified'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setExistingFileUrl(null);
                                        }}
                                        className="h-10 w-10 flex items-center justify-center text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-gray-50">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Weekly Clinical Availability</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => (
                                    <label
                                        key={day}
                                        className="group relative flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-white cursor-pointer transition-all hover:bg-primary/[0.02] hover:border-primary/20 has-[:checked]:bg-primary has-[:checked]:border-primary"
                                    >
                                        <input
                                            type="checkbox"
                                            value={day}
                                            {...register('availableDays')}
                                            className="hidden"
                                        />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-has-[:checked]:text-white">
                                            {day.substring(0, 3)}
                                        </span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mt-2 group-has-[:checked]:bg-white/40"></div>
                                    </label>
                                ))}
                            </div>
                            {errors.availableDays && <p className="text-xs text-red-500 font-bold ml-1">{errors.availableDays.message}</p>}
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <Loader2 className="animate-spin h-6 w-6" />
                          ) : (
                            <><Save className="mr-2 h-5 w-5" /> {doctorId ? 'Sync Clinic Data' : 'Initialize Clinical Profile'}</>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-8">
                    {doctorId && (
                      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                            <BadgeCheck className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-tight">Verified Status</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                            Your medical license and clinical credentials have been verified by the institutional board.
                        </p>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</span>
                            <span className="text-[10px] font-black text-gray-900 uppercase">DOC-{doctorId.toString().padStart(4, '0')}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultations</span>
                            <span className="text-[10px] font-black text-gray-900 uppercase">Clinical Tier 1</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/20 p-8 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <Shield className="w-10 h-10 mb-4 opacity-50 text-white" />
                        <h4 className="text-lg font-black tracking-tight mb-2">Institutional Access</h4>
                        <p className="text-sm text-white/80 font-medium leading-relaxed">
                            Your clinical authorization level allows for patient record access, prescription issuance, and cross-departmental consultation requests.
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
                  <p className="text-gray-500 font-medium pt-2">Update your clinical access credentials.</p>
                </DialogHeader>
                
                <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-6 mt-8 relative">
                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Current Access Code</Label>
                    <Input 
                      type="password" 
                      {...passwordForm.register('oldPassword')} 
                      className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                      placeholder="••••••••"
                    />
                    {passwordForm.formState.errors.oldPassword && <p className="text-xs text-red-500 font-bold ml-1">{(passwordForm.formState.errors.oldPassword as any).message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">New Access Code</Label>
                    <Input 
                      type="password" 
                      {...passwordForm.register('newPassword')} 
                      className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                      placeholder="••••••••"
                    />
                    {passwordForm.formState.errors.newPassword && <p className="text-xs text-red-500 font-bold ml-1">{(passwordForm.formState.errors.newPassword as any).message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Verify New Access Code</Label>
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
