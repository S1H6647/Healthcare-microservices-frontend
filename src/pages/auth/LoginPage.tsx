import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'react-hot-toast';
import { login } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import { ShieldCheck, Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login: storeLogin } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await login(data);
      localStorage.setItem('token', response.token);
      let firstName = undefined;
      let lastName = undefined;
      try {
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        firstName = payload.firstName;
        lastName = payload.lastName;
      } catch (e) {
        console.error('Failed to parse JWT', e);
      }
      storeLogin(response.token, response.role as any, response.email, firstName, lastName);

      switch (response.role) {
        case 'PATIENT': navigate('/patient/dashboard'); break;
        case 'DOCTOR': navigate('/doctor/dashboard'); break;
        case 'ADMIN': navigate('/admin/dashboard'); break;
        case 'PHARMACIST': navigate('/pharmacist/dashboard'); break;
        case 'RECEPTIONIST': navigate('/receptionist/dashboard'); break;
        default: navigate('/login');
      }
      toast.success('Welcome back!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Verification failed. Please check your credentials.';
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
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay scale-110 animate-pulse-slow"
        />
        <div className="relative z-10 flex flex-col justify-center px-20 text-white">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">HealthSync</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Connecting Care, <br />
            <span className="text-primary-100 italic">One Beat at a Time.</span>
          </h1>
          <p className="text-xl text-primary-50/80 leading-relaxed max-w-lg mb-10">
            Access your secure portal to manage appointments, health records, and connect with your medical specialists in real-time.
          </p>
          <div className="flex items-center space-x-6 text-sm font-bold uppercase tracking-widest text-primary-100">
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div> Secured by 256-bit AES</div>
            <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div> HIPAA Compliant</div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-900/30 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center space-x-2 mb-10 text-primary">
            <ShieldCheck className="h-8 w-8" />
            <span className="text-2xl font-black">HealthSync</span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 mb-10">Enter your credentials to access your secure portal.</p>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
                Email or Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  {...register('identifier')}
                  placeholder="name@example.com or 9812345678"
                  className={`block w-full pl-11 pr-4 py-4 bg-gray-50 border-gray-200 rounded-2xl shadow-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm ${errors.identifier ? 'border-red-300 ring-1 ring-red-300 bg-red-50' : ''
                    }`}
                />
              </div>
              {errors.identifier && (
                <p className="mt-2 text-xs text-red-600 font-bold">{errors.identifier.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`block w-full pl-11 pr-12 py-4 bg-gray-50 border-gray-200 rounded-2xl shadow-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all sm:text-sm ${errors.password ? 'border-red-300 ring-1 ring-red-300 bg-red-50' : ''
                    }`}
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
              {errors.password && (
                <p className="mt-2 text-xs text-red-600 font-bold">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-5 w-5 text-primary border-gray-300 rounded-lg focus:ring-primary cursor-pointer"
              />
              <label htmlFor="remember" className="ml-3 text-sm font-medium text-gray-600 cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl text-sm font-black uppercase tracking-widest text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95 ${isLoading ? 'opacity-70 cursor-not-allowed shadow-none scale-100' : ''
                }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5 text-white" />
              ) : (
                <>
                  Enter Portal <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            New to HealthSync?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline underline-offset-4 decoration-2">
              Create a secure account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}