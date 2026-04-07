import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { API_BASE_URL } from '../../api/axios';
import { getAllPrescriptions, updatePrescriptionStatus, deductMedicines } from '../../api/prescriptions';
import { getAllMedicines, type MedicineResponse } from '../../api/inventory';
import type { Prescription } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Search, FileText, Pill, Loader2, User, CheckCircle2, ChevronRight, FlaskConical, Clock, AlertCircle, CheckSquare, Square, Printer } from 'lucide-react';
import PrescriptionReceipt from '../../components/pharmacist/PrescriptionReceipt';
import { formatDate } from '../../utils/formatDate';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

// Base URL is imported from axios utility

export default function ManagePrescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDispensing, setIsDispensing] = useState(false);
  // Tracks which medicine item indices have been physically collected by the pharmacist
  const [collectedItems, setCollectedItems] = useState<Set<number>>(new Set());

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [presData, medData] = await Promise.all([
        getAllPrescriptions(),
        getAllMedicines()
      ]);
      const sortedPresData = presData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPrescriptions(sortedPresData);
      setMedicines(medData);
    } catch (error) {
      toast.error('Failed to load prescriptions data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDispense = async (prescriptionId: number) => {
    if (!selectedPrescription) return;
    try {
      setIsDispensing(true);

      // Step 1: Deduct medicine quantities from inventory-service
      const deductPayload = selectedPrescription.items.map(item => ({
        medicineId: item.medicineId,
        quantityToDeduct: 1,
      }));
      await deductMedicines(deductPayload);

      // Step 2: Mark prescription as DISPENSED
      await updatePrescriptionStatus(prescriptionId, 'DISPENSED');
      toast.success('Prescription dispensed and inventory updated');
      
      // Update local state to reflect dispensed status without closing modal
      if (selectedPrescription) {
        setSelectedPrescription({ ...selectedPrescription, status: 'DISPENSED' });
      }
      
      setCollectedItems(new Set());
      fetchData();
    } catch (error) {
      toast.error('Failed to dispense prescription');
    } finally {
      setIsDispensing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toString().includes(searchTerm)
  );

  if (isLoading) return <Layout title="Prescription Management" subtitle="Synchronizing clinical pharmacological orders..."><div className="flex justify-center items-center h-64"><LoadingSpinner /></div></Layout>;

  return (
    <Layout
      title="Clinical Dispensing"
      subtitle="Strategic oversight and fulfillment of institutional pharmacological orders."
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Stats / Search */}
        <div className="bg-white rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 sm:p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 p-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Prescription Index</h2>
              <div className="flex items-center mt-3 space-x-6">
                <div className="flex items-center text-orange-600 font-bold text-xs uppercase tracking-widest">
                  <Clock className="w-4 h-4 mr-2" />
                  {prescriptions.filter(p => p.status === 'PENDING').length} Pending Orders
                </div>
                <div className="flex items-center text-emerald-600 font-bold text-xs uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {prescriptions.filter(p => p.status === 'DISPENSED').length} Fulfilled
                </div>
              </div>
            </div>

            <div className="w-full lg:w-96 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors z-10" />
              <Input
                type="text"
                placeholder="Search Patient, Doctor or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-bold text-gray-900 shadow-none hover:bg-gray-100"
              />
            </div>
          </div>
        </div>

        {/* Prescription List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrescriptions.length === 0 ? (
            <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 text-center flex flex-col items-center">
              <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <FileText className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-black text-gray-400 italic">No Matching Records Found</h3>
              <p className="text-sm font-black text-gray-300 uppercase tracking-widest mt-2 px-12 leading-relaxed">
                Refine your search parameters or check communication logs for new institutional orders.
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((p) => (
              <div 
                key={p.id} 
                className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-xl shadow-gray-200/30 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 group-hover:scale-150 p-20 ${p.status === 'PENDING' ? 'bg-orange-400' : 'bg-emerald-400'}`}></div>

                <div className="flex justify-between items-start mb-8 relative">
                  <div>
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                        ORD-{p.id.toString().padStart(4, '0')}
                      </span>
                      <span className="text-gray-400 font-bold text-[10px] uppercase tracking-tighter">{formatDate(p.createdAt)}</span>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 group-hover:text-primary transition-colors leading-tight">{p.patientName}</h4>
                  </div>
                  <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                    p.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100/50' : 
                    p.status === 'DISPENSED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : 
                    'bg-gray-50 text-gray-400 border border-gray-100/50'
                  }`}>
                    {p.status}
                  </div>
                </div>

                <div className="space-y-6 relative">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm border border-gray-50">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prescribed By</p>
                      <p className="font-bold text-gray-900 text-sm">Dr. {p.doctorName}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 group-hover:bg-primary/10 transition-colors">
                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">Clinical Diagnostics</p>
                    <p className="text-sm font-bold text-primary truncate italic">"{p.diagnosis}"</p>
                  </div>

                  <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                    <div className="flex -space-x-2 overflow-hidden px-1">
                      {p.items.slice(0, 3).map((_item, i) => (
                        <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-gray-50 grid place-items-center text-primary shadow-sm ring-1 ring-gray-100 shrink-0">
                          <Pill className="w-5 h-5 m-0" />
                        </div>
                      ))}
                      {p.items.length > 3 && (
                        <div className="h-10 w-10 rounded-full border-2 border-white bg-white grid place-items-center text-[10px] font-black text-gray-400 shadow-sm ring-1 ring-gray-100 shrink-0">
                          +{p.items.length - 3}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedPrescription(p);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary rounded-2xl px-6 h-12 transition-all active:scale-95 flex items-center"
                    >
                      Process Order <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-2xl border-none shadow-2xl">
          {/* Header */}
          <DialogHeader className="px-7 pt-6 pb-5 bg-white border-b border-gray-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full blur-3xl opacity-10 pointer-events-none ${selectedPrescription?.status === 'PENDING' ? 'bg-orange-400' : 'bg-emerald-400'}`}></div>
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">
                    ORD-{selectedPrescription?.id.toString().padStart(4, '0')}
                  </span>
                  <span className="text-gray-400 font-bold text-[10px] italic flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {selectedPrescription && formatDate(selectedPrescription.createdAt)}
                  </span>
                </div>
                <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">Prescription Review</DialogTitle>
                <DialogDescription className="text-gray-400 text-xs mt-0.5">Verify details before dispensing.</DialogDescription>
              </div>
              <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                selectedPrescription?.status === 'PENDING'
                  ? 'bg-orange-50 text-orange-600 border border-orange-100'
                  : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
              }`}>{selectedPrescription?.status}</span>
            </div>
          </DialogHeader>

          {/* Body: two columns */}
          <div className="flex overflow-hidden" style={{ maxHeight: 'calc(80vh - 160px)' }}>

            {/* ── Left sidebar: clinical context ── */}
            <div className="w-[300px] shrink-0 border-r border-gray-100 overflow-y-auto p-5 space-y-4 bg-gray-50/40">

              {/* Patient */}
              <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-base shrink-0">
                  {selectedPrescription?.patientName?.[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Patient</p>
                  <p className="text-sm font-black text-gray-900 truncate">{selectedPrescription?.patientName}</p>
                </div>
              </div>

              {/* Doctor */}
              <div className="flex items-center space-x-3 p-4 bg-primary/5 rounded-xl border border-primary/10 shadow-sm">
                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-black text-primary/60 uppercase tracking-widest">Prescribing Doctor</p>
                  <p className="text-sm font-black text-primary truncate">Dr. {selectedPrescription?.doctorName}</p>
                </div>
              </div>

              {/* Clinical details */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                      <div className="w-2 h-0.5 bg-gray-200 mr-2 rounded-full" /> Diagnosis
                    </p>
                    <p className="text-base font-black text-gray-900 leading-relaxed">{selectedPrescription?.diagnosis}</p>
                  </div>
                  <div className="border-t border-gray-50 pt-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center">
                      <div className="w-2 h-0.5 bg-gray-200 mr-2 rounded-full" /> Reported Symptoms
                    </p>
                    <p className="text-base text-gray-700 italic leading-relaxed font-bold">"{selectedPrescription?.symptoms}"</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-5 bg-slate-900 rounded-2xl text-white space-y-3 shadow-lg shadow-slate-200/50">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pharmacological Instruction</p>
                </div>
                <p className="text-base font-bold italic text-gray-100 leading-relaxed">
                  {selectedPrescription?.instruction || "Proceed with standard dispensing protocols."}
                </p>
              </div>

              {/* Note */}
              {selectedPrescription?.note && (
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
                  <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">Consultation Note</p>
                    <p className="text-base text-amber-900 italic leading-relaxed font-bold">"{selectedPrescription.note}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right: medicine checklist ── */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center">
                  <FlaskConical className="w-4 h-4 mr-2" /> Medications ({selectedPrescription?.items.length})
                </h4>
                <span className="text-xs font-black text-emerald-600 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  {collectedItems.size} / {selectedPrescription?.items.length} collected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {selectedPrescription?.items.map((item, idx) => {
                  const medicineData = medicines.find(m => m.id === item.medicineId) ||
                                       medicines.find(m => m.medicineName.toLowerCase() === item.drugName.toLowerCase());
                  const isCollected = collectedItems.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        const next = new Set(collectedItems);
                        if (next.has(idx)) next.delete(idx); else next.add(idx);
                        setCollectedItems(next);
                      }}
                      className={`p-4 rounded-2xl border-2 cursor-pointer select-none transition-all duration-200 ${
                        isCollected
                          ? 'border-emerald-400 bg-emerald-50/40 shadow-sm shadow-emerald-100'
                          : 'border-gray-100 bg-white hover:border-primary/30 hover:shadow-md'
                      }`}
                    >
                      {/* Card header: image + name + checkbox */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`h-14 w-14 rounded-xl overflow-hidden grid place-items-center shrink-0 border ${isCollected ? 'border-emerald-200 bg-white' : 'border-gray-100 bg-gray-50'}`}>
                          {medicineData?.imageUrl && (
                            <img
                              src={`${API_BASE_URL}${medicineData.imageUrl}`}
                              alt={item.drugName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                (img.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                              }}
                            />
                          )}
                          <Pill className={`w-7 h-7 text-gray-300 ${medicineData?.imageUrl ? 'hidden' : ''}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 leading-tight truncate">{item.drugName}</p>
                          <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                            isCollected ? 'bg-emerald-100 text-emerald-700' : 'bg-primary/5 text-primary'
                          }`}>
                            {medicineData?.medicineType || 'PHARM'}
                          </span>
                        </div>
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                          isCollected ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200' : 'bg-gray-100 text-gray-300'
                        }`}>
                          {isCollected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </div>
                      </div>

                      {/* Dosing grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Dosage</p>
                          <p className="text-xs font-black text-gray-800">{item.dosage}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Frequency</p>
                          <p className="text-xs font-black text-gray-800">{item.frequency}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-2.5 py-2 border border-gray-100">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Duration</p>
                          <p className="text-xs font-black text-gray-800">{item.durationDays} days</p>
                        </div>
                        <div className="bg-primary/5 rounded-lg px-2.5 py-2 border border-primary/10">
                          <p className="text-[8px] font-black text-primary/60 uppercase mb-0.5">Route</p>
                          <p className="text-xs font-black text-primary">{item.route}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 gap-3">
            {selectedPrescription?.status === 'PENDING' && (
              <>
                <div className="flex-1 flex items-center space-x-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${selectedPrescription.items.length > 0 ? (collectedItems.size / selectedPrescription.items.length) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-gray-500 whitespace-nowrap">
                    {collectedItems.size}/{selectedPrescription.items.length} collected
                  </span>
                </div>
                <Button
                  onClick={() => handleDispense(selectedPrescription.id)}
                  disabled={isDispensing || collectedItems.size < selectedPrescription.items.length}
                  className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-40 px-6"
                >
                  {isDispensing
                    ? <Loader2 className="animate-spin h-4 w-4" />
                    : <><CheckCircle2 className="w-4 h-4 mr-2" />Authorize & Dispense</>
                  }
                </Button>
              </>
            )}
            {selectedPrescription?.status === 'DISPENSED' && (
              <Button onClick={handlePrint} className="h-10 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black uppercase tracking-widest px-6 flex items-center shadow-lg shadow-primary/20">
                <Printer className="w-4 h-4 mr-2" /> Print Receipt
              </Button>
            )}
            <Button variant="outline" onClick={() => { setIsDetailModalOpen(false); setCollectedItems(new Set()); }}
              className="h-10 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-widest px-6">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hidden Receipt for Printing */}
      {selectedPrescription && (
        <div className="print-only-container">
          <PrescriptionReceipt prescription={selectedPrescription} />
        </div>
      )}
    </Layout>
  );
}
