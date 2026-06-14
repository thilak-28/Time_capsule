import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Users, FileText, Mail, ChevronRight, Shield, Search, LogOut, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users');
        setUsers(data.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDelete = async (e, user) => {
    e.stopPropagation(); // Don't navigate to user detail
    if (!window.confirm(`Delete user "${user.name}" and ALL their reminders? This cannot be undone.`)) return;
    setDeletingId(user._id);
    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast.success(`User "${user.name}" deleted successfully`);
    } catch (err) {
      toast.error('Failed to delete user');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
              <Shield className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Admin Panel</h1>
              <p className="text-slate-400 text-xs mt-0.5">Lextria Filing Reminder Manager</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Users', value: users.length, icon: Users, color: 'indigo' },
            { label: 'Total PS Reminders', value: users.reduce((a, u) => a + (u.psCount || 0), 0), icon: FileText, color: 'emerald' },
            { label: 'Total CS Reminders', value: users.reduce((a, u) => a + (u.csCount || 0), 0), icon: Mail, color: 'violet' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm`}>
              <div className={`p-2 w-fit rounded-lg bg-${color}-500/20 border border-${color}-500/30 mb-3`}>
                <Icon className={`w-4 h-4 text-${color}-400`} />
              </div>
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-slate-400 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>

        {/* Users List */}
        <div className="space-y-3">
          <h2 className="text-slate-300 font-semibold text-sm uppercase tracking-wider">All Users ({filtered.length})</h2>
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No users found</div>
          ) : (
            filtered.map(user => (
              <button
                key={user._id}
                onClick={() => navigate(`/admin/users/${user._id}`)}
                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/40 rounded-2xl p-5 flex items-center justify-between transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-semibold">{user.name}</div>
                    <div className="text-slate-400 text-sm">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-white font-bold">{user.psCount || 0}</div>
                      <div className="text-slate-500 text-xs">PS</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold">{user.csCount || 0}</div>
                      <div className="text-slate-500 text-xs">CS</div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, user)}
                    disabled={deletingId === user._id}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 hover:border-red-500/50 text-red-400 transition-all cursor-pointer disabled:opacity-50"
                    title="Delete user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
