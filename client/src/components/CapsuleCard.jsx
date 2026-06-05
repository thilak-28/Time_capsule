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
      className={`glass-card relative overflow-hidden flex flex-col border-l-4 group ${
        capsule.status === 'sealed' ? 'border-accent-purple shadow-[0_0_20px_rgba(120,80,255,0.1)]' :
        capsule.status === 'delivered' ? 'border-accent-green shadow-[0_0_20px_rgba(0,255,170,0.1)]' :
        'border-white/20'
      }`}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={capsule.coverImage}
          alt={capsule.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-base/80 to-transparent" />
        
        {/* Delete Card Button */}
        <button
          onClick={handleDelete}
          className="absolute top-4 left-4 p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/30 rounded-xl backdrop-blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-350 cursor-pointer z-10"
          title="Delete Capsule"
        >
          <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
        </button>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] backdrop-blur-xl border border-white/10 ${
            capsule.status === 'sealed' ? 'bg-accent-purple/20 text-accent-purple' :
            capsule.status === 'delivered' ? 'bg-accent-green/20 text-accent-green' :
            'bg-white/10 text-white/60'
          }`}>
            {capsule.status}
          </span>
        </div>

        {capsule.status === 'sealed' && (
          <div className="absolute bottom-4 left-4 p-2 bg-accent-purple/20 border border-accent-purple/40 rounded-lg animate-pulse">
            <Lock className="w-4 h-4 text-accent-purple" />
          </div>
        )}
      </div>

      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white/40 text-[10px] font-bold uppercase tracking-widest">
            <PrivacyIcon className="w-3 h-3" />
            {capsule.privacy}
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight leading-tight group-hover:text-accent-purple transition-colors duration-300 line-clamp-2">
            {capsule.title}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white/60 font-medium">
              <Clock className="w-4 h-4 text-accent-purple" />
              {timeLeft}
            </div>
            <div className="flex items-center gap-2 text-white/30 font-semibold">
              <Users className="w-4 h-4" />
              {capsule.recipients?.length || 0}
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-tighter">
              Unlocks {format(new Date(capsule.unlockDate), 'MMM d, yyyy')}
            </div>
            <div className="text-[10px] font-black text-white/10 uppercase group-hover:text-accent-purple/40 transition-colors">
              Open &rarr;
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CapsuleCard;
