import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();
  const { token } = useParams();
  const navigate = useNavigate();

  // Simple password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-white/10', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { label: 'Weak Password', color: 'bg-red-500', width: 'w-1/3' };
    if (score <= 4) return { label: 'Moderate Security', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Highly Secure Key', color: 'bg-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      toast.success('Access Key updated successfully! Access granted.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[460px] glass p-10 stagger-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">Forge New Access Key</h1>
          <p className="text-white/45 mt-3 font-medium">Create a strong, memorable credentials secret.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-purple transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full glass-input pl-12 pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            {/* Password strength bar */}
            {password && (
              <div className="mt-2.5 px-1 space-y-1.5">
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-355`} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold tracking-wider uppercase">
                  <span className="text-white/30">Vault Integrity:</span>
                  <span className={strength.label === 'Weak Password' ? 'text-red-400' : strength.label === 'Moderate Security' ? 'text-amber-400' : 'text-emerald-400'}>
                    {strength.label}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-purple transition-colors" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full glass-input pl-12 pr-12"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="glass-btn-primary w-full flex items-center justify-center gap-3 py-3.5 mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <span className="font-bold tracking-wide">Update and Lock Vault</span>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-white/30">
          Link expired or error?{' '}
          <Link to="/forgot-password" className="text-accent-purple hover:text-white transition-colors font-bold underline underline-offset-4 decoration-accent-purple/30">
            Request new link
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
