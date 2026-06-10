import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { forgotPassword } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
      toast.success('Instructions sent if email is registered.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] vintage-card stagger-in">
        {!submitted ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold font-serif text-deep-forest tracking-tight">Recover Vault</h1>
              <p className="text-deep-forest/65 mt-2 font-medium">Enter your email to receive recovery instructions.</p>
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

              <button
                type="submit"
                disabled={loading}
                className="vintage-btn-primary w-full py-3.5 mt-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <span className="font-bold tracking-wide">Send Recovery Link</span>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-medium text-deep-forest/50">
              <Link to="/login" className="inline-flex items-center gap-2 text-ink-green hover:text-deep-forest transition-colors font-bold underline underline-offset-4 decoration-ink-green/30">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </p>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-sage-gold/25 text-ink-green rounded-full flex items-center justify-center mx-auto mb-6 border border-sage-gold/50">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold font-serif text-deep-forest tracking-tight">Instructions Dispatched</h1>
            <p className="text-deep-forest/65 mt-4 font-medium leading-relaxed">
              If an account is associated with <strong>{email}</strong>, we have sent a secure decryption key link.
            </p>
            <p className="text-deep-forest/40 text-xs mt-2 italic">
              Please check your spam or junk folder if you don't receive it shortly.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="vintage-btn-secondary w-full py-3 mt-8 font-bold text-sm tracking-wide"
            >
              Try Another Email
            </button>

            <p className="mt-6 text-sm font-medium text-deep-forest/50">
              <Link to="/login" className="inline-flex items-center gap-2 text-ink-green hover:text-deep-forest transition-colors font-bold font-serif">
                <ArrowLeft className="w-4 h-4" /> Return to Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
