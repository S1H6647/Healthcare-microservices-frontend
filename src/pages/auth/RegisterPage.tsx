import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { register } from '../../api/auth';
import { ShieldCheck, User, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.literal('PATIENT'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'PATIENT'
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await register(data);
      toast.success('Registration successful! Please login to your new account.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <img
          src="/images/auth-bg.png"
          alt="Healthcare background"
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-110"
        />
        <div className="relative z-10 flex flex-col justify-center px-20 text-white">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">HealthSync</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Join the Future of <br />
            <span className="text-primary-100 italic">Digital Healthcare.</span>
          </h1>
          <p className="text-xl text-primary-50/80 leading-relaxed max-w-lg mb-10">
            Create your account today and experience a unified platform designed for both patients and healthcare professionals.
          </p>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-white/10 p-2 rounded-lg mt-1"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <h4 className="font-bold">Verified Providers</h4>
                <p className="text-sm text-primary-100/70">Access a curated network of board-certified doctors.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 py-12 overflow-y-auto">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center space-x-2 mb-10 text-primary">
            <ShieldCheck className="h-8 w-8" />
            <span className="text-2xl font-black">HealthSync</span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-500 mb-10">Start your journey with us by filling in the details below.</p>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">First Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    {...formRegister('firstName')}
                    placeholder="John"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                  />
                </div>
                {errors.firstName && <p className="mt-2 text-xs text-red-600 font-bold">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Last Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                  </div>
                  <input
                    type="text"
                    {...formRegister('lastName')}
                    placeholder="Doe"
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                  />
                </div>
                {errors.lastName && <p className="mt-2 text-xs text-red-600 font-bold">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  {...formRegister('email')}
                  placeholder="name@example.com"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                />
              </div>
              {errors.email && <p className="mt-2 text-xs text-red-600 font-bold">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  {...formRegister('phone')}
                  placeholder="9812345678"
                  className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                />
              </div>
              {errors.phone && <p className="mt-2 text-xs text-red-600 font-bold">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...formRegister('password')}
                  placeholder="••••••••"
                  className="block w-full pl-11 pr-12 py-3 bg-gray-50 border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-600 font-bold">{errors.password.message}</p>}
            </div>

{/* Role is implicitly PATIENT for public signup */}
            <input type="hidden" {...formRegister('role')} value="PATIENT" />

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                <>
                  Create Account <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            Already have a HealthSync account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline underline-offset-4 decoration-2">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}