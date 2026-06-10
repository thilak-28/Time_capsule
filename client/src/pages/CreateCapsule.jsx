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
    coverImage: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=800',
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
    <div className="max-w-6xl mx-auto space-y-10 pb-24 stagger-in px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="p-3 border border-sage-gold bg-[#fdfdf9] hover:bg-sage-gold/25 text-ink-green rounded-xl transition-all w-fit cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-3 w-full sm:w-auto">
          <button onClick={saveDraft} disabled={loading} className="vintage-btn-secondary flex-1 sm:flex-none justify-center">
            <Save className="w-4 h-4" />
            Save Draft
          </button>
          <button onClick={handleSeal} disabled={loading} className="vintage-btn-primary flex-1 sm:flex-none justify-center">
            <Lock className="w-4 h-4" />
            Seal Protocol
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Editor & Media */}
        <div className="lg:col-span-8 space-y-8">
          <div className="vintage-card p-8 space-y-6 paper-pattern">
            <input
              type="text"
              placeholder="Archive Title..."
              className="text-4xl font-bold font-serif bg-transparent border-none outline-none w-full text-deep-forest placeholder:text-deep-forest/20 tracking-tight"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="border-t border-sage-gold pt-6">
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData({ ...formData, content: html })}
              />
            </div>
          </div>

          <div className="vintage-card p-8">
            <h3 className="text-xl font-bold font-serif mb-6 flex items-center gap-3 text-deep-forest">
              <ImageIcon className="w-5 h-5 text-ink-green" />
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
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-sage-gold bg-sage-gold/10 group relative">
                    <img src={url} alt="Attachment" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-[#0d530e]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Plus className="w-6 h-6 text-paper-cream rotate-45" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-4 space-y-8">
          <div className="vintage-card p-8 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1 flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-ink-green" />
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
                className="w-full vintage-input"
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">Access Protocol</label>
              <div className="flex gap-1 sm:gap-2 p-1 bg-sage-gold/20 border border-sage-gold/30 rounded-2xl">
                {['private', 'shared', 'public'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFormData({ ...formData, privacy: p })}
                    className={`flex-1 py-2 rounded-xl text-[9px] sm:text-[10px] font-bold font-serif uppercase tracking-wider transition-all cursor-pointer ${
                      formData.privacy === p 
                        ? 'bg-deep-forest text-paper-cream shadow-md' 
                        : 'text-deep-forest/50 hover:text-deep-forest hover:bg-sage-gold/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1 flex items-center justify-between">
                Designated Recipients
                <button onClick={addRecipient} className="p-1.5 bg-[#fdfdf9] border border-sage-gold hover:bg-sage-gold/25 text-ink-green rounded-lg transition-all cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </label>
              <div className="space-y-3">
                {formData.recipients.map((r, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="relative flex-1 group">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
                      <input
                        type="email"
                        className="w-full vintage-input pl-10 py-2 text-sm"
                        placeholder="email@example.com"
                        value={r.email}
                        onChange={(e) => handleRecipientChange(i, e.target.value)}
                      />
                    </div>
                    {formData.recipients.length > 1 && (
                      <button onClick={() => removeRecipient(i)} className="text-deep-forest/30 hover:text-red-600 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-deep-forest/50 ml-1">Transmission Mode</label>
              <select
                className="w-full vintage-input py-2 text-sm bg-[#fdfdf9] cursor-pointer"
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
