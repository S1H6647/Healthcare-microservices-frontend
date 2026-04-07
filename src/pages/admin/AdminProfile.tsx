import { useState } from 'react';
import Layout from '../../components/common/Layout';
import { useAuthStore } from '../../store/authStore';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { updatePassword } from '../../api/auth';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AdminProfile() {
  const { email, firstName, lastName, role } = useAuthStore();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onUpdatePassword = async (data: any) => {
    if (!email) return;
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

    return (
        <Layout
            title="Administrator Profile"
            subtitle="Manage your administrative credentials and security settings."
        >
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Hero Section */}
                <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="relative h-48 bg-gradient-to-br from-gray-900 to-gray-700">
                        <div className="absolute -bottom-16 left-12">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                                <div className="h-full w-full rounded-[2rem] bg-gray-50 flex items-center justify-center text-gray-900 text-4xl font-black">
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
                                    <Shield className="w-4 h-4 mr-2 text-gray-900" />
                                    System {role} • Root Access
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
                                <div className="h-12 w-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-900">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Identity Records</h3>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Administrative Authentication</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">First Name (System)</Label>
                                        <Input value={firstName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Last Name (System)</Label>
                                        <Input value={lastName || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Root Access Email (Read-only)</Label>
                                    <Input value={email || ''} readOnly className="rounded-xl h-14 bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed font-bold" />
                                </div>

                                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-[2rem]">
                                    <div className="flex items-start">
                                        <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mr-4 shrink-0">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Active Session Security</h4>
                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                                                You are currently logged in with root-level administrative privileges. Standard identity modifications are restricted to maintain system integrity.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-black text-gray-900 tracking-tight">System Status</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Access Level</span>
                                    <span className="text-[10px] font-black text-gray-900 uppercase">Super Admin</span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</span>
                                    <span className="text-emerald-500 font-black text-[10px] uppercase">Online</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-[2.5rem] shadow-2xl shadow-gray-900/20 p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <Shield className="w-10 h-10 mb-4 opacity-50 text-white" />
                                <h4 className="text-lg font-black tracking-tight mb-2">Global Authority</h4>
                                <p className="text-sm text-white/80 font-medium leading-relaxed">
                                    Full oversight of medical staff, pharmaceutical inventory, and patient data across the entire institution.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 -mt-8 -mr-8 p-20 bg-white/5 rounded-full blur-2xl"></div>
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
