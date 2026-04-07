import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getAllDoctors, deleteDoctor } from '../../api/doctors';
import { registerDoctor } from '../../api/auth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2, UserPlus, Trash2, Mail, BadgeCheck, Stethoscope, DollarSign } from 'lucide-react';
import FilterBar from '../../components/common/FilterBar';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await getAllDoctors();
      const sortedData = data.sort((a, b: any) => b.id - a.id);
      setDoctors(sortedData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsRegistering(true);
      await registerDoctor({ ...formData, role: 'DOCTOR' });
      toast.success('Doctor registered successfully');
      setIsModalOpen(false);
      setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '' });
      fetchDoctors();
    } catch (error) {
      console.error('Error registering doctor:', error);
      toast.error('Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setIsDeleteLoading(true);
      await deleteDoctor(deleteModal.id);
      setDoctors(doctors.filter((d: any) => d.id !== deleteModal.id));
      toast.success('Doctor deleted successfully');
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor: any) =>
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && doctors.length === 0) {
    return (
      <Layout
        title="Doctor Directory"
        subtitle="Manage medical staff, verify credentials, and oversee specialized departments."
      >
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout
      title="Physician Management"
      subtitle="Complete lifecycle management of medical practitioners and clinical specialists."
    >
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Active Staff</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Medical Personnel Index</p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <FilterBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter="ALL"
                onStatusChange={() => {}}
                statuses={[{ label: 'All Doctors', value: 'ALL' }]}
                placeholder="Identify Physician (Name, Specialization)..."
              />
              
               <Button
                onClick={() => setIsModalOpen(true)}
                className="h-14 px-8 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
              >
                Register Physician <UserPlus className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Practitioner Cluster</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Communication</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Field of Expertise</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Economic Value</th>
                <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-300 font-medium italic">
                    Universal physician index remains empty for current filters.
                  </td>
                </tr>
              ) : (
                filteredDoctors.map((doctor: any) => (
                  <tr key={doctor.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mr-4">
                          <BadgeCheck className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-300" />
                        {doctor.email}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 mr-3">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">{doctor.specialization || 'General Practice'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center text-emerald-600 font-black tracking-tighter text-lg">
                        <DollarSign className="w-4 h-4 mr-0.5" />
                        {doctor.consultationFee || '0'}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm space-x-2">
                       <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-4 transition-all active:scale-95"
                      >
                        Profile
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteModal({ isOpen: true, id: doctor.id })}
                        className="text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-4 transition-all active:scale-95"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Revoke
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2.5rem] p-8 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 p-24 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          <DialogHeader className="relative">
            <div className="flex items-center space-x-2 mb-2">
              <div className="h-1 w-8 bg-primary rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Healthcare Provider</span>
            </div>
            <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Register Physician</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="doctor@clinic.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Initial Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRegistering}
                className="rounded-xl bg-primary px-8"
              >
                {isRegistering ? <Loader2 className="animate-spin h-4 w-4" /> : 'Register Doctor'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Doctor Profile"
        description="Are you sure you want to delete this doctor? This will remove them from the staff directory and cancel all their future appointments."
        confirmText="Yes, Delete Profile"
        variant="destructive"
        isLoading={isDeleteLoading}
      />
    </Layout>
  );
}