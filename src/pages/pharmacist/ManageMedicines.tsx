import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getAllMedicines, addMedicine, updateMedicine, deleteMedicine } from '../../api/inventory';
import type { MedicineResponse } from '../../api/inventory';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit2, Trash2, Upload, Package, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
    DialogDescription
} from "@/components/ui/dialog";

const medicineSchema = z.object({
    medicineName: z.string().min(2, "Name must be at least 2 characters"),
    shortDescription: z.string().min(10, "Description must be at least 10 characters"),
    quantity: z.number().min(0, "Quantity cannot be negative"),
    medicineType: z.enum(['TABLETS', 'LIQUID']),
    dosage: z.string().min(1, "Dosage is required"),
    dosageType: z.enum(['MG', 'ML', 'MCG', 'TABLET', 'SYRUP']),
});

type MedicineFormData = z.infer<typeof medicineSchema>;

export default function ManageMedicines() {
    const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<MedicineFormData>({
        resolver: zodResolver(medicineSchema),
        defaultValues: {
            medicineName: '',
            shortDescription: '',
            quantity: 0,
            medicineType: 'TABLETS',
            dosage: '',
            dosageType: 'MG',
        },
    });

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const data = await getAllMedicines();
            setMedicines(data);
        } catch (error) {
            console.error('Error fetching medicines:', error);
            toast.error('Failed to load medicines');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (medicine?: MedicineResponse) => {
        if (medicine) {
            setEditingId(medicine.id);
            form.reset({
                medicineName: medicine.medicineName,
                shortDescription: medicine.shortDescription,
                quantity: medicine.quantity,
                medicineType: medicine.medicineType,
                dosage: medicine.dosage || '',
                dosageType: medicine.dosageType || 'MG',
            });
            setPreviewUrl(medicine.imageUrl);
        } else {
            setEditingId(null);
            form.reset({
                medicineName: '',
                shortDescription: '',
                quantity: 0,
                medicineType: 'TABLETS',
                dosage: '',
                dosageType: 'MG',
            });
            setPreviewUrl(null);
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: MedicineFormData) => {
        if (!editingId && !selectedFile) {
            toast.error('Please select an image');
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingId) {
                await updateMedicine(editingId, data, selectedFile || undefined);
                toast.success('Medicine updated successfully');
            } else {
                await addMedicine(data, selectedFile!);
                toast.success('Medicine added successfully');
            }
            setIsModalOpen(false);
            fetchMedicines();
        } catch (error) {
            console.error('Error saving medicine:', error);
            toast.error(editingId ? 'Failed to update medicine' : 'Failed to add medicine');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;
        try {
            await deleteMedicine(deletingId);
            toast.success('Medicine deleted successfully');
            setMedicines(medicines.filter(m => m.id !== deletingId));
            setIsDeleteModalOpen(false);
            setDeletingId(null);
        } catch (error) {
            toast.error('Failed to delete medicine');
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout
            title="Inventory Management"
            subtitle="Track and manage clinical supplies, pharmaceutical stocks, and medical inventory."
        >
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-8 sm:px-10">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Medicine Stock</h3>
                            <p className="text-gray-500 font-medium text-sm mt-1">Real-time inventory levels and details.</p>
                        </div>
                        <div className="flex items-center space-x-4 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                                <Input
                                    type="text"
                                    placeholder="Search medicines..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 bg-gray-50/50 border-transparent rounded-2xl focus:bg-white transition-all shadow-none"
                                />
                            </div>
                            <Button
                                onClick={() => handleOpenModal()}
                                className="bg-primary hover:bg-primary/90 text-white h-11 px-6 rounded-2xl font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New
                            </Button>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="px-8 pb-12">
                        {filteredMedicines.length === 0 ? (
                            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-bold italic text-lg">
                                    No matching supplies found in catalog.
                                </p>
                                <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest font-black">Try Adjusting Search</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredMedicines.map((medicine) => (
                                    <div key={medicine.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col">
                                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                                            <img
                                                src={medicine.imageUrl}
                                                alt={medicine.medicineName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${medicine.medicineType === 'TABLETS'
                                                    ? 'bg-blue-500/80 text-white'
                                                    : 'bg-teal-500/80 text-white'
                                                    }`}>
                                                    {medicine.medicineType}
                                                </span>
                                            </div>
                                            {medicine.quantity < 10 && (
                                                <div className="absolute top-4 right-4">
                                                    <span className="bg-red-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center animate-pulse">
                                                        Low Stock
                                                    </span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 backdrop-blur-[2px]">
                                                <Button
                                                    size="icon"
                                                    onClick={() => handleOpenModal(medicine)}
                                                    className="h-12 w-12 bg-white text-primary hover:bg-primary hover:text-white rounded-2xl transition-all shadow-xl"
                                                >
                                                    <Edit2 className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(medicine.id)}
                                                    className="h-12 w-12 bg-white text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-xl"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="p-8 flex-1 flex flex-col">
                                            <h4 className="text-xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-1 mb-3">
                                                {medicine.medicineName}
                                            </h4>
                                            <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6 flex-1">
                                                {medicine.shortDescription}
                                            </p>

                                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock</p>
                                                    <div className="flex items-center">
                                                        <span className={`text-xl font-black ${medicine.quantity < 10 ? 'text-red-500' : 'text-gray-900'}`}>
                                                            {medicine.quantity} {medicine.medicineType === 'TABLETS' ? 'u' : 'ml'}
                                                        </span>
                                                        <Package className={`w-3 h-3 ml-2 ${medicine.quantity < 10 ? 'text-red-300' : 'text-gray-300'}`} />
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Catalog ID & Dosage</p>
                                                    <p className="text-xs font-bold text-gray-900 font-mono">#INV-{medicine.id.toString().padStart(4, '0')}</p>
                                                    <p className="text-[10px] font-black text-primary mt-0.5">{medicine.dosage} {medicine.dosageType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                    <DialogHeader className="px-10 py-8 border-b border-gray-100 bg-white">
                        <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight">
                            {editingId ? 'Edit Material Supply' : 'Register New Inventory'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 font-medium text-base mt-2 leading-relaxed">
                            Ensure clinical data accuracy for pharmaceutical tracking.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-10">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <FormField
                                            control={form.control}
                                            name="medicineName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Trade Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Amoxicillin 500mg" {...field} className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-black" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="medicineType"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Composition Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-bold">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                                            <SelectItem value="TABLETS" className="rounded-xl font-bold py-3">Tablets / Capsules</SelectItem>
                                                            <SelectItem value="LIQUID" className="rounded-xl font-bold py-3">Liquid / Syrup</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px] font-black" />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="quantity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Current Stock</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type="number"
                                                                {...field}
                                                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                                className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-black pl-5 pr-12"
                                                            />
                                                            <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px] font-black" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1 mb-2">Visual Documentation</label>
                                        <div
                                            className="relative flex-1 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100 overflow-hidden group/upload cursor-pointer hover:border-primary/50 transition-all flex flex-col items-center justify-center text-center p-4 min-h-[220px]"
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                        >
                                            {previewUrl ? (
                                                <>
                                                    <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4">
                                                        <Upload className="w-8 h-8 mb-2" />
                                                        <span className="text-xs font-black uppercase tracking-widest">Swap Image</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center space-y-3">
                                                    <div className="p-4 bg-white rounded-2xl shadow-sm text-primary group-hover/upload:scale-110 transition-transform">
                                                        <Upload className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-700">Select Image</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">JPG, PNG, WEBP</p>
                                                    </div>
                                                </div>
                                            )}
                                            <input
                                                id="file-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <FormField
                                        control={form.control}
                                        name="dosage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Dosage Amount</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. 500" {...field} className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-black" />
                                                </FormControl>
                                                <FormMessage className="text-[10px] font-black" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="dosageType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Dosage Unit</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none font-bold">
                                                            <SelectValue placeholder="Select unit" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                                        <SelectItem value="MG" className="rounded-xl font-bold py-3">MG (Milligrams)</SelectItem>
                                                        <SelectItem value="ML" className="rounded-xl font-bold py-3">ML (Milliliters)</SelectItem>
                                                        <SelectItem value="MCG" className="rounded-xl font-bold py-3">MCG (Micrograms)</SelectItem>
                                                        <SelectItem value="TABLET" className="rounded-xl font-bold py-3">Tablet(s)</SelectItem>
                                                        <SelectItem value="SYRUP" className="rounded-xl font-bold py-3">Syrup Bottles</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] font-black" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="shortDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 ml-1">Clinical Notes & Usage</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter brief pharmacological details or dosage instructions..."
                                                    className="rounded-[1.5rem] bg-gray-50/50 border-transparent focus:bg-white transition-all shadow-none min-h-[120px] p-5 font-medium leading-relaxed"
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
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="min-w-[180px] h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            editingId ? 'Update Identity' : 'Register Supply'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="max-w-md p-10 rounded-[2.5rem] text-center border-none shadow-2xl">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100/50 rounded-full mb-8">
                        <Trash2 className="h-12 w-12 text-red-500" />
                    </div>
                    <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight mb-4">Finalize Deletion?</DialogTitle>
                    <DialogDescription className="text-gray-500 font-medium text-lg leading-relaxed mb-10">
                        This action will permanently remove this medical supply from your inventory. This record cannot be recovered.
                    </DialogDescription>
                    <div className="flex flex-col space-y-3">
                        <Button
                            onClick={confirmDelete}
                            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-[1.25rem] font-black shadow-xl shadow-red-500/30 transition-all active:scale-95"
                        >
                            Confirm Deletion
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="w-full h-14 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-[1.25rem] font-bold transition-all shadow-none"
                        >
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Layout>
    );
}
