import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Users, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ViewCSCapsule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const { data } = await api.get(`/cs-reminders/${id}`);
        setCapsule(data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load CS Reminder');
        navigate('/dashboard?tab=cs');
      } finally {
        setLoading(false);
      }
    };
    fetchCapsule();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this CS Reminder? This action is permanent.')) return;
    try {
      await api.delete(`/cs-reminders/${id}`);
      toast.success('CS Reminder deleted successfully');
      navigate('/dashboard?tab=cs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete CS reminder');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-purple-700 font-bold animate-pulse">Loading CS Reminder details...</div>;

  const isCreator = user && capsule && (user.id === capsule.creator);
  const coverImage = 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800';

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 stagger-in px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-3 border border-purple-200 bg-[#faf8ff] hover:bg-purple-50 text-purple-700 rounded-xl transition-all group w-fit cursor-pointer">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        {isCreator && (
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-500/5 border border-red-500/20 text-red-700 hover:text-red-800 hover:bg-red-500/10 font-bold font-serif rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            Delete CS Reminder
          </button>
        )}
      </div>

      <div className="relative h-[220px] sm:h-[350px] rounded-3xl overflow-hidden shadow-sm border border-purple-200">
        <img src={coverImage} alt={capsule.title} className="w-full h-full object-cover brightness-90 scale-102" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-12 sm:left-12 sm:right-12">
          <div className="flex items-center gap-4 text-white/90 text-[10px] font-bold font-serif uppercase tracking-[0.2em] mb-4">
            <span className={`rubber-stamp ${capsule.status === 'active' ? 'stamp-sealed' : 'stamp-delivered'}`}>
              {capsule.status === 'active' ? 'Active' : 'Draft'}
            </span>
            <span className="flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4 text-white" />
              CS Filing Date: {format(new Date(capsule.csFilingDate), 'MMMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif text-white tracking-tight leading-none">{capsule.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Details & Schedule */}
        <div className="lg:col-span-8 space-y-10">
          <div className="vintage-card p-12 rounded-3xl shadow-sm paper-pattern bg-[#faf8ff]/40 text-deep-forest stagger-in">
            <h3 className="text-2xl font-bold font-serif text-[#1F2937] mb-4 border-b border-purple-200 pb-2">CS Details</h3>
            <div className="prose max-w-none text-deep-forest prose-p:text-[#374151] prose-p:leading-loose prose-p:text-lg">
              <div dangerouslySetInnerHTML={{ __html: capsule.description }} />
            </div>
          </div>

          {/* Schedule Timeline */}
          {capsule.status === 'active' && (
            <div className="vintage-card p-10 rounded-3xl shadow-sm space-y-6">
              <h3 className="text-2xl font-bold font-serif text-[#1F2937] border-b border-purple-200 pb-2 flex items-center gap-2">
                <Clock className="w-6 h-6 text-purple-600" />
                CS Reminder Schedule Timeline
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-purple-200 text-[10px] font-bold font-serif uppercase tracking-widest text-[#4B5563]">
                      <th className="py-3 px-4">Interval</th>
                      <th className="py-3 px-4">Scheduled Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Email Sent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-100">
                    {capsule.schedules?.map((schedule, i) => {
                      const isOverdue = new Date(schedule.scheduledDate) < new Date() && !schedule.emailSent;
                      const status = schedule.emailSent ? 'completed' : (isOverdue ? 'overdue' : 'upcoming');
                      return (
                        <tr key={i} className="hover:bg-purple-50/50 transition-colors">
                          <td className="py-4 px-4 font-bold text-sm text-deep-forest">After {schedule.intervalDays} days</td>
                          <td className="py-4 px-4 text-sm text-[#374151]">{format(new Date(schedule.scheduledDate), 'dd MMMM yyyy')}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-[#374151] flex items-center gap-2">
                            {schedule.emailSent ? (
                              <><CheckCircle className="w-4 h-4 text-emerald-600" /><span>Sent at {format(new Date(schedule.sentAt), 'hh:mm a, dd MMM yyyy')}</span></>
                            ) : (
                              <><AlertCircle className="w-4 h-4 text-amber-500" /><span>Pending</span></>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {(!capsule.schedules || capsule.schedules.length === 0) && (
                      <tr><td colSpan="4" className="py-8 text-center text-[#4B5563]">No schedules calculated</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Recipients & Intervals */}
        <div className="lg:col-span-4 space-y-10 stagger-in">
          <div className="vintage-card p-10 rounded-3xl space-y-10 shadow-sm">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold font-serif text-[#4B5563] uppercase tracking-[0.3em]">Designated Recipients</h4>
              <div className="space-y-4">
                {capsule.recipientEmails.map((email, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 text-xs font-bold shadow-sm transition-transform group-hover:scale-105">
                      {email[0]?.toUpperCase() || '@'}
                    </div>
                    <span className="text-sm font-bold text-[#1F2937] group-hover:text-purple-700 transition-colors truncate max-w-[180px]">{email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold font-serif text-[#4B5563] uppercase tracking-[0.3em]">Day Intervals Selected</h4>
              <div className="flex flex-wrap gap-2">
                {capsule.selectedIntervals?.map(interval => (
                  <span key={interval} className="px-4 py-2 bg-purple-100 border border-purple-200 rounded-xl text-[10px] font-bold text-purple-700 uppercase tracking-widest">
                    {interval} Days
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCSCapsule;
