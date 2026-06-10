import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] vintage-card stagger-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-deep-forest tracking-tight">Welcome Back</h1>
          <p className="text-deep-forest/65 mt-2 font-medium">Continue your journey through time.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
              <input
                type="email"
                className="w-full vintage-input pl-12"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-bold font-serif uppercase tracking-wider text-ink-green hover:text-deep-forest transition-colors">
                Forgot Pass?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full vintage-input pl-12 pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <button
            type="submit"
            disabled={loading}
            className="vintage-btn-primary w-full py-3.5 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <span className="font-bold tracking-wide">Sign In</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-deep-forest/50">
          New to the vault?{' '}
          <Link to="/register" className="text-ink-green hover:text-deep-forest transition-colors font-bold underline underline-offset-4 decoration-ink-green/30">
            Secure an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
