import { Link } from 'react-router-dom';
import { Clock, Shield, Zap, Calendar, ArrowRight, Play } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-paper-cream">
      {/* Navigation */}
      <nav className="container mx-auto px-4 sm:px-8 py-6 sm:py-8 flex items-center justify-between stagger-in">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-sage-gold/25 border border-sage-gold/50 rounded-xl">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-ink-green" />
          </div>
          <span className="text-xl sm:text-2xl font-serif font-bold text-deep-forest tracking-tighter">PS Reminder Manager</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/login" className="text-xs sm:text-sm font-bold font-serif text-deep-forest/60 hover:text-deep-forest transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="vintage-btn-primary px-4 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-sm">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-24 sm:pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-sage-gold/25 border border-sage-gold/50 text-ink-green text-[9px] sm:text-[10px] font-bold font-serif uppercase tracking-[0.3em] mb-8 sm:mb-12 stagger-in">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
          Statutory filing reminder coordinator
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-[100px] font-bold font-serif text-deep-forest mb-6 sm:mb-10 tracking-tight leading-[0.95] sm:leading-[0.9] stagger-in" style={{ animationDelay: '0.1s' }}>
          Never Miss a <br />
          <span className="text-ink-green">
            Filing.
          </span>
        </h1>
        <p className="text-base sm:text-xl text-deep-forest/65 max-w-xl sm:max-w-2xl mx-auto mb-10 sm:mb-16 leading-relaxed font-medium stagger-in" style={{ animationDelay: '0.2s' }}>
          Schedule automatic recurring reminder intervals for your PS filings. Recipient emails are dispatched automatically on precisely calculated schedule dates.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 stagger-in" style={{ animationDelay: '0.3s' }}>
          <Link to="/register" className="vintage-btn-primary text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-5 w-full sm:w-auto flex items-center justify-center gap-3 group">
            <span className="font-bold">Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <button 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 sm:px-10 py-4 sm:py-5 rounded-xl border border-sage-gold bg-[#fdfdf9] text-deep-forest font-serif font-bold hover:bg-sage-gold/25 transition-all flex items-center gap-3 w-full sm:w-auto justify-center cursor-pointer text-base sm:text-lg"
          >
            <Play className="w-5 h-5 fill-current text-ink-green" />
            Learn More
          </button>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-6 py-32 border-t border-sage-gold">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Interval Schedules",
              desc: "Configure 2, 4, 6, 8, 10, or 12-month reminder intervals. The system automatically computes and tracks all upcoming delivery dates.",
              icon: Clock,
            },
            {
              title: "Secure Delivery",
              desc: "Encrypted scheduler engine manages dates securely. Reminders are dispatched directly to designated recipient inboxes.",
              icon: Shield,
            },
            {
              title: "Statutory Filing Tracker",
              desc: "Keep records of all filed PS records, title coordinates, and dispatch history. Built-in dashboard charts trace email activity.",
              icon: Calendar,
            }
          ].map((feature, i) => (
            <div key={i} className="vintage-card p-10 stagger-in" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
              <div className="w-14 h-14 bg-sage-gold/25 text-ink-green border border-sage-gold rounded-2xl flex items-center justify-center mb-8">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-4 text-deep-forest tracking-tight">{feature.title}</h3>
              <p className="text-deep-forest/60 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-16 border-t border-sage-gold text-center stagger-in">
        <p className="text-deep-forest/40 text-[10px] font-bold font-serif uppercase tracking-[0.4em]">© 2026 PS REMINDER MANAGER • AUTOMATION PROTOCOL</p>
      </footer>
    </div>
  );
};

export default Landing;
