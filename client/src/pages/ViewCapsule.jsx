import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Lock, Mail, Tag, Image as ImageIcon, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ViewCapsule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [capsule, setCapsule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCapsule = async () => {
      try {
        const { data } = await api.get(`/capsules/${id}`);
        setCapsule(data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load capsule');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchCapsule();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this capsule? This action is permanent and cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/capsules/${id}`);
      toast.success('Capsule deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete capsule');
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] animate-pulse text-primary-600">Loading your memories...</div>;

  const isUnlocked = new Date(capsule.unlockDate) <= new Date();
  const isCreator = user && capsule && (user.id === capsule.creator);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 stagger-in">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-3 glass bg-white/5 border-white/10 hover:bg-white/10 rounded-xl transition-all group w-fit">
          <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
        </button>
        {isCreator && (
          <button 
            onClick={handleDelete}
            className="px-6 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            Delete Capsule
          </button>
        )}
      </div>

      <div className="relative h-[260px] sm:h-[450px] rounded-[24px] sm:rounded-[48px] overflow-hidden shadow-2xl border border-white/10 glass-card">
        <img src={capsule.coverImage} alt={capsule.title} className="w-full h-full object-cover brightness-75 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-base via-navy-base/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-12 sm:left-12 sm:right-12">
          <div className="flex items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <span className={`px-4 py-1 rounded-full backdrop-blur-2xl border border-white/10 ${
              capsule.status === 'sealed' ? 'bg-accent-purple/20 text-accent-purple' : 'bg-accent-green/20 text-accent-green'
            }`}>
              {capsule.status}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent-purple" />
              {format(new Date(capsule.createdAt), 'MMMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">{capsule.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {!isUnlocked && capsule.status === 'sealed' ? (
            <div className="glass p-16 text-center rounded-[48px] border-white/5 bg-white/[0.01] space-y-8 stagger-in">
              <div className="inline-flex p-8 bg-accent-purple/10 border border-accent-purple/20 rounded-[32px] shadow-2xl shadow-accent-purple/5 animate-pulse">
                <Lock className="w-16 h-16 text-accent-purple" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white tracking-tight">Time-Locked Protocol</h2>
                <p className="text-white/40 max-w-sm mx-auto font-medium leading-relaxed">
                  This memory is preserved in a quantum state and will materialize on <br />
                  <span className="text-accent-purple font-black text-xl mt-2 block tracking-wide">
                    {format(new Date(capsule.unlockDate), 'PPPP p')}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="glass p-12 rounded-[48px] border-white/5 bg-white/[0.02] shadow-sm stagger-in">
              <div className="prose prose-invert max-w-none prose-p:text-white/70 prose-p:leading-loose prose-p:text-lg prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter">
                <div dangerouslySetInnerHTML={{ __html: capsule.content }} />
              </div>
              
              {capsule.media.length > 0 && (
                <div className="mt-16 pt-12 border-t border-white/5 space-y-8">
                  <h3 className="flex items-center gap-3 text-2xl font-black text-white tracking-tight">
                    <ImageIcon className="w-6 h-6 text-accent-purple" /> Preserved Media
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {capsule.media.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="group relative aspect-video rounded-3xl overflow-hidden border border-white/10 glass bg-white/5">
                        <img src={url} alt="Attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-navy-base/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <div className="p-3 bg-accent-purple/20 rounded-2xl border border-accent-purple/40">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-10 stagger-in">
          <div className="glass p-10 rounded-[40px] border-white/5 bg-white/[0.02] space-y-10 shadow-sm">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Designated Recipients</h4>
              <div className="space-y-4">
                {capsule.recipients.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-accent-purple/10 border border-accent-purple/20 flex items-center justify-center text-accent-purple text-xs font-black shadow-lg shadow-accent-purple/5 transition-transform group-hover:scale-110">
                      {r.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{r.email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Transmission Mode</h4>
              <div className="flex items-center gap-4 p-4 glass bg-white/5 border-white/10 rounded-3xl">
                <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-xs font-black text-white/60 uppercase tracking-widest">{capsule.deliveryMode.replace('-', ' ')} protocol</span>
              </div>
            </div>

            {capsule.tags.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Archive Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {capsule.tags.map(t => (
                    <span key={t} className="px-4 py-2 glass bg-white/5 border-white/10 rounded-xl text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-accent-purple transition-colors">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCapsule;
