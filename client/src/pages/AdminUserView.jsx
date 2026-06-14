import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, FileText, Mail, CheckCircle, AlertCircle, Clock, User } from 'lucide-react';

const AdminUserView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ps');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await api.get(`/admin/users/${id}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white">
      Loading...
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-white">
      User not found
    </div>
  );

  const { user, psReminders, csReminders, stats } = data;
  const now = new Date();

  const getScheduleStatus = (schedule) => {
    if (schedule.emailSent) return 'completed';
    if (new Date(schedule.scheduledDate) < now) return 'overdue';
    return 'upcoming';
  };

  const StatusBadge = ({ status }) => {
    const map = {
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      overdue: 'bg-red-500/20 text-red-400 border-red-500/30',
      upcoming: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[status]}`}>
        {status}
      </span>
    );
  };

  const reminders = tab === 'ps' ? psReminders : csReminders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-white font-bold leading-none">{user.name}</h1>
              <p className="text-slate-400 text-xs mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'PS Reminders', value: stats.totalPS, color: 'text-indigo-400' },
            { label: 'CS Reminders', value: stats.totalCS, color: 'text-violet-400' },
            { label: 'Emails Sent', value: stats.totalEmailsSent, color: 'text-emerald-400' },
            { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-400' },
            { label: 'Overdue', value: stats.overdue, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-slate-400 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'ps', label: `PS Reminders (${psReminders.length})`, icon: FileText },
            { key: 'cs', label: `CS Reminders (${csReminders.length})`, icon: Mail },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                tab === key
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="text-center py-16 text-slate-400 bg-white/5 border border-white/10 rounded-2xl">
            No {tab.toUpperCase()} reminders yet
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map(reminder => {
              const schedules = reminder.schedules || [];
              return (
                <div key={reminder._id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-lg">{reminder.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">
                        Filed: {new Date(tab === 'ps' ? reminder.psFilingDate : reminder.csFilingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        Recipients: {reminder.recipientEmails?.join(', ')}
                      </p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      reminder.status === 'active'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                      {reminder.status}
                    </span>
                  </div>

                  {/* Schedules */}
                  {schedules.length > 0 && (
                    <div className="border-t border-white/5 pt-4">
                      <p className="text-slate-500 text-xs uppercase tracking-wider mb-3">Reminder Schedules</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {schedules.map(s => {
                          const status = getScheduleStatus(s);
                          return (
                            <div key={s._id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                              <div>
                                <div className="text-white text-xs font-medium">
                                  {tab === 'ps' ? `${s.intervalMonths}mo` : `${s.intervalDays}d`}
                                </div>
                                <div className="text-slate-500 text-xs">
                                  {new Date(s.scheduledDate).toLocaleDateString('en-IN')}
                                </div>
                              </div>
                              <StatusBadge status={status} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserView;
