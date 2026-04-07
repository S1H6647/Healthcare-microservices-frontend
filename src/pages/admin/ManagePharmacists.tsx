import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { registerPharmacist } from '../../api/auth';
import { getAllPharmacists, deletePharmacist } from '../../api/pharmacists';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, Plus, Trash2, Mail, Phone, BadgeCheck, ArrowRight, FlaskConical } from 'lucide-react';
import type { PharmacistResponse } from '../../types';
import { formatDate } from '../../utils/formatDate';
import FilterBar from '../../components/common/FilterBar';

export default function ManagePharmacists() {
  const [pharmacists, setPharmacists] = useState<PharmacistResponse[]>([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

  const fetchPharmacists = async () => {
    try {
      setIsPageLoading(true);
      const data = await getAllPharmacists();
      const sortedData = data.sort((a, b: any) => b.id - a.id);
      setPharmacists(sortedData);
    } catch (error) {
      console.error('Error fetching pharmacists:', error);
      toast.error('Failed to load pharmacists');
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacists();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitLoading(true);
      await registerPharmacist({ ...formData, role: 'PHARMACIST' });
      toast.success('Pharmacist created successfully');
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '' });
      fetchPharmacists();
    } catch (error) {
      console.error('Error creating pharmacist:', error);
      toast.error('Failed to create pharmacist');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setIsDeleteLoading(true);
      await deletePharmacist(deleteModal.id);
      toast.success('Pharmacist deleted successfully');
      setDeleteModal({ isOpen: false, id: null });
      fetchPharmacists();
    } catch (error) {
      console.error('Error deleting pharmacist:', error);
      toast.error('Failed to delete pharmacist');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const filteredPharmacists = pharmacists.filter((staff) =>
    staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout
      title="Pharmacist Management"
      subtitle="Administrative oversight of pharmaceutical staff and inventory coordinators."
    >
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden mb-10">
        <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Pharmacy Staff</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Registered Personnel Index</p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <FilterBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter="ALL"
                onStatusChange={() => {}}
                statuses={[{ label: 'All Staff', value: 'ALL' }]}
                placeholder="Identify Staff (Name, Email)..."
              />
              
               <Button
                onClick={() => setIsModalOpen(true)}
                className="h-14 px-8 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
              >
                Add New Pharmacist <Plus className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto">
        {isPageLoading ? (
          <div className="flex justify-center py-24 text-primary">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        ) : filteredPharmacists.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {filteredPharmacists.map((staff) => (
              <div key={staff.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 p-8 hover:shadow-2xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 p-20 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl font-black shadow-inner">
                      {staff.firstName[0]}{staff.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 leading-tight">
                        {staff.firstName} {staff.lastName}
                      </h3>
                      <div className="flex items-center mt-1 text-indigo-500 text-[10px] font-black uppercase tracking-widest">
                        <FlaskConical className="w-3 h-3 mr-1" /> Licensed Pharmacist
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteModal({ isOpen: true, id: staff.id })}
                      className="h-12 w-12 rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="flex items-center p-4 bg-gray-50 rounded-2xl group/item border border-transparent hover:border-gray-200 transition-all">
                    <Mail className="w-4 h-4 text-gray-400 group-hover/item:text-primary transition-colors mr-3" />
                    <span className="text-sm font-bold text-gray-700 truncate">{staff.email}</span>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-2xl group/item border border-transparent hover:border-gray-200 transition-all">
                    <Phone className="w-4 h-4 text-gray-400 group-hover/item:text-primary transition-colors mr-3" />
                    <span className="text-sm font-bold text-gray-700">{staff.phone || 'Pending Onboarding'}</span>
                  </div>
                  <div className="flex items-center p-4 bg-gray-50 rounded-2xl group/item border border-transparent hover:border-gray-200 transition-all md:col-span-2">
                    <BadgeCheck className="w-4 h-4 text-gray-400 group-hover/item:text-primary transition-colors mr-3 shrink-0" />
                    <span className="text-sm font-bold text-gray-700 truncate">{staff.licenseNumber || 'License Pending'}</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registered since: {formatDate(staff.createdAt)}</span>
                  <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div>
                    Account Active
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center">
            <div className="h-20 w-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <FlaskConical className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No Pharmacists Found</h3>
            <p className="text-gray-500 max-w-xs mx-auto font-medium italic">Universal staff index remains empty for current search parameters.</p>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2.5rem] p-10 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 p-24 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <DialogHeader className="relative">
            <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Pharmacist Registration</DialogTitle>
            <p className="text-gray-500 font-medium pt-2">Create a secure portal account for your pharmacy team.</p>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-8 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">First Name</Label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Last Name</Label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                  placeholder="Smith"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Professional Email</Label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                placeholder="pharmacy@healthsync.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Contact Phone</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="uppercase tracking-widest text-[10px] font-black text-gray-400 ml-1">Temporary Password</Label>
              <Input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="rounded-xl h-14 bg-gray-50 border-gray-100 focus:bg-white transition-all font-bold"
                placeholder="••••••••"
              />
            </div>

            <DialogFooter className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitLoading}
                className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isSubmitLoading ? (
                  <Loader2 className="animate-spin h-6 w-6" />
                ) : (
                  <>Authorize Staff Account <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Revoke Pharmacist Access"
        description="Are you sure you want to remove this pharmacist? They will immediately lose access to the inventory management portal."
        confirmText="Yes, Revoke Access"
        variant="destructive"
        isLoading={isDeleteLoading}
      />
    </Layout>
  );
}
