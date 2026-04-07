import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { useAuthStore } from '../../store/authStore';
import { User, Shield, Lock, Loader2, Phone, BadgeCheck, Save } from 'lucide-react';
import { updatePassword } from '../../api/auth';
import { getPharmacistProfile, createPharmacistProfile, updatePharmacist } from '../../api/pharmacists';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { PharmacistResponse } from '../../types';
import { formatDate } from '../../utils/formatDate';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  licenseNumber: z.string().min(5, 'License number is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PharmacistProfile() {
    const { email: storeEmail, firstName: storeFirstName, lastName: storeLastName, role } = useAuthStore();
    const [profile, setProfile] = useState<PharmacistResponse | null>(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
      register: registerProfile,
      handleSubmit: handleProfileSubmit,
      reset: resetProfile,
      formState: { errors: profileErrors },
    } = useForm<ProfileFormData>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        firstName: storeFirstName || '',
        lastName: storeLastName || '',
        email: storeEmail || '',
        phone: '',
        licenseNumber: '',
      }
    });

    const passwordForm = useForm({
      resolver: zodResolver(passwordSchema),
    });

    const fetchProfile = async () => {
      if (!storeEmail) return;
      try {
        setIsLoading(true);
        const data = await getPharmacistProfile(storeEmail);
        setProfile(data);
        resetProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || '',
          licenseNumber: data.licenseNumber || '',
        });
      } catch (error: any) {
        if (error.response?.status === 404) {
          setProfile(null);
        } else {
          toast.error('Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchProfile();
    }, [storeEmail]);

    const onProfileSubmit = async (data: ProfileFormData) => {
      if (!storeEmail) return;
      try {
        setIsSubmitting(true);
        if (profile) {
          await updatePharmacist(storeEmail, data);
          toast.success('Profile updated successfully');
        } else {
          await createPharmacistProfile(storeEmail, data);
          toast.success('Profile created successfully');
        }
        fetchProfile();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to save profile');
      } finally {
        setIsSubmitting(false);
      }
    };

    const onUpdatePassword = async (data: any) => {
      if (!storeEmail) return;
      try {
        setIsSubmitting(true);
        await updatePassword(storeEmail, {
          oldPassword: data.oldPassword,
          newPassword: data.newPassword
        });
        toast.success('Password updated successfully');
        setIsPasswordModalOpen(false);
        passwordForm.reset();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update password');
      } finally {
        setIsSubmitting(false);
      }
    };

    if (isLoading) {
      return (
        <Layout title="Pharmacist Profile" subtitle="Loading professional credentials...">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        </Layout>
      );
    }

    return (
        <Layout
            title="Pharmacist Profile"
            subtitle="Manage your professional identity and institutional credentials."
        >
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-primary to-blue-700">
                        <div className="absolute -bottom-16 left-12">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                <div className="h-full w-full rounded-[2rem] bg-gray-50 flex items-center justify-center text-primary text-4xl font-black">
                                    {storeFirstName?.[0]}{storeLastName?.[0]}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-12">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tight">{storeFirstName} {storeLastName}</h2>
                                <div className="flex items-center mt-2 text-gray-500 font-bold uppercase tracking-widest text-xs">
                                    <Shield className="w-4 h-4 mr-2 text-primary" />
                                    Account {role}
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
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Professional Credentials</h3>
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Legal & Identity Records</p>
                        </div>
                      </div>

                      <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">First Name (Read-only)</Label>
                            <Input {...registerProfile('firstName')} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                          </div>
                          <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Last Name (Read-only)</Label>
                            <Input {...registerProfile('lastName')} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Professional Email (Read-only)</Label>
                          <Input {...registerProfile('email')} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                              <Phone className="w-3 h-3 mr-1" /> Contact Phone
                            </Label>
                            <Input 
                              {...registerProfile('phone')} 
                              placeholder="+1 234 567 890" 
                              className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                            />
                            {profileErrors.phone && <p className="text-xs text-red-500 font-bold ml-1">{profileErrors.phone.message}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                              <BadgeCheck className="w-3 h-3 mr-1" /> License Number
                            </Label>
                            <Input 
                              {...registerProfile('licenseNumber')} 
                              placeholder="PHAR-XXXXXXXX" 
                              className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold" 
                            />
                            {profileErrors.licenseNumber && <p className="text-xs text-red-500 font-bold ml-1">{profileErrors.licenseNumber.message}</p>}
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <Loader2 className="animate-spin h-6 w-6" />
                          ) : (
                            <><Save className="mr-2 h-5 w-5" /> {profile ? 'Update Credentials' : 'Finalize Profile & Authorize'}</>
                          )}
                        </Button>
                      </form>
                    </div>
                  </div>

                  {/* Sidebar Info */}
                  <div className="space-y-8">
                    {profile && (
                      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                            <BadgeCheck className="w-6 h-6" />
                          </div>
                          <span className="text-sm font-black text-gray-900 tracking-tight">Verified Status</span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                          Institutionally verified with full inventory authorization.
                        </p>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Since</span>
                            <span className="text-[10px] font-black text-gray-900 uppercase">{formatDate(profile.createdAt)}</span>
                          </div>
                          <div className="flex justify-between items-center py-3 border-b border-gray-50">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</span>
                            <span className="text-[10px] font-black text-gray-900 uppercase">PHAR-{profile.id.toString().padStart(4, '0')}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-indigo-600 rounded-[2.5rem] shadow-2xl shadow-indigo-600/20 p-8 text-white relative overflow-hidden">
                      <div className="relative z-10">
                        <Shield className="w-10 h-10 mb-4 opacity-50 text-white" />
                        <h4 className="text-lg font-black tracking-tight mb-2">Institutional Access</h4>
                        <p className="text-sm text-indigo-100/80 font-medium leading-relaxed">
                          Your profile authorization level allows for full stock reconciliation and prescription fulfillment across the platform.
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
                  <p className="text-gray-500 font-medium pt-2">Update your institutional access credentials.</p>
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
                      disabled={isSubmitting} 
                      className="w-full h-16 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 transition-all active:scale-[0.98]"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : 'Update Secure Access'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </Layout>
    );
}
