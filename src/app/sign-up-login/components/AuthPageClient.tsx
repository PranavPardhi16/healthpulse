'use client';
import React, { useState, useEffect } from 'react';
import{ useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Heart,
  Activity,
  Wind,
  Thermometer,
  Stethoscope,
  User,
  Mail,
  Lock,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';


type Role = 'doctor' | 'patient';
type AuthMode = 'login' | 'signup';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  agreeTerms: boolean;
}

const DEMO_CREDENTIALS = [
  {
    role: 'doctor' as Role,
    label: 'Doctor',
    email: 'kavya.reddy@healthpulse.io',
    password: 'Doctor@HP2024',
    name: 'Dr. Kavya Reddy',
    destination: '/doctor-dashboard',
  },
  {
    role: 'patient' as Role,
    label: 'Patient',
    email: 'sarah.chen@healthpulse.io',
    password: 'Patient@HP2024',
    name: 'Sarah Chen',
    destination: '/patient-app',
  },
];

// Animated vitals preview for the left panel
function AnimatedVitalsPreview() {
  const [hrValue, setHrValue] = useState(72);
  const [spo2Value, setSpo2Value] = useState(98);
  const [tempValue, setTempValue] = useState(36.8);
  const [bpValue, setBpValue] = useState(118);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
      setHrValue((v) => Math.max(60, Math.min(90, v + (Math.floor(Date.now() % 7) - 3))));
      setSpo2Value((v) => Math.max(95, Math.min(100, v + (Math.floor(Date.now() % 3) - 1))));
      setTempValue((v) =>
        parseFloat(Math.max(36.2, Math.min(37.4, v + (Math.floor(Date.now() % 3) - 1) * 0.1)).toFixed(1))
      );
      setBpValue((v) => Math.max(108, Math.min(130, v + (Math.floor(Date.now() % 5) - 2))));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const vitals = [
    { icon: Heart, label: 'Heart Rate', value: `${hrValue}`, unit: 'BPM', color: 'hsl(0 84% 60%)' },
    { icon: Wind, label: 'SpO₂', value: `${spo2Value}`, unit: '%', color: 'hsl(199 89% 48%)' },
    { icon: Thermometer, label: 'Temperature', value: `${tempValue}`, unit: '°C', color: 'hsl(38 92% 50%)' },
    { icon: Activity, label: 'Systolic BP', value: `${bpValue}`, unit: 'mmHg', color: 'hsl(270 70% 65%)' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
      {vitals.map(({ icon: Icon, label, value, unit, color }) => (
        <div
          key={`preview-${label}`}
          className="rounded-xl p-3 border"
          style={{ background: 'hsl(222 47% 12%)', borderColor: 'hsl(222 30% 20%)' }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Icon size={12} style={{ color }} />
            <span className="text-xs" style={{ color: 'hsl(215 15% 50%)' }}>
              {label}
            </span>
          </div>
          <div className="flex items-end gap-1">
            <span
              className="font-mono font-bold tabular-nums"
              style={{ fontSize: '1.4rem', lineHeight: 1, color }}
            >
              {value}
            </span>
            <span className="text-xs mb-0.5" style={{ color: 'hsl(215 20% 50%)' }}>
              {unit}
            </span>
          </div>
          <div
            className="mt-2 h-0.5 rounded-full"
            style={{ background: `${color}30` }}
          >
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                background: color,
                width: `${Math.min(100, Math.max(20, parseInt(value) % 100))}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ECG pulse line animation
function ECGLine() {
  return (
    <div className="w-full overflow-hidden" style={{ height: 40 }}>
      <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ecgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(199 89% 48%)" stopOpacity="0" />
            <stop offset="40%" stopColor="hsl(199 89% 48%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(199 89% 48%)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d="M0,20 L60,20 L70,20 L80,5 L90,35 L100,20 L110,20 L160,20 L170,20 L180,5 L190,35 L200,20 L210,20 L260,20 L270,20 L280,5 L290,35 L300,20 L310,20 L360,20 L370,20 L380,5 L390,35 L400,20"
          stroke="url(#ecgGrad)"
          strokeWidth="1.5"
          fill="none"
          style={{
            animation: 'ecgScroll 3s linear infinite',
          }}
        />
      </svg>
      <style>{`
        @keyframes ecgScroll {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -400; }
        }
      `}</style>
    </div>
  );
}

// Demo credentials box
function DemoCredentialsBox({
  onUse,
}: {
  onUse: (email: string, password: string) => void;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <div
      className="rounded-xl border p-3 mt-4"
      style={{ background: 'hsl(222 47% 11%)', borderColor: 'hsl(222 30% 20%)' }}
    >
      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'hsl(215 15% 50%)' }}>
        Demo Accounts
      </p>
      <div className="space-y-2">
        {DEMO_CREDENTIALS.map((cred) => (
          <div
            key={`cred-${cred.role}`}
            className="flex items-center gap-2 rounded-lg p-2"
            style={{ background: 'hsl(222 47% 14%)' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'hsl(199 89% 48% / 0.15)' }}
            >
              {cred.role === 'doctor' ? (
                <Stethoscope size={11} style={{ color: 'hsl(199 89% 60%)' }} />
              ) : (
                <User size={11} style={{ color: 'hsl(199 89% 60%)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: 'hsl(210 40% 88%)' }}>
                {cred.label}
              </p>
              <p className="font-mono text-xs truncate" style={{ color: 'hsl(215 15% 50%)' }}>
                {cred.email}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleCopy(cred.email, `${cred.role}-email`)}
                className="p-1 rounded transition-colors"
                title="Copy email"
                style={{ color: 'hsl(215 15% 50%)' }}
              >
                {copied === `${cred.role}-email` ? (
                  <Check size={12} style={{ color: 'hsl(142 71% 55%)' }} />
                ) : (
                  <Copy size={12} />
                )}
              </button>
              <button
                type="button"
                onClick={() => onUse(cred.email, cred.password)}
                className="text-xs px-2 py-0.5 rounded font-medium transition-all duration-150 active:scale-95"
                style={{
                  background: 'hsl(199 89% 48% / 0.15)',
                  color: 'hsl(199 89% 65%)',
                  border: '1px solid hsl(199 89% 48% / 0.25)',
                }}
              >
                Use
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AuthPageClient() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<Role>('doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loginForm = useForm<LoginForm>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const signupForm = useForm<SignupForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'doctor',
      agreeTerms: false,
    },
  });

  const handleLoginSubmit = (data: LoginForm) => {
    setAuthError(null);
    setIsSubmitting(true);

    // Backend integration point: POST /api/auth/login { email, password }
    setTimeout(() => {
      setIsSubmitting(false);
      const match = DEMO_CREDENTIALS.find(
        (c) => c.email === data.email && c.password === data.password
      );
      if (match) {
        toast.success(`Welcome back, ${match.name}`);
        router.push(match.destination);
      } else {
        setAuthError('Invalid credentials — use the demo accounts below to sign in');
      }
    }, 1200);
  };

  const handleSignupSubmit = (data: SignupForm) => {
    setAuthError(null);
    if (data.password !== data.confirmPassword) {
      signupForm.setError('confirmPassword', { message: 'Passwords do not match' });
      return;
    }
    setIsSubmitting(true);

    // Backend integration point: POST /api/auth/register { name, email, password, role }
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Account created — redirecting to your dashboard');
      const dest = data.role === 'doctor' ? '/doctor-dashboard' : '/patient-app';
      router.push(dest);
    }, 1400);
  };

  const autofillCredentials = (email: string, password: string) => {
    loginForm.setValue('email', email);
    loginForm.setValue('password', password);
    setAuthError(null);
    // Determine role from email
    const match = DEMO_CREDENTIALS.find((c) => c.email === email);
    if (match) setSelectedRole(match.role);
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'hsl(222 47% 6%)' }}
    >
      {/* Left panel — brand + vitals preview */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] flex-shrink-0 p-10 border-r relative overflow-hidden"
        style={{
          background: 'hsl(222 47% 8%)',
          borderColor: 'hsl(222 30% 14%)',
        }}
      >
        {/* Background gradient orb */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'hsl(199 89% 48% / 0.06)', transform: 'translate(-30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'hsl(142 71% 45% / 0.04)', transform: 'translate(20%, 20%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <AppLogo size={36} />
            <span className="font-bold text-lg tracking-tight" style={{ color: 'hsl(210 40% 96%)' }}>
              HealthPulse
            </span>
          </div>

          <h1
            className="text-3xl font-bold leading-tight mb-4"
            style={{ color: 'hsl(210 40% 96%)' }}
          >
            Real-time patient
            <br />
            <span style={{ color: 'hsl(199 89% 60%)' }}>vital monitoring</span>
          </h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: 'hsl(215 20% 55%)' }}>
            Stream live vitals from wearable devices directly to your care team.
            Threshold-based alerts. Instant clinical action.
          </p>

          {/* ECG line */}
          <div className="mb-8">
            <ECGLine />
          </div>

          {/* Live vitals preview */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background: 'hsl(142 71% 45%)',
                  boxShadow: '0 0 6px hsl(142 71% 45%)',
                  animation: 'pulse-ring 1.5s ease-out infinite',
                }}
              />
              <span className="text-xs font-medium" style={{ color: 'hsl(142 71% 55%)' }}>
                Live demo preview
              </span>
            </div>
            <AnimatedVitalsPreview />
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: '< 3s', label: 'Latency' },
              { value: '99.8%', label: 'Uptime' },
              { value: '1000+', label: 'Max history' },
            ].map((stat) => (
              <div key={`stat-${stat.label}`} className="text-center">
                <p
                  className="font-mono font-bold text-lg"
                  style={{ color: 'hsl(199 89% 60%)' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: 'hsl(215 15% 45%)' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — auth form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <AppLogo size={28} />
            <span className="font-bold" style={{ color: 'hsl(210 40% 96%)' }}>
              HealthPulse
            </span>
          </div>

          {/* Role selector */}
          <div
            className="flex rounded-xl p-1 gap-1 mb-6"
            style={{ background: 'hsl(222 47% 10%)' }}
          >
            {(['doctor', 'patient'] as Role[]).map((role) => (
              <button
                key={`role-${role}`}
                type="button"
                onClick={() => setSelectedRole(role)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 capitalize"
                style={{
                  background:
                    selectedRole === role ? 'hsl(222 47% 16%)' : 'transparent',
                  color:
                    selectedRole === role
                      ? 'hsl(210 40% 96%)'
                      : 'hsl(215 20% 50%)',
                  border:
                    selectedRole === role
                      ? '1px solid hsl(222 30% 24%)'
                      : '1px solid transparent',
                }}
              >
                {role === 'doctor' ? <Stethoscope size={15} /> : <User size={15} />}
                {role === 'doctor' ? 'Doctor' : 'Patient'}
              </button>
            ))}
          </div>

          {/* Mode toggle */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold" style={{ color: 'hsl(210 40% 96%)' }}>
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'hsl(215 20% 55%)' }}>
                {mode === 'login'
                  ? `Access your ${selectedRole} dashboard`
                  : `Join HealthPulse as a ${selectedRole}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setAuthError(null);
                loginForm.reset();
                signupForm.reset();
              }}
              className="text-xs font-medium transition-colors"
              style={{ color: 'hsl(199 89% 60%)' }}
            >
              {mode === 'login' ? 'Create account →' : '← Sign in'}
            </button>
          </div>

          {/* Auth error */}
          {authError && (
            <div
              className="rounded-lg px-4 py-3 mb-4 text-sm slide-up"
              style={{
                background: 'hsl(0 84% 60% / 0.1)',
                borderLeft: '3px solid hsl(0 84% 60%)',
                color: 'hsl(0 84% 70%)',
              }}
            >
              {authError}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
              className="space-y-4 fade-in"
            >
              {/* Email */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'hsl(215 20% 65%)' }}
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@healthpulse.io"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'hsl(222 47% 11%)',
                      border: `1px solid ${loginForm.formState.errors.email ? 'hsl(0 84% 60%)' : 'hsl(222 30% 20%)'}`,
                      color: 'hsl(210 40% 96%)',
                    }}
                    {...loginForm.register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                    })}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(0 84% 65%)' }}>
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'hsl(215 20% 65%)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'hsl(222 47% 11%)',
                      border: `1px solid ${loginForm.formState.errors.password ? 'hsl(0 84% 60%)' : 'hsl(222 30% 20%)'}`,
                      color: 'hsl(210 40% 96%)',
                    }}
                    {...loginForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(0 84% 65%)' }}>
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember + forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3.5 h-3.5 rounded"
                    style={{ accentColor: 'hsl(199 89% 48%)' }}
                    {...loginForm.register('remember')}
                  />
                  <span className="text-xs" style={{ color: 'hsl(215 20% 55%)' }}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className="text-xs transition-colors"
                  style={{ color: 'hsl(199 89% 60%)' }}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-60 mt-2"
                style={{
                  background: 'hsl(199 89% 48%)',
                  color: 'hsl(222 47% 6%)',
                  minHeight: 42,
                }}
              >
                {isSubmitting ? (
                  <div
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: 'hsl(222 47% 6%) transparent hsl(222 47% 6%) transparent',
                    }}
                  />
                ) : (
                  <>
                    Sign In as {selectedRole === 'doctor' ? 'Doctor' : 'Patient'}
                    <ChevronRight size={15} />
                  </>
                )}
              </button>

              {/* Demo credentials */}
              <DemoCredentialsBox onUse={autofillCredentials} />
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form
              onSubmit={signupForm.handleSubmit(handleSignupSubmit)}
              className="space-y-4 fade-in"
            >
              {/* Full name */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'hsl(215 20% 65%)' }}
                >
                  Full name
                </label>
                <div className="relative">
                  <User
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  />
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder={selectedRole === 'doctor' ? 'Dr. First Last' : 'First Last'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'hsl(222 47% 11%)',
                      border: `1px solid ${signupForm.formState.errors.name ? 'hsl(0 84% 60%)' : 'hsl(222 30% 20%)'}`,
                      color: 'hsl(210 40% 96%)',
                    }}
                    {...signupForm.register('name', {
                      required: 'Full name is required',
                      minLength: { value: 2, message: 'Name too short' },
                    })}
                  />
                </div>
                {signupForm.formState.errors.name && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(0 84% 65%)' }}>
                    {signupForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'hsl(215 20% 65%)' }}
                >
                  Email address
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    placeholder="you@healthpulse.io"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'hsl(222 47% 11%)',
                      border: `1px solid ${signupForm.formState.errors.email ? 'hsl(0 84% 60%)' : 'hsl(222 30% 20%)'}`,
                      color: 'hsl(210 40% 96%)',
                    }}
                    {...signupForm.register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
                    })}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(0 84% 65%)' }}>
                    {signupForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'hsl(215 20% 65%)' }}
                >
                  Password
                </label>
                <p className="text-xs mb-1.5" style={{ color: 'hsl(215 15% 40%)' }}>
                  Minimum 8 characters, include a number and symbol
                </p>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'hsl(222 47% 11%)',
                      border: `1px solid ${signupForm.formState.errors.password ? 'hsl(0 84% 60%)' : 'hsl(222 30% 20%)'}`,
                      color: 'hsl(210 40% 96%)',
                    }}
                    {...signupForm.register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(0 84% 65%)' }}>
                    {signupForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: 'hsl(215 20% 65%)' }}
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: 'hsl(222 47% 11%)',
                      border: `1px solid ${signupForm.formState.errors.confirmPassword ? 'hsl(0 84% 60%)' : 'hsl(222 30% 20%)'}`,
                      color: 'hsl(210 40% 96%)',
                    }}
                    {...signupForm.register('confirmPassword', {
                      required: 'Please confirm your password',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'hsl(215 15% 45%)' }}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(0 84% 65%)' }}>
                    {signupForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Role hidden field sync */}
              <input type="hidden" value={selectedRole} {...signupForm.register('role')} />

              {/* Terms */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 w-3.5 h-3.5 rounded flex-shrink-0"
                    style={{ accentColor: 'hsl(199 89% 48%)' }}
                    {...signupForm.register('agreeTerms', {
                      required: 'You must agree to the terms',
                    })}
                  />
                  <span className="text-xs leading-relaxed" style={{ color: 'hsl(215 20% 55%)' }}>
                    I agree to the{' '}
                    <button
                      type="button"
                      className="underline transition-colors"
                      style={{ color: 'hsl(199 89% 60%)' }}
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      className="underline transition-colors"
                      style={{ color: 'hsl(199 89% 60%)' }}
                    >
                      Privacy Policy
                    </button>
                    . Patient data is handled in accordance with HIPAA guidelines.
                  </span>
                </label>
                {signupForm.formState.errors.agreeTerms && (
                  <p className="text-xs mt-1" style={{ color: 'hsl(0 84% 65%)' }}>
                    {signupForm.formState.errors.agreeTerms.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95 disabled:opacity-60 mt-2"
                style={{
                  background: 'hsl(199 89% 48%)',
                  color: 'hsl(222 47% 6%)',
                  minHeight: 42,
                }}
              >
                {isSubmitting ? (
                  <div
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{
                      borderColor: 'hsl(222 47% 6%) transparent hsl(222 47% 6%) transparent',
                    }}
                  />
                ) : (
                  <>
                    Create {selectedRole === 'doctor' ? 'Doctor' : 'Patient'} Account
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer */}
          <p className="text-xs text-center mt-6" style={{ color: 'hsl(215 15% 40%)' }}>
            HealthPulse · Clinical-grade remote monitoring · HIPAA compliant
          </p>
        </div>
      </div>
    </div>
  );
}