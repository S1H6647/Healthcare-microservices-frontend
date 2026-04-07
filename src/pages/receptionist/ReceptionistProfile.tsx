import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { useAuthStore } from '../../store/authStore';
import { Shield, Phone, Lock, Loader2, MapPin, BadgeCheck, Save, User } from 'lucide-react';
import { getReceptionistProfile, updateReceptionist } from '../../api/receptionists';
import { updatePassword } from '../../api/auth';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ReceptionistResponse } from '../../types';
import { formatDate } from '../../utils/formatDate';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  address: z.string().min(5, 'Address is required'),
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ReceptionistProfile() {
  const { email: storeEmail, firstName: storeFirstName, lastName: storeLastName, role } = useAuthStore();
  const [profile, setProfile] = useState<ReceptionistResponse | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = async () => {
    if (!storeEmail) return;
    try {
      const data = await getReceptionistProfile(storeEmail);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback
      setProfile({
        id: 0,
        firstName: storeFirstName || '',
        lastName: storeLastName || '',
        email: storeEmail || '',
        phone: 'Not provided',
        address: 'Not provided',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [storeEmail]);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
    }
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone === 'Not provided' ? '' : profile.phone,
        address: profile.address === 'Not provided' ? '' : profile.address,
      });
    }
  }, [profile, profileForm]);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdateProfile = async (data: any) => {
    if (!storeEmail) return;
    try {
      setIsLoading(true);
      await updateReceptionist(storeEmail, data);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onUpdatePassword = async (data: any) => {
    if (!storeEmail) return;
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

    return (
        <Layout
            title="Receptionist Profile"
            subtitle="Manage your professional staff record and institutional contact points."
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-primary to-blue-700">
                        <div className="absolute -bottom-16 left-12">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                <div className="h-full w-full rounded-[2rem] bg-gray-50 flex items-center justify-center text-primary text-4xl font-black">
                                    {(profile?.firstName || storeFirstName)?.[0]}{(profile?.lastName || storeLastName)?.[0]}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-12">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                                    {profile?.firstName || storeFirstName} {profile?.lastName || storeLastName}
                                </h2>
                                <div className="flex items-center mt-2 text-gray-500 font-bold uppercase tracking-widest text-xs">
                                    <Shield className="w-4 h-4 mr-2 text-primary" />
                                    Administrative Staff • {role}
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
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Personal & Work Profile</h3>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Identity & Contact Records</p>
                                </div>
                            </div>

                            <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">First Name (Read-only)</Label>
                                        <Input value={profile?.firstName || storeFirstName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Last Name (Read-only)</Label>
                                        <Input value={profile?.lastName || storeLastName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Verified Professional Email (Read-only)</Label>
                                    <Input value={profile?.email || storeEmail || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                        <Phone className="w-3 h-3 mr-1" /> Direct Contact Number
                                    </Label>
                                    <Input
                                        {...profileForm.register('phone')}
                                        className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                                        placeholder="Enter your phone number"
                                    />
                                    {profileForm.formState.errors.phone && <p className="text-xs text-red-500 font-bold ml-1">{profileForm.formState.errors.phone.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1 flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" /> Residence/Commute Address
                                    </Label>
                                    <Textarea
                                        {...profileForm.register('address')}
                                        rows={4}
                                        className="rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold p-4 text-sm"
                                        placeholder="Enter your full residential address"
                                    />
                                    {profileForm.formState.errors.address && <p className="text-xs text-red-500 font-bold ml-1">{profileForm.formState.errors.address.message}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {isLoading ? (
                                        <Loader2 className="animate-spin h-6 w-6" />
                                    ) : (
                                        <><Save className="mr-2 h-5 w-5" /> Sync Staff Profile</>
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
                                    <span className="text-sm font-black text-gray-900 tracking-tight">Verified Staff</span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
                                    Your administrative credentials have been institutionally verified for front-office operations.
                                </p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee ID</span>
                                        <span className="text-[10px] font-black text-gray-900 uppercase">REC-{profile.id.toString().padStart(4, '0')}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Staff Since</span>
                                        <span className="text-[10px] font-black text-gray-900 uppercase">{formatDate(profile.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-primary rounded-[2.5rem] shadow-2xl shadow-primary/20 p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <Shield className="w-10 h-10 mb-4 opacity-50 text-white" />
                                <h4 className="text-lg font-black tracking-tight mb-2">Hospital Operations</h4>
                                <p className="text-sm text-white/80 font-medium leading-relaxed">
                                    You have authorization for patient registration, appointment scheduling, and front-office financial transactions within the facility.
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
                        <p className="text-gray-500 font-medium pt-2">Update your administrative access credentials.</p>
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
                            <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Confirm New Password</Label>
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
                                disabled={isLoading}
                                className="w-full h-16 rounded-2xl bg-gray-900 text-white font-black uppercase tracking-widest shadow-xl shadow-gray-900/20 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : 'Update Secure Access'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
