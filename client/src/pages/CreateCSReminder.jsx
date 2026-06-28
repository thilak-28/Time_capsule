import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Lock, ArrowLeft, Plus, X, Calendar as CalendarIcon, UserPlus } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import RichTextEditor from '../components/RichTextEditor';

const CreateCSReminder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reminderId, setReminderId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    csFilingDate: new Date(),
    recipientEmails: [''],
    selectedIntervals: [],
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

  const handleIntervalChange = (days) => {
    const current = formData.selectedIntervals;
    if (current.includes(days)) {
      setFormData({ ...formData, selectedIntervals: current.filter(i => i !== days) });
    } else {
      setFormData({ ...formData, selectedIntervals: [...current, days].sort((a, b) => a - b) });
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
    if (!formData.title) return toast.error('CS Title is required');
    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      csFilingDate: toDateString(formData.csFilingDate),
      recipientEmails: formData.recipientEmails.filter(e => e.trim() !== ''),
      selectedIntervals: formData.selectedIntervals,
      status: 'draft',
    };

    try {
      if (reminderId) {
        await api.put(`/cs-reminders/${reminderId}`, payload);
        toast.success('Draft updated');
      } else {
        const { data } = await api.post('/cs-reminders', payload);
        setReminderId(data.data._id);
        toast.success('Draft saved');
      }
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = async () => {
    if (!formData.title || !formData.description) {
      return toast.error('CS Title and CS Details are required');
    }

    const validEmails = formData.recipientEmails.filter(e => e.trim() !== '');
    if (validEmails.length === 0) return toast.error('At least one recipient email is required');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of validEmails) {
      if (!emailRegex.test(email)) return toast.error(`Invalid email format: ${email}`);
    }

    if (formData.selectedIntervals.length === 0) {
      return toast.error('Please select at least one reminder interval');
    }

    setLoading(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      csFilingDate: toDateString(formData.csFilingDate),
      recipientEmails: validEmails,
      selectedIntervals: formData.selectedIntervals,
      status: 'active',
    };

    try {
      let id = reminderId;
      if (!id) {
        const { data } = await api.post('/cs-reminders', payload);
        id = data.data._id;
      } else {
        await api.put(`/cs-reminders/${id}`, payload);
      }
      await api.post(`/cs-reminders/${id}/seal`);
      toast.success('CS Reminder created and scheduled successfully! 📋');
      navigate('/dashboard?tab=cs');
    } catch {
      toast.error('Failed to create CS reminder');
    } finally {
      setLoading(false);
    }
  };

  // CS-specific: day intervals
  const intervalOptions = [5, 10, 15, 20];

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
          <button onClick={handleCreateReminder} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold font-serif rounded-xl transition-all cursor-pointer flex-1 sm:flex-none justify-center">
            <Lock className="w-4 h-4" />
            Create CS Reminder
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Editor */}
        <div className="lg:col-span-8 space-y-8">
          <div className="vintage-card p-8 space-y-6 paper-pattern">
            <input
              type="text"
              placeholder="CS Title..."
              className="text-4xl font-bold font-serif bg-transparent border-none outline-none w-full text-[#1F2937] placeholder:text-[#4B5563]/60 tracking-tight"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <div className="border-t border-sage-gold pt-6">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-purple-700 mb-2 block">
                CS Details
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
            {/* CS Filing Date */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-purple-700 ml-1 flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-purple-600" />
                Date of CS Filing
              </label>
              <DatePicker
                selected={formData.csFilingDate}
                onChange={(date) => setFormData({ ...formData, csFilingDate: date })}
                className="w-full vintage-input bg-[#fdfdf9] cursor-pointer"
                dateFormat="dd MMMM yyyy"
              />
            </div>

            {/* Day-based Reminder Intervals */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-purple-700 ml-1">
                Reminder Intervals (Days)
              </label>
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-3">
                {intervalOptions.map((days) => (
                  <label key={days} className="flex items-center gap-3 text-sm text-[#374151] font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                      checked={formData.selectedIntervals.includes(days)}
                      onChange={() => handleIntervalChange(days)}
                    />
                    <span>After {days} days</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Designated Recipients */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold font-serif uppercase tracking-[0.2em] text-purple-700 ml-1 flex items-center justify-between">
                Designated Recipients
                <button onClick={addRecipient} className="p-1.5 bg-[#fdfdf9] border border-purple-200 hover:bg-purple-50 text-purple-600 rounded-lg transition-all cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </label>
              <div className="space-y-3">
                {formData.recipientEmails.map((email, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="relative flex-1 group">
                      <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300 group-focus-within:text-purple-600 transition-colors" />
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

export default CreateCSReminder;
