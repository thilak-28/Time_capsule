import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const { register } = useAuthStore();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await register(formData.name, formData.email, formData.password);
      toast.success(res.message || 'Account created successfully!');
      setRegisteredEmail(formData.email);
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
      <div className="w-full max-w-[480px] glass p-10 stagger-in">
        {registeredEmail ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-accent-purple/10 text-accent-purple rounded-full flex items-center justify-center mx-auto mb-6 border border-accent-purple/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Verify Email</h1>
            <p className="text-white/45 mt-4 font-medium leading-relaxed">
              We have sent a verification link to <strong>{registeredEmail}</strong>.
            </p>
            <p className="text-white/30 text-xs mt-3 italic">
              Please click the link inside the verification email to activate your account.
            </p>

            <Link to="/login">
              <button className="glass-btn-primary w-full py-3.5 mt-8 font-bold tracking-wide">
                Go to Sign In
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-white tracking-tight">Join Us</h1>
              <p className="text-white/45 mt-3 font-medium">Start capturing your future today.</p>
            </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-purple transition-colors" />
              <input
                type="text"
                name="name"
                className="w-full glass-input pl-12"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-purple transition-colors" />
              <input
                type="email"
                name="email"
                className="w-full glass-input pl-12"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-purple transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full glass-input pl-12 pr-12"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-1 px-1">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold tracking-wider uppercase mt-1">
                    <span className="text-white/30">Strength:</span>
                    <span className={strength.label === 'Weak' ? 'text-red-400' : strength.label === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Confirm</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-purple transition-colors" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  className="w-full glass-input pl-12 pr-12"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
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
            className="glass-btn-primary w-full flex items-center justify-center gap-3 py-3.5 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="font-bold tracking-wide">Create Account</span>
            )}
          </button>
        </form>

            <p className="mt-10 text-center text-sm font-medium text-white/30">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-purple hover:text-white transition-colors font-bold underline underline-offset-4 decoration-accent-purple/30">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
