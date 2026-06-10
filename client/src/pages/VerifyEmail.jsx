import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const VerifyEmail = () => {
  const { token } = useParams();
  const { verifyEmail } = useAuthStore();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const triggerVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        toast.success('Account successfully verified!');
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Verification link is invalid or has expired.');
        toast.error('Verification failed.');
      }
    };

    if (token) {
      triggerVerification();
    }
  }, [token, verifyEmail]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] glass p-10 stagger-in text-center">
        {status === 'verifying' && (
          <div className="py-8">
            <Loader2 className="w-12 h-12 text-accent-purple animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white tracking-tight">Securing Your Account</h1>
            <p className="text-white/45 mt-4 font-medium">Verifying your encryption identity signature...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Identity Verified</h1>
            <p className="text-white/45 mt-4 font-medium">
              Your email has been authenticated successfully. Your vault is now fully operational.
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="glass-btn-primary w-full flex items-center justify-center gap-3 py-3.5 mt-8"
            >
              <span className="font-bold tracking-wide">Enter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Verification Failed</h1>
            <p className="text-red-400/80 mt-4 font-medium leading-relaxed">
              {errorMsg}
            </p>

            <Link to="/register">
              <button className="glass-btn-primary w-full py-3.5 mt-8 font-bold tracking-wide">
                Register Again
              </button>
            </Link>

            <p className="mt-6 text-sm font-medium text-white/30">
              <Link to="/login" className="text-accent-purple hover:text-white transition-colors font-bold">
                Return to Login
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
