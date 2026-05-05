import { useState, useEffect } from 'react';
import { Clock, Lock, ShieldCheck, Mail, Users } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';

const CapsuleCard = ({ capsule }) => {
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
      className="glass group hover:ring-2 hover:ring-primary-500/50 transition-all duration-300 rounded-2xl overflow-hidden flex flex-col"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={capsule.coverImage}
          alt={capsule.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[capsule.status]}`}>
            {capsule.status}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4 flex-1">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-xs font-semibold uppercase mb-1">
            <PrivacyIcon className="w-3 h-3" />
            {capsule.privacy}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{capsule.title}</h3>
        </div>

        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {timeLeft}
          </div>
          <div className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {capsule.recipients?.length || 0}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          Unlock Date: {format(new Date(capsule.unlockDate), 'MMM d, yyyy h:mm aa')}
        </div>
      </div>
    </Link>
  );
};

export default CapsuleCard;
