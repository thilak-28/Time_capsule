import { useState, useEffect } from 'react';
import { Inbox as InboxIcon, Loader2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CapsuleCard from '../components/CapsuleCard';

const Inbox = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInbox = async () => {
      try {
        const { data } = await api.get('/capsules/inbox');
        setCapsules(data.data);
      } catch (error) {
        console.error('Failed to fetch inbox', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInbox();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 stagger-in">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold font-serif text-deep-forest tracking-tight">Received PS Reminders</h1>
        <p className="text-deep-forest/65 font-medium">PS Reminders shared with you by other creators.</p>
      </div>

      {capsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capsules.map((capsule) => (
            <CapsuleCard key={capsule._id} capsule={capsule} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 vintage-card">
          <div className="inline-flex p-6 bg-sage-gold/25 border border-sage-gold/50 rounded-3xl mb-6">
            <InboxIcon className="w-10 h-10 text-ink-green" />
          </div>
          <h3 className="text-2xl font-bold font-serif text-deep-forest tracking-tight">No PS Reminders</h3>
          <p className="text-deep-forest/60 mt-2 font-medium max-w-sm mx-auto">No reminders have been assigned to you yet.</p>
        </div>
      )}
    </div>
  );
};

export default Inbox;
