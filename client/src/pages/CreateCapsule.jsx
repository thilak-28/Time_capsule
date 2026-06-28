import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Lock, ArrowLeft, Plus, X, Calendar as CalendarIcon, UserPlus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import RichTextEditor from '../components/RichTextEditor';

const CreateCapsule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [capsuleId, setCapsuleId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    psFilingDate: new Date(),
    recipientEmails: [''],
    selectedIntervals: []
  });

  const handleRecipientChange = (index, value) => {
    const newRecipients = [...formData.recipientEmails];
    newRecipients[index] = value;
    setFormData({ ...formData, recipientEmails: newRecipients });
  };

  const addRecipient = () => {
    setFormData({ ...formData, recipientEmails: [...formData.recipientEmails, ''] });
  };

  const removeRecipient = (index) => {
    const newRecipients = formData.recipientEmails.filter((_, i) => i !== index);
    setFormData({ ...formData, recipientEmails: newRecipients });
  };

  const handleIntervalChange = (months) => {
    const current = formData.selectedIntervals;
    if (current.includes(months)) {
      setFormData({
        ...formData,
        selectedIntervals: current.filter(i => i !== months)
      });
    } else {
      setFormData({
        ...formData,
        selectedIntervals: [...current, months].sort((a, b) => a - b)
      });
    }
  };

  // Converts local date picker value to YYYY-MM-DD string (timezone-safe)
  const toDateString = (date) => {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const saveDraft = async () => {
    if (!formData.title) return toast.error('PS Title is required');
    setLoading(true);
    
    const payload = {
      title: formData.title,
      description: formData.description,
      psFilingDate: toDateString(formData.psFilingDate),
      recipientEmails: formData.recipientEmails.filter(email => email.trim() !== ''),
      selectedIntervals: formData.selectedIntervals,
      status: 'draft'
    };

    try {
      if (capsuleId) {
        await api.put(`/capsules/${capsuleId}`, payload);
        toast.success('Draft updated');
      } else {
        const { data } = await api.post('/capsules', payload);
        setCapsuleId(data.data._id);
        toast.success('Draft saved');
      }
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async () => {
    if (!formData.title || !formData.description) {
      return toast.error('PS Title and PS Details are required');
    }

    const validEmails = formData.recipientEmails.filter(email => email.trim() !== '');
    if (validEmails.length === 0) {
      return toast.error('At least one recipient email is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of validEmails) {
      if (!emailRegex.test(email)) {
        return toast.error(`Invalid email format: ${email}`);
      }
    }

    if (formData.selectedIntervals.length === 0) {
      return toast.error('Please select at least one reminder interval');
    }
    
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      psFilingDate: toDateString(formData.psFilingDate),
      recipientEmails: validEmails,
      selectedIntervals: formData.selectedIntervals,
      status: 'active'
    };

    try {
      let id = capsuleId;
      if (!id) {
        const { data } = await api.post('/capsules', payload);
        id = data.data._id;
      } else {
        await api.put(`/capsules/${id}`, payload);
      }
      
      await api.post(`/capsules/${id}/seal`);
      toast.success('PS Reminder created and scheduled successfully! 🕰️');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  const intervalOptions = [2, 4, 6, 8, 10, 12, 14, 16, 17];

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
          <button onClick={handleCreateReminder} disabled={loading} className="vintage-btn-primary flex-1 sm:flex-none justify-center">
            <Lock className="w-4 h-4" />
            Create Reminder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Editor */}
        <div className="lg:col-span-8 space-y-8">
          <div className="vintage-card p-8 space-y-6 paper-pattern">
            <input
              type="text"
              placeholder="PS Title..."
              className="text-4xl font-bold font-serif bg-transparent border-none outline-none w-full text-[#1F2937] placeholder:text-[#4B5563]/60 tracking-tight"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="border-t border-sage-gold pt-6">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-[#14532D] mb-2 block">
                PS Details
              </label>
              <RichTextEditor
                content={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-4 space-y-8">
          <div className="vintage-card p-8 space-y-8">
            {/* Filing Date */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-[#14532D] ml-1 flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-ink-green" />
                Date of PS Filing
              </label>
              <DatePicker
                selected={formData.psFilingDate}
                onChange={(date) => setFormData({ ...formData, psFilingDate: date })}
                className="w-full vintage-input bg-[#fdfdf9] cursor-pointer"
                dateFormat="dd MMMM yyyy"
              />
            </div>

            {/* Reminder Intervals */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-[#14532D] ml-1">
                Reminder Intervals
              </label>
              <div className="bg-sage-gold/10 border border-sage-gold/30 rounded-2xl p-4 space-y-3">
                {intervalOptions.map((months) => (
                  <label key={months} className="flex items-center gap-3 text-sm text-[#374151] font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4.5 h-4.5 rounded border-sage-gold text-ink-green focus:ring-ink-green cursor-pointer"
                      checked={formData.selectedIntervals.includes(months)}
                      onChange={() => handleIntervalChange(months)}
                    />
                    <span>Every {months} months</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Designated Recipients */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-[#14532D] ml-1 flex items-center justify-between">
                Designated Recipients
                <button onClick={addRecipient} className="p-1.5 bg-[#fdfdf9] border border-sage-gold hover:bg-sage-gold/25 text-ink-green rounded-lg transition-all cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </label>
              <div className="space-y-3">
                {formData.recipientEmails.map((email, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="relative flex-1 group">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-deep-forest/30 group-focus-within:text-ink-green transition-colors" />
                      <input
                        type="email"
                        className="w-full vintage-input pl-10 py-2 text-sm"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => handleRecipientChange(i, e.target.value)}
                      />
                    </div>
                    {formData.recipientEmails.length > 1 && (
                      <button onClick={() => removeRecipient(i)} className="text-deep-forest/30 hover:text-red-600 transition-colors cursor-pointer">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCapsule;
