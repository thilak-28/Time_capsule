import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Loader2, Archive, Lock, Send, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import CapsuleCard from '../components/CapsuleCard';
import { toast } from 'react-hot-toast';

const Dashboard = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const { data } = await api.get('/capsules');
        setCapsules(data.data);
      } catch (error) {
        console.error('Failed to fetch capsules', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCapsules();
  }, []);

  const handleCardDelete = (deletedId) => {
    setCapsules(prev => prev.filter(c => c._id !== deletedId));
  };

  const handleDeleteAll = async () => {
    if (capsules.length === 0) {
      toast.error("You have no capsules to delete");
      return;
    }

    if (!window.confirm("CRITICAL WARNING: Are you sure you want to delete ALL your capsules? This action is absolute, permanent, and cannot be undone.")) {
      return;
    }

    const confirmText = window.prompt("Type 'DELETE ALL' below to confirm the destruction of all your capsules:");
    if (confirmText !== "DELETE ALL") {
      toast.error("Wipe cancelled");
      return;
    }

    try {
      await api.delete('/capsules');
      setCapsules([]);
      toast.success('All capsules deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete capsules');
    }
  };

  const filteredCapsules = capsules.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { name: 'Total Capsules', value: capsules.length, icon: Archive, color: 'text-blue-500' },
    { name: 'Sealed', value: capsules.filter(c => c.status === 'sealed').length, icon: Lock, color: 'text-amber-500' },
    { name: 'Delivered', value: capsules.filter(c => c.status === 'delivered').length, icon: Send, color: 'text-emerald-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 stagger-in">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold text-white tracking-tight">My Archive</h1>
          <p className="text-white/45 font-medium">Safeguarding your future messages and memories.</p>
        </div>
        <Link to="/capsule/new" className="glass-btn-primary flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" />
          New Capsule
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 stagger-in" style={{ animationDelay: '0.1s' }}>
        {stats.map((stat) => (
          <div key={stat.name} className="glass bg-white/5 p-6 flex items-center gap-5">
            <div className={`p-3.5 rounded-2xl bg-white/5 border border-white/10 ${stat.color} shadow-lg`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">{stat.name}</p>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center stagger-in" style={{ animationDelay: '0.2s' }}>
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-accent-purple transition-colors" />
          <input
            type="text"
            className="w-full glass-input pl-12"
            placeholder="Search capsules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-6 py-2.5 glass bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all flex-1 sm:flex-none justify-center">
            <Filter className="w-4 h-4" />
            <span className="font-semibold text-sm">Sort & Filter</span>
          </button>
          <button 
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all flex-1 sm:flex-none justify-center cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-semibold text-sm">Delete All</span>
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredCapsules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-in" style={{ animationDelay: '0.3s' }}>
          {filteredCapsules.map((capsule) => (
            <CapsuleCard key={capsule._id} capsule={capsule} onDelete={handleCardDelete} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 glass bg-white/[0.02] stagger-in" style={{ animationDelay: '0.3s' }}>
          <div className="inline-flex p-6 bg-accent-purple/10 border border-accent-purple/20 rounded-full mb-6">
            <Archive className="w-10 h-10 text-accent-purple" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No capsules found</h3>
          <p className="text-white/40 font-medium mb-8 max-w-sm mx-auto">It looks like your archive is empty. Begin your journey by creating your first digital capsule.</p>
          <Link to="/capsule/new" className="glass-btn-primary inline-flex items-center gap-2">
            Create First Capsule <Plus className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
