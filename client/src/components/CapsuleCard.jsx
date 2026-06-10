import { useState, useEffect } from 'react';
import { Clock, Lock, ShieldCheck, Mail, Users, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const CapsuleCard = ({ capsule, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const unlockDate = new Date(capsule.unlockDate);
      if (unlockDate <= now) {
        setTimeLeft('Unlocked');
      } else {
        setTimeLeft(formatDistanceToNow(unlockDate, { addSuffix: true }));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [capsule.unlockDate]);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete "${capsule.title}"? This action is permanent and cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/capsules/${capsule._id}`);
      toast.success('Capsule deleted successfully');
      if (onDelete) {
        onDelete(capsule._id);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete capsule');
    }
  };

  const statusColors = {
    draft: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    sealed: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500',
    delivered: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-500',
  };

  const privacyIcons = {
    private: Lock,
    shared: Users,
    public: ShieldCheck,
  };

  const PrivacyIcon = privacyIcons[capsule.privacy];

  return (
    <Link 
      to={`/capsule/${capsule._id}`}
      className="vintage-card relative overflow-hidden flex flex-col group p-0 bg-[#fdfaf2] border-2 border-sage-gold"
    >
      {/* Decorative Vintage Postcard Dashed Border */}
      <div className="absolute inset-2.5 border border-dashed border-sage-gold/60 rounded-xl pointer-events-none z-20" />

      <div className="relative h-44 overflow-hidden border-b border-sage-gold">
        <img
          src={capsule.coverImage.includes('photo-1516541196182-6bdb0516ed27')
            ? 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=800'
            : capsule.coverImage}
          alt={capsule.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 sepia-[20%] contrast-[95%] brightness-[92%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/40 to-transparent" />
        
        {/* Delete Card Button */}
        <button
          onClick={handleDelete}
          className="absolute top-4 left-4 p-2 bg-[#fdfdf9]/90 border border-red-500/20 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-350 cursor-pointer z-30"
          title="Delete Capsule"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
        
        {/* Vintage Postmark cancellation stamp overlay */}
        <div className="absolute -bottom-6 -right-6 w-28 h-28 pointer-events-none z-20 opacity-45 select-none transform rotate-[15deg] text-deep-forest/50">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current">
            <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="36" strokeWidth="0.75" />
            <path d="M 15 45 Q 50 35 85 45" strokeWidth="1" />
            <path d="M 15 52 Q 50 42 85 52" strokeWidth="1" />
            <path d="M 15 59 Q 50 49 85 59" strokeWidth="1" />
            <text x="50" y="30" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fontWeight="bold" fill="currentColor" stroke="none">TIMECAPSULE</text>
            <text x="50" y="76" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill="currentColor" stroke="none">POST RELAY</text>
            <text x="50" y="51" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="currentColor" stroke="none">{format(new Date(capsule.createdAt), 'dd.MM.yy')}</text>
          </svg>
        </div>

        {capsule.status === 'sealed' && (
          <div className="absolute bottom-4 left-4 p-2 bg-[#fdfdf9]/95 border border-sage-gold rounded-lg z-30">
            <Lock className="w-4 h-4 text-[#800020]" />
          </div>
        )}
      </div>

      {/* Lined paper pattern body */}
      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between paper-pattern bg-[#fdfaf2]/40">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-deep-forest/50 text-[10px] font-bold font-serif uppercase tracking-widest">
              <PrivacyIcon className="w-3 h-3 text-ink-green/75" />
              {capsule.privacy}
            </div>
            <span className={`rubber-stamp ${
              capsule.status === 'sealed' ? 'stamp-sealed' : 'stamp-delivered'
            } text-[9px] shadow-sm`}>
              {capsule.status}
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-deep-forest tracking-tight leading-tight group-hover:text-ink-green transition-colors duration-300 line-clamp-2">
            {capsule.title}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-deep-forest/70 font-medium">
              <Clock className="w-4 h-4 text-ink-green" />
              {timeLeft}
            </div>
            <div className="flex items-center gap-2 text-deep-forest/50 font-semibold">
              <Users className="w-4 h-4" />
              {capsule.recipients?.length || 0}
            </div>
          </div>

          <div className="pt-4 border-t border-sage-gold/50 flex items-center justify-between">
            <div className="text-[10px] font-bold text-deep-forest/40 uppercase tracking-tighter">
              Unlocks {format(new Date(capsule.unlockDate), 'MMM d, yyyy')}
            </div>
            <div className="text-[10px] font-bold text-deep-forest/40 uppercase group-hover:text-ink-green transition-colors font-serif">
              Open &rarr;
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CapsuleCard;
