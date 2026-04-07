import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { API_BASE_URL } from '../../api/axios';
import { getPrescriptionsByDoctor, createPrescription } from '../../api/prescriptions';
import { getAppointmentsByDoctor } from '../../api/appointments';
import { getAllMedicines, type MedicineResponse } from '../../api/inventory';
import { getMyDoctorProfile } from '../../api/doctors';
import type { Prescription, Appointment, CreatePrescriptionRequest } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Plus, Search, FileText, Pill, Trash2, Loader2, User } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDate } from '../../utils/formatDate';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const prescriptionSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  appointmentId: z.string().nullable(),
  diagnosis: z.string().min(2, "Diagnosis is required"),
  instruction: z.string().min(1, "Instructions are required"),
  visitDate: z.string().min(1, "Visit date is required"),
  symptoms: z.string().min(1, "Symptoms are required"),
  notes: z.string().optional(),
  items: z.array(z.object({
    medicineId: z.string().min(1, "Medicine is required"),
    dosage: z.string().min(1, "Dosage is required"),
    frequency: z.string().min(1, "Frequency is required"),
    durationDays: z.string().min(1, "Duration is required"),
    route: z.string().min(1, "Route is required")
  })).min(1, "At least one medicine is required")
});

type PrescriptionFormData = z.infer<typeof prescriptionSchema>;
// API_BASE_URL is imported from axios utility

