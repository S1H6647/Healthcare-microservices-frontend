import type { Prescription } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { Activity, MapPin, Phone, Mail, Award, CheckCircle2 } from 'lucide-react';

interface PrescriptionReceiptProps {
  prescription: Prescription;
}

export default function PrescriptionReceipt({ prescription }: PrescriptionReceiptProps) {
  return (
    <div className="print-only-container bg-white p-12 text-gray-900 font-sans leading-normal max-w-4xl mx-auto border-4 border-double border-gray-100 hidden print:block">
      {/* Header / Brand */}
      <div className="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Activity className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase">Modern Health</h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic flex items-center">
              <Award className="w-3 h-3 mr-1" /> Institutional Clinical Center
            </p>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Facility Details</p>
          <p className="text-sm font-bold flex items-center justify-end"><MapPin className="w-3 h-3 mr-1.5 opacity-40" /> 123 Healthcare Blvd, Medical District</p>
          <p className="text-sm font-bold flex items-center justify-end"><Phone className="w-3 h-3 mr-1.5 opacity-40" /> +1 (555) 999-0000</p>
          <p className="text-sm font-bold flex items-center justify-end"><Mail className="w-3 h-3 mr-1.5 opacity-40" /> contact@modernhealth.com</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-100">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Receipt Reference</p>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">PHARM-REC-{prescription.id.toString().padStart(6, '0')}</h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Issue Timestamp</p>
          <p className="font-bold text-gray-900">{formatDate(new Date().toISOString())}</p>
        </div>
      </div>

      {/* Subject Information */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Patient Subject</p>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{prescription.patientName}</h3>
            <p className="text-sm font-bold text-gray-500 italic mt-1">ID: REG-{prescription.patientId.toString().padStart(5, '0')}</p>
          </div>
        </div>
        <div className="space-y-4 text-right">
          <div className="border-r-4 border-gray-200 pr-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Providor</p>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Dr. {prescription.doctorName}</h3>
            <p className="text-sm font-bold text-gray-500 italic mt-1">Clinical Authorization</p>
          </div>
        </div>
      </div>

      {/* Medication Regimen Table */}
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <div className="h-1 w-12 bg-primary/20 rounded-full"></div>
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Pharmacological Regimen Summary</h4>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Dosage</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequency</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {prescription.items.map((item, idx) => (
              <tr key={idx}>
                <td className="py-5">
                  <p className="font-black text-gray-900 text-lg leading-tight">{item.drugName}</p>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-tight mt-1">{item.route}</p>
                </td>
                <td className="py-5 font-bold text-gray-800">{item.dosage}</td>
                <td className="py-5 font-bold text-gray-800 uppercase text-xs tracking-tight">{item.frequency}</td>
                <td className="py-5 font-black text-gray-900 text-right">{item.durationDays} Days</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Diagnostics / Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 italic">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 NOT-ITALIC not-italic">Clinical Diagnostics</p>
          <p className="text-sm font-bold text-gray-700 leading-relaxed">"{prescription.diagnosis}"</p>
        </div>
        {prescription.instruction && (
          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 italic">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 not-italic">Order Fulfillment Instructions</p>
            <p className="text-sm font-bold text-gray-700 leading-relaxed">"{prescription.instruction}"</p>
          </div>
        )}
      </div>

      {/* Verification / Footer */}
      <div className="flex justify-between items-end border-t border-gray-100 pt-10">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fulfillment Status</p>
              <h5 className="font-black text-emerald-600 uppercase tracking-tighter">Clinically Dispensed</h5>
            </div>
          </div>
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed max-w-xs">
            This document serves as an official institutional record of pharmaceutical fulfillment.
          </p>
        </div>
        <div className="text-center relative">
          <div className="w-48 h-12 border-b-2 border-gray-200 mb-2"></div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pharmacist Authorization</p>
          {/* Subtle Institutional Watermark for the Print */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 p-12 bg-primary/5 rounded-full blur-3xl -z-10 opacity-50"></div>
        </div>
      </div>
      
      {/* Print Footer */}
      <div className="mt-16 text-center">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Institutional Verification Required • System Generated Document</p>
      </div>
    </div>
  );
}
