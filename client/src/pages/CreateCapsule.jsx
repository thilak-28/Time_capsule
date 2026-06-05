import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Lock, ArrowLeft, Plus, X, Calendar as CalendarIcon, UserPlus, Image as ImageIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import RichTextEditor from '../components/RichTextEditor';
import MediaUploader from '../components/MediaUploader';

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [capsuleId, setCapsuleId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    coverImage: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&q=80&w=800',
    unlockDate: new Date(Date.now() + 86400000 * 7), // Default 1 week
    deliveryMode: 'in-app',
    privacy: 'private',
    recipients: [{ email: '' }],
    media: [],
  });

  const handleRecipientChange = (index, value) => {
    const newRecipients = [...formData.recipients];
    newRecipients[index].email = value;
    setFormData({ ...formData, recipients: newRecipients });
  };

  const addRecipient = () => {
    setFormData({ ...formData, recipients: [...formData.recipients, { email: '' }] });
  };

  const removeRecipient = (index) => {
    const newRecipients = formData.recipients.filter((_, i) => i !== index);
    setFormData({ ...formData, recipients: newRecipients });
  };

  const saveDraft = async () => {
    if (!formData.title) return toast.error('Title is required');
    setLoading(true);
    try {
      if (capsuleId) {
        await api.put(`/capsules/${capsuleId}`, formData);
        toast.success('Draft updated');
      } else {
        const { data } = await api.post('/capsules', formData);
        setCapsuleId(data.data._id);
        toast.success('Draft saved');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSeal = async () => {
    if (!formData.title || !formData.content) {
      return toast.error('Title and Content are required to seal');
    }
    
    setLoading(true);
    try {
      let id = capsuleId;
      if (!id) {
        const { data } = await api.post('/capsules', formData);
        id = data.data._id;
      } else {
        await api.put(`/capsules/${id}`, formData);
      }
      
      await api.post(`/capsules/${id}/seal`);
      toast.success('Capsule sealed and time-locked! 🕰️');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to seal capsule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 stagger-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="p-3 glass bg-white/5 border-white/10 hover:bg-white/10 rounded-xl transition-all w-fit">
          <ArrowLeft className="w-5 h-5 text-white/70" />
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={saveDraft} disabled={loading} className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 sm:px-6 py-2.5 glass bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all font-semibold text-xs sm:text-sm">
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button onClick={handleSeal} disabled={loading} className="flex-1 sm:flex-none justify-center glass-btn-primary flex items-center gap-2 text-xs sm:text-sm px-4 sm:px-8 py-2.5">
            <Lock className="w-4 h-4" />
            Seal Protocol
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Editor & Media */}
        <div className="lg:col-span-8 space-y-8">
          <div className="glass p-8 space-y-6">
            <input
              type="text"
              placeholder="Archive Title..."
              className="text-4xl font-bold bg-transparent border-none outline-none w-full text-white placeholder:text-white/10 tracking-tight"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="border-t border-white/5 pt-6">
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
              />
            </div>
          </div>

          <div className="glass p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
              <ImageIcon className="w-5 h-5 text-accent-purple" />
              Preserved Media
            </h3>
            <div className="p-1">
              <MediaUploader 
                capsuleId={capsuleId} 
                onUploadComplete={(media) => setFormData({ ...formData, media })} 
              />
            </div>
            {formData.media.length > 0 && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {formData.media.map((url, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 glass bg-white/5 group relative">
                    <img src={url} alt="Attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-navy-base/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white rotate-45" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-accent-purple" />
                Unlock Timestamp
              </label>
              <DatePicker
                selected={formData.unlockDate}
                onChange={(date) => setFormData({ ...formData, unlockDate: date })}
                minDate={new Date()}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="time"
                className="w-full glass-input"
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Access Protocol</label>
              <div className="flex gap-1 sm:gap-2 p-1 glass bg-white/5 border-white/5 rounded-2xl">
                {['private', 'shared', 'public'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFormData({ ...formData, privacy: p })}
                    className={`flex-1 py-2 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all ${
                      formData.privacy === p 
                        ? 'bg-accent-purple text-white shadow-lg shadow-accent-purple/20' 
                        : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1 flex items-center justify-between">
                Designated Recipients
                <button onClick={addRecipient} className="p-1.5 glass bg-white/5 border-white/10 hover:bg-accent-purple/20 text-accent-purple rounded-lg transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </label>
              <div className="space-y-3">
                {formData.recipients.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="relative flex-1 group">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-accent-purple transition-colors" />
                      <input
                        type="email"
                        className="w-full glass-input pl-10 py-2 text-sm"
                        placeholder="email@example.com"
                        value={r.email}
                        onChange={(e) => handleRecipientChange(i, e.target.value)}
                      />
                    </div>
                    {formData.recipients.length > 1 && (
                      <button onClick={() => removeRecipient(i)} className="text-white/20 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Transmission Mode</label>
              <select
                className="w-full glass-input py-2 text-sm appearance-none bg-navy-base"
                value={formData.deliveryMode}
                onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
              >
                <option value="in-app">Vault Direct (In-App)</option>
                <option value="email">Deep Space Relay (Email)</option>
                <option value="both">Hybrid Protocol (Both)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCapsule;
