import { Link } from 'react-router-dom';
import { Clock, Shield, Zap, Heart, ArrowRight, Play } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Orbs (Local to Landing for extra depth) */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent-purple/20 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[160px]" />

      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 flex items-center justify-between stagger-in">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-accent-purple/20 border border-accent-purple/30 rounded-xl">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-white tracking-tighter">TimeCapsule</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/login" className="text-xs sm:text-sm font-bold text-white/40 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="glass-btn-primary px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass bg-white/5 border-white/10 text-accent-purple text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-8 sm:mb-12 stagger-in">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          Secure Digital Time Capsule
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-[140px] font-black text-white mb-6 sm:mb-10 tracking-[-0.05em] leading-[0.95] sm:leading-[0.85] stagger-in" style={{ animationDelay: '0.1s' }}>
          Secure Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
            Legacy.
          </span>
        </h1>
        <p className="text-base sm:text-xl text-white/45 max-w-xl sm:max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed font-medium stagger-in" style={{ animationDelay: '0.2s' }}>
          Safely lock away messages and media to be delivered to your future self, friends, or family at the exact date and time you choose.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 stagger-in" style={{ animationDelay: '0.3s' }}>
          <Link to="/register" className="glass-btn-primary text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto flex items-center justify-center gap-3 group">
            <span className="font-bold">Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-2xl glass bg-white/5 border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-3 w-full sm:w-auto justify-center cursor-pointer text-base sm:text-lg"
          >
            <Play className="w-5 h-5 fill-current text-accent-purple" />
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-32 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Time Locking",
              desc: "Atomic-clock synchronization ensures your capsule remains impenetrable until the exact microsecond of arrival.",
              icon: Clock,
              accent: "text-accent-purple",
              bg: "bg-accent-purple/10"
            },
            {
              title: "AES-256 Vault",
              desc: "Military-grade encryption protocols safeguard your data. Your legacy is protected by the highest standards of digital security.",
              icon: Shield,
              accent: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              title: "Endless Horizons",
              desc: "Perfect for generational milestones. Speak to your children, your successors, or your future self across decades.",
              icon: Heart,
              accent: "text-pink-400",
              bg: "bg-pink-400/10"
            }
          ].map((feature, i) => (
            <div key={i} className="glass bg-white/[0.03] p-10 stagger-in" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
              <div className={`w-14 h-14 ${feature.bg} ${feature.accent} border border-current/20 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-black/50`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-16 border-t border-white/5 text-center stagger-in">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">© 2026 TIMECAPSULE PROTOCOL • Preserving Memories</p>
      </footer>
    </div>
  );
};

export default Landing;
