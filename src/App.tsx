import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePatients from './pages/admin/ManagePatients';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageAppointments from './pages/admin/ManageAppointments';
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import ManageMedicines from './pages/pharmacist/ManageMedicines';
import PharmacistProfile from './pages/pharmacist/PharmacistProfile';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';
import ManageReceptionists from './pages/admin/ManageReceptionists';
import ManagePharmacists from './pages/admin/ManagePharmacists';
import ManagePrescriptions from './pages/pharmacist/ManagePrescriptions';
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistAppointments from './pages/receptionist/ReceptionistAppointments';
import BookAppointmentPage from './pages/receptionist/BookAppointmentPage';
import ReceptionistProfile from './pages/receptionist/ReceptionistProfile';
import AdminProfile from './pages/admin/AdminProfile';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient routes */}
            <Route path="/patient" element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
            </Route>

            {/* Doctor routes */}
            <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="appointments" element={<DoctorAppointments />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="patients" element={<ManagePatients />} />
              <Route path="doctors" element={<ManageDoctors />} />
              <Route path="appointments" element={<ManageAppointments />} />
              <Route path="receptionists" element={<ManageReceptionists />} />
              <Route path="pharmacists" element={<ManagePharmacists />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Receptionist routes */}
            <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['RECEPTIONIST']} />}>
              <Route path="dashboard" element={<ReceptionistDashboard />} />
              <Route path="appointments" element={<ReceptionistAppointments />} />
              <Route path="book-appointment" element={<BookAppointmentPage />} />
              <Route path="profile" element={<ReceptionistProfile />} />
            </Route>
            {/* Pharmacist routes */}
            <Route path="/pharmacist" element={<ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']} />}>
              <Route path="dashboard" element={<PharmacistDashboard />} />
              <Route path="medicines" element={<ManageMedicines />} />
              <Route path="prescriptions" element={<ManagePrescriptions />} />
              <Route path="profile" element={<PharmacistProfile />} />
            </Route>

            {/* Default route */}
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;