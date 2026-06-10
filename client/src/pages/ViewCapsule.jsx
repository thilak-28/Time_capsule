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
    <div className="max-w-6xl mx-auto space-y-10 pb-24 stagger-in px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-3 border border-sage-gold bg-[#fdfdf9] hover:bg-sage-gold/25 text-ink-green rounded-xl transition-all group w-fit cursor-pointer">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        {isCreator && (
          <button 
            onClick={handleDelete}
            className="px-6 py-3 bg-red-500/5 border border-red-500/20 text-red-700 hover:text-red-800 hover:bg-red-500/10 font-bold font-serif rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            Delete Capsule
          </button>
        )}
      </div>

      <div className="relative h-[260px] sm:h-[450px] rounded-3xl overflow-hidden shadow-sm border border-sage-gold">
        <img src={capsule.coverImage} alt={capsule.title} className="w-full h-full object-cover brightness-90 scale-102" />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-forest via-deep-forest/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 sm:bottom-12 sm:left-12 sm:right-12">
          <div className="flex items-center gap-4 text-white/50 text-[10px] font-bold font-serif uppercase tracking-[0.2em] mb-4">
            <span className={`rubber-stamp ${
              capsule.status === 'sealed' ? 'stamp-sealed' : 'stamp-delivered'
            }`}>
              {capsule.status}
            </span>
            <span className="flex items-center gap-2 text-paper-cream/80">
              <Calendar className="w-4 h-4 text-paper-cream" />
              {format(new Date(capsule.createdAt), 'MMMM d, yyyy')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold font-serif text-paper-cream tracking-tight leading-none">{capsule.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {!isUnlocked && capsule.status === 'sealed' ? (
            <div className="vintage-card p-16 text-center rounded-3xl space-y-8 stagger-in">
              <div className="inline-flex p-8 bg-[#800020]/10 border border-[#800020]/25 rounded-3xl shadow-sm animate-pulse">
                <Lock className="w-16 h-16 text-[#800020]" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold font-serif text-deep-forest tracking-tight">Time-Locked Protocol</h2>
                <p className="text-deep-forest/60 max-w-sm mx-auto font-medium leading-relaxed">
                  This memory is preserved in a sealed envelope and will materialize on <br />
                  <span className="text-[#800020] font-bold text-xl mt-2 block tracking-wide">
                    {format(new Date(capsule.unlockDate), 'PPPP p')}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <div className="vintage-card p-12 rounded-3xl shadow-sm paper-pattern lined-paper text-deep-forest stagger-in">
              <div className="prose max-w-none text-deep-forest prose-p:text-deep-forest/80 prose-p:leading-loose prose-p:text-lg prose-headings:text-deep-forest prose-headings:font-bold prose-headings:font-serif">
                <div dangerouslySetInnerHTML={{ __html: capsule.content }} />
              </div>
              
              {capsule.media.length > 0 && (
                <div className="mt-16 pt-12 border-t border-sage-gold space-y-8">
                  <h3 className="flex items-center gap-3 text-2xl font-bold font-serif text-deep-forest tracking-tight">
                    <ImageIcon className="w-6 h-6 text-ink-green" /> Preserved Media
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                    {capsule.media.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer" className="group relative aspect-video rounded-3xl overflow-hidden border border-sage-gold bg-sage-gold/10">
                        <img src={url} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-[#0d530e]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-xs">
                          <div className="p-3 bg-paper-cream/20 rounded-2xl border border-paper-cream/40">
                            <FileText className="w-6 h-6 text-paper-cream" />
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
          <div className="vintage-card p-10 rounded-3xl space-y-10 shadow-sm">
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold font-serif text-deep-forest/40 uppercase tracking-[0.3em]">Designated Recipients</h4>
              <div className="space-y-4">
                {capsule.recipients.map((r, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-2xl bg-sage-gold/25 border border-sage-gold flex items-center justify-center text-ink-green text-xs font-bold shadow-sm transition-transform group-hover:scale-105">
                      {r.email[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-deep-forest/80 group-hover:text-deep-forest transition-colors">{r.email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-bold font-serif text-deep-forest/40 uppercase tracking-[0.3em]">Transmission Mode</h4>
              <div className="flex items-center gap-4 p-4 bg-sage-gold/20 border border-sage-gold/45 rounded-3xl">
                <div className="p-2 bg-deep-forest/10 rounded-xl border border-sage-gold">
                  <Mail className="w-5 h-5 text-ink-green" />
                </div>
                <span className="text-xs font-bold text-deep-forest/65 uppercase tracking-widest">{capsule.deliveryMode.replace('-', ' ')} protocol</span>
              </div>
            </div>

            {capsule.tags.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold font-serif text-deep-forest/40 uppercase tracking-[0.3em]">Archive Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {capsule.tags.map(t => (
                    <span key={t} className="px-4 py-2 bg-sage-gold/25 border border-sage-gold/50 rounded-xl text-[10px] font-bold text-deep-forest/60 uppercase tracking-widest hover:text-ink-green hover:border-ink-green transition-colors">
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
