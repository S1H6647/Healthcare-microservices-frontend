import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getPrescriptionsByPatient } from '../../api/prescriptions';
import { getMyPatientProfile } from '../../api/patients';
import type { Prescription } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatDate';
import { Pill, FileText, Clock, User, Search, Activity, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const profile = await getMyPatientProfile();
        const data = await getPrescriptionsByPatient(profile.id);
        const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPrescriptions(sortedData);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  const filteredPrescriptions = prescriptions.filter(p =>
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  if (isLoading) return <Layout title="My Prescriptions"><LoadingSpinner /></Layout>;

  return (
    <Layout
      title="Medical Prescriptions"
      subtitle="Digital repository of your clinical pharmacological orders and instructions."
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Search */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-40 bg-primary/5 rounded-full blur-3xl pointer-events-none -mt-20 -mr-20"></div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Active Orders</h2>
              <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">Pharmacological History</p>
            </div>
            
            <div className="w-full md:w-96 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors z-10" />
              <Input
                type="text"
                placeholder="Search by diagnosis, doctor or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 shadow-none"
              />
            </div>
          </div>
        </div>

        {/* Prescription List */}
        {filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 py-32 text-center flex flex-col items-center">
             <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-300 italic uppercase tracking-widest">No Records Found</h3>
              <p className="text-sm text-gray-400 mt-2 font-medium">Verify your search or consult with your medical provider.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPrescriptions.map((p) => (
              <div 
                key={p.id} 
                className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-xl shadow-gray-200/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden flex flex-col h-full"
              >
                <div className="flex justify-between items-start mb-8 relative">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                        REF-{p.id.toString().padStart(4, '0')}
                      </span>
                      <span className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter">{formatDate(p.createdAt)}</span>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors leading-tight truncate max-w-[200px]">{p.diagnosis}</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                    p.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100/50' : 
                    p.status === 'DISPENSED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                    'bg-gray-50 text-gray-400 border border-gray-100/50'
                  }`}>
                    {p.status}
                  </div>
                </div>

                <div className="space-y-6 flex-grow">
                   <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-50">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Medical Practitioner</p>
                      <p className="font-bold text-gray-900 text-sm">Dr. {p.doctorName}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Medical Supplies</p>
                    <div className="grid grid-cols-2 gap-3">
                      {p.items.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 bg-gray-50/30 p-2 rounded-xl">
                          <Pill className="w-3.5 h-3.5 text-primary opacity-40 shrink-0" />
                          <span className="text-[11px] font-bold text-gray-700 truncate">{item.drugName}</span>
                        </div>
                      ))}
                      {p.items.length > 4 && (
                        <div className="flex items-center justify-center bg-gray-100 rounded-xl">
                          <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">+{p.items.length - 4} more</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50 flex justify-end">
                   <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedPrescription(p);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 rounded-2xl px-8 h-12 transition-all active:scale-95 flex items-center"
                    >
                      Record Details <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[3rem] border-none shadow-2xl">
          <DialogHeader className="px-10 pt-10 pb-8 bg-white border-b border-gray-50 relative">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <Activity className="w-48 h-48 text-primary" />
            </div>
            
            <div className="relative">
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                  PRES-ORD-{selectedPrescription?.id.toString().padStart(4, '0')}
                </span>
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest italic flex items-center">
                  <Clock className="w-3 h-3 mr-1.5" /> Ordered: {selectedPrescription && formatDate(selectedPrescription.createdAt)}
                </span>
              </div>
              <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-1">Prescription Data</DialogTitle>
              <DialogDescription className="text-gray-500 font-medium text-base mt-2">
                Detailed clinical instructions and pharmacological overview.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="p-10 max-h-[70vh] overflow-y-auto space-y-10">
             {/* Clinical Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 flex flex-col justify-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Institutional Provider</p>
                  <h4 className="text-2xl font-black text-gray-900 leading-tight">Dr. {selectedPrescription?.doctorName}</h4>
                  <p className="text-sm text-primary font-bold mt-2 uppercase tracking-widest">Clinical Origin: Verified</p>
                </div>
                <div className="bg-primary/5 p-8 rounded-[2rem] border border-primary/10">
                  <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2">Verified Diagnosis</p>
                  <h4 className="text-2xl font-black text-primary leading-tight">{selectedPrescription?.diagnosis}</h4>
                  <p className="text-xs text-primary/60 font-medium mt-2 italic leading-relaxed italic pr-4">"Symptoms: {selectedPrescription?.symptoms}"</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-1 w-12 bg-primary/20 rounded-full"></div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Pharmacological Regimen</h4>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                   {selectedPrescription?.items.map((item, idx) => (
                     <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-primary/20 transition-all">
                        <div className="flex items-center space-x-6">
                           <div className="h-16 w-16 bg-gray-50 rounded-2xl flex items-center justify-center text-primary border border-gray-100 group-hover:shadow-lg transition-all">
                              <Pill className="w-8 h-8" />
                           </div>
                           <div>
                              <h5 className="text-xl font-black text-gray-900 leading-tight mb-1">{item.drugName}</h5>
                              <p className="text-[10px] font-black text-primary uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-full border border-primary/10 inline-block">
                                 {item.dosage}
                              </p>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                           <div className="px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Frequency</p>
                              <p className="text-sm font-black text-gray-900 uppercase">{item.frequency}</p>
                           </div>
                           <div className="px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Duration</p>
                              <p className="text-sm font-black text-gray-900">{item.durationDays} Days</p>
                           </div>
                           <div className="px-6 py-3 bg-primary/5 rounded-2xl border border-primary/10">
                              <p className="text-[9px] font-black text-primary/60 uppercase tracking-[0.2em] mb-1">Route</p>
                              <p className="text-sm font-black text-primary uppercase">{item.route}</p>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-primary/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative">
                  <div className="flex items-center space-x-3 mb-6">
                     <FileText className="w-6 h-6 text-primary" />
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pharmacist Instructions</p>
                  </div>
                  <p className="text-xl font-black italic text-gray-100 leading-relaxed pr-10">
                    {selectedPrescription?.instruction || "Follow standard administration protocols for indicated pharmacology."}
                  </p>
                </div>
             </div>

             {selectedPrescription?.note && (
               <div className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100/50 flex items-start space-x-6">
                  <div className="h-12 w-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 shrink-0 border border-amber-200 shadow-sm">
                     <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest mb-2">Physician's Additional Notes</p>
                    <p className="text-lg font-bold text-amber-900 italic leading-relaxed">"{selectedPrescription.note}"</p>
                  </div>
               </div>
             )}
          </div>

          <div className="px-10 py-10 bg-white border-t border-gray-50 flex justify-end">
             <Button
                onClick={() => setIsDetailModalOpen(false)}
                className="h-14 px-14 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                Close Record
              </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
