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
    <div className="space-y-10 stagger-in">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white tracking-tight">Received Capsules</h1>
        <p className="text-white/45 font-medium">Echoes from the past that have reached you.</p>
      </div>

      {capsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capsules.map((capsule) => (
            <CapsuleCard key={capsule._id} capsule={capsule} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass rounded-[40px] border-white/5 bg-white/[0.02]">
          <div className="inline-flex p-6 bg-accent-purple/10 border border-accent-purple/20 rounded-3xl mb-6 shadow-2xl shadow-accent-purple/5">
            <InboxIcon className="w-10 h-10 text-accent-purple" />
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Quiet Horizons</h3>
          <p className="text-white/30 mt-2 font-medium max-w-xs mx-auto">No capsules have arrived for you yet. They might still be drifting through time.</p>
        </div>
      )}
    </div>
  );
};

export default Inbox;
