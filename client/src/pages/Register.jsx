import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff, Key, ChevronLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [step, setStep] = useState(1); // Step 1: name/email, Step 2: otp/password
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, sendOTP } = useAuthStore();
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-white/10', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 4) return { label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      return toast.error('Please enter name and email');
    }
    setSendingOtp(true);
    try {
      await sendOTP(formData.email);
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      return toast.error('Please enter the verification code');
    }
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password, formData.otp);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[480px] vintage-card stagger-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-deep-forest tracking-tight">Join Us</h1>
          <p className="text-deep-forest/65 mt-2 font-medium">Start capturing your future today.</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
                <input
                  type="text"
                  name="name"
                  className="w-full vintage-input pl-12"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
                <input
                  type="email"
                  name="email"
                  className="w-full vintage-input pl-12"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingOtp}
              className="vintage-btn-primary w-full py-3.5 mt-2"
            >
              {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <span className="font-bold tracking-wide">Send Verification Code</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-between items-center bg-sage-gold/20 border border-sage-gold/40 rounded-lg p-3.5 mb-6 text-sm">
              <div>
                <p className="text-deep-forest/50 text-[10px] uppercase font-bold tracking-wider">Signing up as</p>
                <p className="text-deep-forest font-medium truncate max-w-[240px]">{formData.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-ink-green font-bold hover:text-deep-forest transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Edit
              </button>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">6-Digit Code</label>
              <div className="relative group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
                <input
                  type="text"
                  name="otp"
                  maxLength={6}
                  className="w-full vintage-input pl-12 tracking-[0.25em] font-mono text-center text-lg"
                  placeholder="000000"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="w-full vintage-input pl-12 pr-12"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-deep-forest/30 hover:text-deep-forest transition-colors cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-1 px-1">
                    <div className="h-1.5 w-full bg-sage-gold/40 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-bold tracking-wider uppercase mt-1">
                      <span className="text-deep-forest/50">Strength:</span>
                      <span className={strength.label === 'Weak' ? 'text-red-600' : strength.label === 'Medium' ? 'text-amber-600' : 'text-emerald-700'}>
                        {strength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="w-full vintage-input pl-12 pr-12"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-deep-forest/30 hover:text-deep-forest transition-colors cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="vintage-btn-primary w-full py-3.5 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <span className="font-bold tracking-wide">Verify & Create Account</span>
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-sm font-medium text-deep-forest/50">
          Already have an account?{' '}
          <Link to="/login" className="text-ink-green hover:text-deep-forest transition-colors font-bold underline underline-offset-4 decoration-ink-green/30">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
