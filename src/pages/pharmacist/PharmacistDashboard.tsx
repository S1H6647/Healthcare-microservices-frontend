import { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getAllMedicines } from '../../api/inventory';
import { getPharmacistProfile } from '../../api/pharmacists';
import { useAuthStore } from '../../store/authStore';
import type { MedicineResponse } from '../../api/inventory';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Pill, AlertTriangle, CheckCircle, Package, TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PharmacistDashboard() {
    const { email } = useAuthStore();
    const [medicines, setMedicines] = useState<MedicineResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [profileExists, setProfileExists] = useState<boolean | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const [medicinesData, profileData] = await Promise.all([
                    getAllMedicines(),
                    email ? getPharmacistProfile(email).catch(() => null) : Promise.resolve(null)
                ]);
                
                setMedicines(medicinesData);
                setProfileExists(!!profileData);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDashboardData();
    }, [email]);

    const lowStock = medicines.filter(m => m.quantity < 10);
    const totalStock = medicines.reduce((acc, m) => acc + m.quantity, 0);

    if (isLoading) {
        return (
            <Layout title="Inventory Dashboard" subtitle="Overview of pharmaceutical assets and supply chain health.">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title="Inventory Dashboard"
            subtitle="Comprehensive overview of clinical supplies, stock levels, and procurement requirements."
        >
            {profileExists === false && (
                <div className="mb-10 bg-indigo-50 border-l-4 border-indigo-500 p-8 rounded-[2rem] shadow-xl shadow-indigo-200/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-8 -mr-8 p-16 bg-indigo-100/50 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start md:items-center space-x-6">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                                <ShieldAlert className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-indigo-900 tracking-tight">
                                    Action Required: Complete Professional Profile
                                </h3>
                                <p className="text-indigo-700/80 font-medium mt-1 max-w-2xl leading-relaxed">
                                    Your institutional pharmacist credentials have not been finalized. Please complete your registration to authorize inventory operations and clinical dispensing.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/pharmacist/profile"
                            className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 whitespace-nowrap"
                        >
                            Complete Profile <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-primary/10 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                            <Pill className="h-6 w-6 text-primary group-hover:text-white" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Total SKUs</p>
                        <p className="text-4xl font-black text-gray-900 mt-2">{medicines.length}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-red-500/5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-2xl ${lowStock.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Low Stock Alert</p>
                        <p className="text-4xl font-black text-gray-900 mt-2">{lowStock.length}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                            <Package className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Inventory</p>
                        <p className="text-4xl font-black text-gray-900 mt-2">{totalStock}</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-xl hover:shadow-primary/5 transition-all">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-teal-100 text-teal-600 rounded-2xl">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Stock Health</p>
                        <p className="text-4xl font-black text-gray-900 mt-2">
                            {medicines.length > 0 ? Math.round(((medicines.length - lowStock.length) / medicines.length) * 100) : 100}%
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
                            <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                            Critical Replenishment Required
                        </h4>
                        <Link to="/pharmacist/medicines" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">View All</Link>
                    </div>
                    <div className="p-8 space-y-6">
                        {lowStock.length === 0 ? (
                            <p className="text-gray-500 font-medium italic text-center py-10">All stock levels are optimal. Well done!</p>
                        ) : (
                            lowStock.slice(0, 5).map(m => (
                                <div key={m.id} className="flex items-center justify-between group">
                                    <div className="flex items-center">
                                        <img src={m.imageUrl} alt={m.medicineName} className="h-10 w-10 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow" />
                                        <div className="ml-4">
                                            <p className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{m.medicineName}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{m.medicineType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-red-500">{m.quantity}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Remaining</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center">
                            <TrendingUp className="h-5 w-5 text-primary mr-3" />
                            Latest Inventory Additions
                        </h4>
                        <Link to="/pharmacist/medicines" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">Inventory List</Link>
                    </div>
                    <div className="p-8 space-y-6">
                        {medicines.length === 0 ? (
                            <p className="text-gray-500 font-medium italic text-center py-10">No items registered in catalog.</p>
                        ) : (
                            medicines.slice(0, 5).reverse().map(m => (
                                <div key={m.id} className="flex items-center justify-between group">
                                    <div className="flex items-center">
                                        <img src={m.imageUrl} alt={m.medicineName} className="h-10 w-10 rounded-xl object-cover shadow-sm group-hover:shadow-md transition-shadow" />
                                        <div className="ml-4">
                                            <p className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors">{m.medicineName}</p>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{m.medicineType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-gray-900">{m.quantity}</p>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Registered Unit</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