export default function DoctorPrescriptions() {
  const location = useLocation();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doctorId, setDoctorId] = useState<number | null>(null);
  const [doctorName, setDoctorName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: {
      patientId: '',
      appointmentId: '',
      diagnosis: '',
      instruction: '',
      visitDate: new Date().toISOString().split('T')[0],
      symptoms: '',
      notes: '',
      items: [{ medicineId: '', dosage: '', frequency: '', durationDays: '', route: 'ORAL' }]
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items" as const
  });

  useEffect(() => {
    const init = async () => {
      try {
        const me = await getMyDoctorProfile();
        setDoctorId(me.id);
        setDoctorName(`${me.firstName} ${me.lastName}`);

        const [presData, appData, medData] = await Promise.all([
          getPrescriptionsByDoctor(me.id),
          getAppointmentsByDoctor(me.id),
          getAllMedicines()
        ]);

        const sortedPrescriptions = presData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPrescriptions(sortedPrescriptions);
        setAppointments(appData.filter(a => a.status === 'COMPLETED'));
        setMedicines(medData);

        // Handle navigation from appointment card
        if (location.state?.selectedAppointmentId) {
          const selectedAppt = appData.find(a => a.id === location.state.selectedAppointmentId);
          form.reset({
            patientId: location.state.selectedPatientId.toString(),
            appointmentId: location.state.selectedAppointmentId.toString(),
            diagnosis: '',
            instruction: '',
            visitDate: selectedAppt?.appointmentDate || new Date().toISOString().split('T')[0],
            symptoms: '',
            notes: '',
            items: [{ medicineId: '', dosage: '', frequency: '', durationDays: '', route: 'ORAL' }]
          });
          setIsModalOpen(true);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [location.state, form]);

  const onSubmit = async (data: PrescriptionFormData) => {
    setIsSubmitting(true);
    try {
      const selectedAppt = appointments.find(a => a.patientId === parseInt(data.patientId));
      const patientName = selectedAppt?.patientName || '';

      const request: CreatePrescriptionRequest = {
        patientId: parseInt(data.patientId),
        patientName,
        doctorId: doctorId!,
        doctorName,
        instruction: data.instruction,
        visitDate: data.visitDate,
        symptoms: data.symptoms,
        diagnosis: data.diagnosis,
        note: data.notes || undefined,
        items: data.items.map(item => ({
          medicineId: parseInt(item.medicineId),   // ← inventory-service ID travels with the request
          drugName: medicines.find(m => m.id === parseInt(item.medicineId))?.medicineName || '',
          dosage: item.dosage,
          frequency: item.frequency,
          durationDays: parseInt(item.durationDays),
          route: item.route
        }))
      };

      const newPres = await createPrescription(request);

      // Ensure items are present for immediate UI feedback if backend returns partial DTO
      if (!newPres.items || newPres.items.length === 0) {
        newPres.items = request.items.map((item) => ({
          id: 0,
          medicineId: item.medicineId,
          drugName: item.drugName,
          dosage: item.dosage,
          frequency: item.frequency,
          durationDays: item.durationDays,
          route: item.route,
          instructions: ""
        }));
      }

      setPrescriptions([newPres, ...prescriptions]);
      toast.success('Prescription created successfully');
      setIsModalOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription. Please check backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Form Validation Errors:', errors);
    const firstError = Object.values(errors)[0] as any;
    if (firstError?.message) {
      toast.error(`Validation Error: ${firstError.message}`);
    } else if (typeof firstError === 'object') {
      toast.error('Please complete all medicine selection fields');
    }
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <Layout title="Prescriptions"><LoadingSpinner /></Layout>;

  return (
    <Layout
      title="Medical Prescriptions"
      subtitle="Digital prescription management for patient pharmacological care."
    >
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-8 sm:px-10 border-b border-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Prescription Records</h3>
              <p className="text-gray-500 font-medium text-sm mt-1">History of pharmacological orders issued.</p>
            </div>
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder="Search by patient or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 bg-gray-50/50 border-transparent rounded-2xl focus:bg-white transition-all shadow-none"
                />
              </div>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white h-11 px-6 rounded-2xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bold italic text-lg">
                No prescriptions recorded found.
              </p>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-black">Issue new orders via New Prescription</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredPrescriptions.map((p) => (
                <div key={p.id} className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                          PRES-{p.id.toString().padStart(4, '0')}
                        </span>
                        <span className="text-gray-400 font-mono text-[10px]">{formatDate(p.createdAt)}</span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{p.patientName}</h4>
                    </div>
                    <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${p.status === 'PENDING' ? 'bg-orange-100 text-orange-600' :
                        p.status === 'DISPENSED' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                      {p.status}
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Clinical Diagnosis</p>
                    <p className="text-gray-700 font-bold">{p.diagnosis}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Medicines Ordered</p>
                    {p.items.map((item, idx) => (
                      <div key={idx} className="flex items-start bg-gray-50/50 p-4 rounded-2xl">
                        <Pill className="w-5 h-5 text-primary mr-4 shrink-0" />
                        <div>
                          <p className="font-bold text-gray-900 leading-tight">{item.drugName || "Unknown Medicine"}</p>
                          <p className="text-xs text-gray-500 mt-1">{item.dosage}</p>
                        </div>
                      </div>
                    ))}
                    {p.items.length === 0 && (
                      <p className="text-xs text-gray-400 italic">No medicines recorded.</p>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-50 flex justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedPrescription(p);
                        setIsDetailModalOpen(true);
                      }}
                      className="text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 rounded-xl px-6 h-10 transition-all active:scale-95"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="px-10 py-8 border-b border-gray-100 bg-white">
            <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight">Issue Prescription</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium text-base mt-2 leading-relaxed">
              Order pharmacological supplies for clinical patient care.
            </DialogDescription>
          </DialogHeader>

          <div className="p-10 max-h-[70vh] overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="patientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Select Patient</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!location.state?.selectedPatientId}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-bold">
                              <SelectValue placeholder="Select patient from appointments" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-gray-100 shadow-xl max-h-[300px]">
                            {appointments.map(a => (
                              <SelectItem key={a.id} value={a.patientId.toString()} className="rounded-xl font-bold py-3">
                                <div className="flex flex-col">
                                  <span>{a.patientName}</span>
                                  <span className="text-[10px] text-gray-400 font-mono">Appt: {formatDate(a.appointmentDate)}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px] font-black" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Visit Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-black" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-black" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Symptoms</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe patient symptoms..." {...field} className="rounded-[1.5rem] bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none min-h-[80px] p-5 font-medium leading-relaxed" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-black" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Clinical Diagnosis</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Chronic Hypertension" {...field} className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-black" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-black" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instruction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">General Instructions</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Take after meals" {...field} className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-black" />
                      </FormControl>
                      <FormMessage className="text-[10px] font-black" />
                    </FormItem>
                  )}
                />

                <div className="space-y-8">
                  {/* Header Style from Image */}
                  <div className="flex items-center justify-between border-b border-gray-50 pb-6 pt-2">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-1.5 bg-primary/20 rounded-full" />
                      <h3 className="text-[13px] font-black uppercase tracking-[0.3em] text-gray-400/80">Pharmacological Regimen</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/5 text-primary text-[11px] font-black px-6 py-2.5 rounded-full border border-primary/10 tracking-[0.05em] shadow-sm">
                        {fields.length} {fields.length === 1 ? 'COMPOUND' : 'COMPOUNDS'}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ medicineId: '', dosage: '', frequency: '', durationDays: '', route: 'ORAL' })}
                        className="rounded-2xl h-11 border-primary/20 text-primary font-black text-[11px] active:scale-95 px-6 bg-white hover:bg-primary/5 transition-all shadow-sm"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Medicine
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {fields.map((field, index) => {
                      const selectedMedId = form.watch(`items.${index}.medicineId`);
                      const selectedMed = medicines.find(m => m.id === parseInt(selectedMedId));

                      return (
                        <div key={field.id} className="relative bg-white rounded-[2.5rem] p-10 border border-gray-100/80 shadow-2xl shadow-gray-200/20 group animate-in slide-in-from-top-4 duration-500">
                          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
                            
                            {/* Left: Pill Image & Basic Info */}
                            <div className="flex items-start space-x-8 flex-1 w-full">
                              <div className="w-28 h-28 rounded-[2rem] bg-gray-100 flex items-center justify-center shrink-0 border border-gray-50 shadow-inner overflow-hidden">
                                {selectedMed?.imageUrl ? (
                                  <img
                                    src={`${API_BASE_URL}${selectedMed.imageUrl}`}
                                    alt="Drug"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=Pill';
                                    }}
                                  />
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <Pill className="w-10 h-10 text-gray-300 mb-1" />
                                    <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Pill</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col pt-2 min-w-0 flex-1">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.medicineId`}
                                  render={({ field }) => (
                                    <div className="mb-4">
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="h-auto p-0 border-none bg-transparent shadow-none focus:ring-0 w-full inline-block">
                                            <div className="flex flex-col items-start text-left">
                                              {selectedMed ? (
                                                <h4 className="text-3xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors truncate w-full">
                                                  {selectedMed.medicineName}
                                                </h4>
                                              ) : (
                                                <h4 className="text-2xl font-black text-gray-300 leading-tight italic">Select Drug...</h4>
                                              )}
                                            </div>
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-3xl border-gray-100 shadow-2xl max-h-[400px] w-[400px] p-2">
                                          {medicines.map(m => (
                                            <SelectItem key={m.id} value={m.id.toString()} className="rounded-2xl font-bold py-5 px-5 focus:bg-primary/5 transition-colors mb-1">
                                              <div className="flex items-center space-x-5">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-50 shadow-sm">
                                                  <img src={`${API_BASE_URL}${m.imageUrl}`} alt={m.medicineName} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                  <span className="text-gray-900 text-base font-black truncate">{m.medicineName}</span>
                                                  <span className="text-xs text-primary font-black uppercase tracking-widest mt-1">{m.medicineType} • {m.dosage}{m.dosageType}</span>
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                />
                                
                                <div className="flex items-center space-x-3">
                                  <span className="px-5 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.1em] rounded-full border border-primary/10">
                                    {selectedMed?.medicineType || 'PHARMA'}
                                  </span>
                                  <span className="text-gray-400 font-bold text-[10px] italic">
                                    Order Compliance: <span className="text-gray-500 font-black not-italic">Standard</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Center: Dosing Blocks (Matching User Image) */}
                            <div className="flex flex-col space-y-3 w-full lg:w-auto min-w-[200px]">
                              {/* Dosage Block */}
                              <FormField
                                control={form.control}
                                name={`items.${index}.dosage`}
                                render={({ field }) => (
                                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/40">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Dosage</p>
                                    <Input placeholder="500mg" {...field} className="h-6 p-0 border-none bg-transparent shadow-none focus-visible:ring-0 text-gray-900 text-lg font-black" />
                                  </div>
                                )}
                              />
                              {/* Frequency Block */}
                              <FormField
                                control={form.control}
                                name={`items.${index}.frequency`}
                                render={({ field }) => (
                                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/40">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Frequency</p>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-6 p-0 border-none bg-transparent shadow-none focus:ring-0 text-gray-900 text-lg font-black w-full text-left inline-flex">
                                          <SelectValue placeholder="BID" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-1">
                                        <SelectItem value="OD" className="rounded-xl font-bold">Once Daily (OD)</SelectItem>
                                        <SelectItem value="BID" className="rounded-xl font-bold">Twice Daily (BID)</SelectItem>
                                        <SelectItem value="TID" className="rounded-xl font-bold">Three Times (TID)</SelectItem>
                                        <SelectItem value="QID" className="rounded-xl font-bold">Four Times (QID)</SelectItem>
                                        <SelectItem value="HS" className="rounded-xl font-bold">At Bedtime (HS)</SelectItem>
                                        <SelectItem value="PRN" className="rounded-xl font-bold">As Needed (PRN)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              />
                              {/* Temporal Block */}
                              <FormField
                                control={form.control}
                                name={`items.${index}.durationDays`}
                                render={({ field }) => (
                                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-gray-200/40">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Temporal</p>
                                    <div className="flex items-center">
                                      <Input type="number" placeholder="3" {...field} className="h-6 p-0 border-none bg-transparent shadow-none focus-visible:ring-0 text-gray-900 text-lg font-black w-12" />
                                      <span className="text-gray-900 text-lg font-black ml-1">Days</span>
                                    </div>
                                  </div>
                                )}
                              />
                              {/* Route Block */}
                              <FormField
                                control={form.control}
                                name={`items.${index}.route`}
                                render={({ field }) => (
                                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 transition-all hover:bg-white hover:shadow-lg hover:shadow-primary/20">
                                    <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] mb-1">Route</p>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-6 p-0 border-none bg-transparent shadow-none focus:ring-0 text-primary text-lg font-black w-full text-left inline-flex uppercase">
                                          <SelectValue placeholder="ORAL" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="rounded-2xl border-gray-100 shadow-xl p-1">
                                        <SelectItem value="ORAL" className="rounded-xl font-bold">ORAL</SelectItem>
                                        <SelectItem value="IV" className="rounded-xl font-bold">IV</SelectItem>
                                        <SelectItem value="TOPICAL" className="rounded-xl font-bold">TOPICAL</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              />
                            </div>

                            {/* Right: Remove Button */}
                            <div className="flex flex-col justify-center">
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="h-14 w-14 bg-gray-50 text-gray-300 rounded-[1.25rem] border border-gray-100 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {fields.length === 0 && (
                      <div className="py-24 text-center bg-gray-50/30 rounded-[3rem] border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50">
                           <Pill className="w-10 h-10 text-gray-200" />
                        </div>
                        <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No compounds recorded</p>
                        <p className="text-gray-300 text-xs mt-2 italic">Add medicine to start the regimen</p>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">General Regimen Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Special precautions or follow-up instructions..."
                          className="rounded-[1.5rem] bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none min-h-[100px] p-5 font-medium leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-black" />
                    </FormItem>
                  )}
                />

                <div className="pt-6 flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 h-12 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all shadow-none"
                  >
                    Cancel Order
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[200px] h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center"
                  >
                    {isSubmitting ? <><Loader2 className="animate-spin h-5 w-5 mr-3" /> Processing...</> : 'Finalize Regimen'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Prescription Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
          <DialogHeader className="px-8 py-6 border-b border-gray-100 bg-white">
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">
                PRES-{selectedPrescription?.id.toString().padStart(4, '0')}
              </span>
              <span className="text-gray-400 font-mono text-xs italic">Issued on {selectedPrescription && formatDate(selectedPrescription.createdAt)}</span>
            </div>
            <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1">Prescription Review</DialogTitle>
            <DialogDescription className="text-gray-500 font-medium text-sm leading-relaxed max-w-xl">
              Detailed clinical pharmacological order for patient care.
            </DialogDescription>
          </DialogHeader>

          <div className="p-10 max-h-[75vh] overflow-y-auto">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="lg:w-[260px] space-y-6 shrink-0">
                <div className="space-y-4">
                  <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                      <User className="w-3 h-3 mr-2" /> Patient Entity
                    </p>
                    <p className="text-xl font-black text-gray-900 leading-tight">{selectedPrescription?.patientName}</p>
                  </div>
                  <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center">
                      Verified Provider
                    </p>
                    <p className="text-xl font-black text-gray-900 leading-tight">{selectedPrescription?.doctorName}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center">
                      <div className="w-3 h-1 bg-primary rounded-full mr-2"></div> Diagnostics
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Primary Diagnosis</p>
                        <p className="font-black text-gray-800 text-base leading-relaxed">{selectedPrescription?.diagnosis}</p>
                      </div>
                      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Presented Symptoms</p>
                        <p className="font-bold text-gray-700 italic text-base leading-relaxed">"{selectedPrescription?.symptoms}"</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center">
                      <div className="w-3 h-1 bg-primary rounded-full mr-2"></div> Instructions
                    </h4>
                    <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 shadow-sm">
                      <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2 font-mono">Regimen Notes</p>
                      <p className="text-base font-bold text-primary italic leading-relaxed">
                        {selectedPrescription?.instruction || "No general instructions provided."}
                      </p>
                    </div>
                  </div>

                  {selectedPrescription?.note && (
                    <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100/50">
                      <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-2">
                        Clinical Observations
                      </p>
                      <p className="text-gray-700 italic leading-relaxed text-base font-bold">"{selectedPrescription.note}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Medicines */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center">
                    <Pill className="w-4 h-4 mr-2" /> Medical Supplies
                  </h4>
                  <span className="text-[10px] font-black text-gray-300 uppercase">{selectedPrescription?.items.length} Items</span>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {selectedPrescription && selectedPrescription.items.length > 0 ? (
                    selectedPrescription.items.map((item, idx) => {
                      const medicineName = item.drugName || "Unknown Medicine";
                      const medicineData = medicines.find(m => m.id === item.medicineId) ||
                                         medicines.find(m => m.medicineName === medicineName);
                      return (
                        <div key={idx} className="flex flex-col p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/20 transition-all duration-300">
                          <div className="flex items-center space-x-4 mb-5 pb-5 border-b border-gray-50">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden grid place-items-center shrink-0 border border-gray-100 shadow-inner">
                              {medicineData?.imageUrl ? (
                                <img src={`${API_BASE_URL}${medicineData.imageUrl}`} alt={medicineName} className="w-full h-full object-cover" />
                              ) : (
                                <Pill className="w-8 h-8 text-gray-300" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <p className="font-black text-gray-900 text-base leading-tight truncate">{medicineName}</p>
                              <div className="flex items-center space-x-2 mt-1.5">
                                <span className="text-primary font-black uppercase text-[8px] tracking-[0.1em] px-2.5 py-1 bg-primary/5 rounded-full border border-primary/5">
                                  {medicineData?.medicineType || 'PHARMA'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50">
                              <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Dosage</p>
                              <p className="text-xs font-black text-emerald-900">{item.dosage}</p>
                            </div>
                            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                              <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Frequency</p>
                              <p className="text-xs font-black text-blue-900">{item.frequency || 'N/A'}</p>
                            </div>
                            <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                              <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest mb-0.5">Temporal</p>
                              <p className="text-xs font-black text-orange-900">{item.durationDays} Days</p>
                            </div>
                            <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
                              <p className="text-[8px] font-black text-purple-600 uppercase tracking-widest mb-0.5">Route</p>
                              <p className="text-xs font-black text-purple-900">{item.route}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                      <Pill className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 font-bold italic">No medicines recorded.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-6 border-t border-gray-100 bg-gray-50/30">
            <div className="flex justify-end">
              <Button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 px-10 font-black shadow-lg shadow-primary/20"
              >
                Done Reviewing
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
