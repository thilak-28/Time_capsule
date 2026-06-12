import { useState, useEffect } from 'react';
import { Clock, Lock, Mail, Users, Trash2, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const CSCapsuleCard = ({ capsule, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState('');

  const upcomingSchedules = (capsule.schedules || [])
    .filter(s => !s.emailSent)
    .map(s => ({ ...s, parsedDate: new Date(s.scheduledDate) }))
    .sort((a, b) => a.parsedDate - b.parsedDate);

  const nextSchedule = upcomingSchedules[0];
  const nextScheduleDate = nextSchedule ? nextSchedule.parsedDate : null;

  useEffect(() => {
    const updateTimer = () => {
      if (!nextScheduleDate) { setTimeLeft('Completed'); return; }
      const now = new Date();
      if (nextScheduleDate <= now) {
        setTimeLeft('Due Now');
      } else {
        setTimeLeft(formatDistanceToNow(nextScheduleDate, { addSuffix: true }));
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [nextScheduleDate]);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(`Are you sure you want to delete "${capsule.title}"? This action is permanent.`)) return;

    try {
      await api.delete(`/cs-reminders/${capsule._id}`);
      toast.success('CS Reminder deleted successfully');
      if (onDelete) onDelete(capsule._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete CS reminder');
    }
  };

  const coverImage = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800';

  return (
    <Link
      to={`/cs-capsule/${capsule._id}`}
      className="vintage-card relative overflow-hidden flex flex-col group p-0 bg-[#faf8ff] border-2 border-purple-200"
    >
      {/* Dashed border */}
      <div className="absolute inset-2.5 border border-dashed border-purple-300/60 rounded-xl pointer-events-none z-20" />

      <div className="relative h-44 overflow-hidden border-b border-purple-200">
        <img
          src={coverImage}
          alt={capsule.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 sepia-[10%] contrast-[95%] brightness-[92%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 to-transparent" />

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="absolute top-4 left-4 p-2 bg-white/90 border border-red-500/20 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-350 cursor-pointer z-30"
          title="Delete CS Reminder"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>

        {/* CS Stamp */}
        <div className="absolute -bottom-6 -right-6 w-28 h-28 pointer-events-none z-20 opacity-45 select-none transform rotate-[15deg] text-purple-700/50">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-current">
            <circle cx="50" cy="50" r="42" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="36" strokeWidth="0.75" />
            <path d="M 15 45 Q 50 35 85 45" strokeWidth="1" />
            <path d="M 15 52 Q 50 42 85 52" strokeWidth="1" />
            <path d="M 15 59 Q 50 49 85 59" strokeWidth="1" />
            <text x="50" y="30" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fontWeight="bold" fill="currentColor" stroke="none">REMINDER</text>
            <text x="50" y="76" textAnchor="middle" fontSize="6.5" fontFamily="monospace" fill="currentColor" stroke="none">CS MANAGER</text>
            <text x="50" y="51" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="currentColor" stroke="none">{format(new Date(capsule.createdAt), 'dd.MM.yy')}</text>
          </svg>
        </div>

        {capsule.status === 'draft' && (
          <div className="absolute bottom-4 left-4 p-2 bg-white/95 border border-purple-200 rounded-lg z-30">
            <span className="text-[10px] font-bold font-serif uppercase text-purple-600">Draft</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-6 space-y-5 flex-1 flex flex-col justify-between paper-pattern bg-[#faf8ff]/40">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#4B5563] text-[10px] font-bold font-serif uppercase tracking-widest">
              <Clock className="w-3 h-3 text-purple-500" />
              {capsule.selectedIntervals?.length || 0} intervals
            </div>
            <span className={`rubber-stamp ${capsule.status === 'active' ? 'stamp-sealed' : 'stamp-delivered'} text-[9px] shadow-sm`}>
              {capsule.status === 'active' ? 'Active' : 'Draft'}
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-deep-forest tracking-tight leading-tight group-hover:text-purple-700 transition-colors duration-300 line-clamp-2">
            {capsule.title}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-[#374151] font-medium">
              <Calendar className="w-4 h-4 text-purple-500" />
              {timeLeft}
            </div>
            <div className="flex items-center gap-2 text-[#374151] font-semibold">
              <Users className="w-4 h-4" />
              {capsule.recipientEmails?.length || 0}
            </div>
          </div>

          <div className="pt-4 border-t border-purple-200/50 flex items-center justify-between">
            <div className="text-[10px] font-bold text-[#4B5563] uppercase tracking-tighter">
              Filed {format(new Date(capsule.csFilingDate), 'MMM d, yyyy')}
            </div>
            <div className="text-[10px] font-bold text-[#4B5563] uppercase group-hover:text-purple-600 transition-colors font-serif">
              View &rarr;
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CSCapsuleCard;
