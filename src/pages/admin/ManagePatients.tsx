import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getAllPatients, deletePatient } from '../../api/patients';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { toast } from 'react-hot-toast';
import { UserPlus, Trash2, Mail, User, Phone, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import FilterBar from '../../components/common/FilterBar';

export default function ManagePatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getAllPatients();
        const sortedData = data.sort((a, b) => b.id - a.id);
        setPatients(sortedData);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    try {
      setIsDeleteLoading(true);
      await deletePatient(deleteModal.id);
      setPatients(patients.filter((p: any) => p.id !== deleteModal.id));
      toast.success('Patient deleted successfully');
      setDeleteModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Failed to delete patient');
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient: any) =>
    patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Layout
        title="Patient Identity Index"
        subtitle="Global directory for patient profiles and registered medical identities."
      >
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout
      title="Medical Demographic Control"
      subtitle="Strategic management of patient clusters and clinical identity verification."
    >
      <div className="bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 overflow-hidden">
        <div className="px-10 py-10 bg-gray-50/50 border-b border-gray-100">
           <div className="flex flex-col gap-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Registered Entities</h3>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Universal Patient Directory</p>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <FilterBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter="ALL"
                onStatusChange={() => {}}
                statuses={[{ label: 'All Patients', value: 'ALL' }]}
                placeholder="Identify Patient (Name, Email)..."
              />
              
              <Button
                className="h-14 px-8 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
              >
                Onboard Patient <UserPlus className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Patient Identity</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Communication</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Connectivity</th>
                <th scope="col" className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Temporal Origin</th>
                <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Management</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20 text-gray-300 font-medium italic">
                    Universal patient index remains empty for current search parameters.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient: any) => (
                  <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 mr-4">
                          <User className="w-5 h-5" />
                        </div>
                        <div className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">
                          {patient.firstName} {patient.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-300" />
                        {patient.email}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-600">
                        <Phone className="w-4 h-4 mr-2 text-gray-300" />
                        {patient.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                         <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 mr-3">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-500">{patient.dateOfBirth || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm space-x-2">
                       <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-4 transition-all active:scale-95"
                      >
                        Clinical File
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteModal({ isOpen: true, id: patient.id })}
                        className="text-rose-500 hover:bg-rose-50 font-black uppercase tracking-widest text-[10px] rounded-xl h-10 px-4 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3 h-3 mr-2" /> Expunge
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Patient Record"
        description="Are you sure you want to delete this patient? All associated medical history and appointments will be permanently removed."
        confirmText="Yes, Delete Record"
        variant="destructive"
        isLoading={isDeleteLoading}
      />
    </Layout>
  );
}