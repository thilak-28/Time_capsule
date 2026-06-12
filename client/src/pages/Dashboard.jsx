import { useState, useEffect } from 'react';
import { Plus, Search, Loader2, ClipboardList, Clock, Calendar, Mail, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import CapsuleCard from '../components/CapsuleCard';
import CSCapsuleCard from '../components/CSCapsuleCard';
import { toast } from 'react-hot-toast';

// ─── Shared chart helpers ────────────────────────────────────────────────────

const AnalyticsSection = ({ analytics, accentColor = '#0D530E', label = 'PS' }) => {
  if (!analytics) return null;
  const { metrics, upcomingReminders, charts } = analytics;

  const maxBarCount = Math.max(...charts.monthlyCount.map(c => c.count), 1);
  const barChartWidth = 500, barChartHeight = 160, barPadding = 10;
  const numBars = charts.monthlyCount.length;
  const barWidth = (barChartWidth / numBars) - barPadding;

  const totalStatusCount = charts.statusDistribution.reduce((sum, item) => sum + item.value, 0);
  const donutRadius = 50;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let currentOffset = 0;
  const colors = label === 'PS'
    ? ['#3182ce', '#38a169', '#e53e3e']
    : ['#6b46c1', '#38a169', '#e53e3e'];

  const donutSegments = charts.statusDistribution.map((item, index) => {
    const percentage = totalStatusCount > 0 ? (item.value / totalStatusCount) : 0;
    const dashArray = `${percentage * donutCircumference} ${donutCircumference}`;
    const dashOffset = currentOffset;
    currentOffset -= percentage * donutCircumference;
    return { ...item, color: colors[index] || '#cbd5e0', dashArray, dashOffset };
  });

  const maxLineCount = Math.max(...charts.emailsSentOverTime.map(c => c.count), 1);
  const lineChartWidth = 500, lineChartHeight = 160;
  const points = charts.emailsSentOverTime.map((item, index) => {
    const x = (index * (lineChartWidth / 11));
    const y = lineChartHeight - (item.count / maxLineCount) * (lineChartHeight - 30) - 15;
    return { x, y, ...item };
  });
  const linePath = points.length > 0
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${lineChartHeight} L ${points[0].x} ${lineChartHeight} Z`
    : '';

  const metricCards = [
    { name: `Total ${label} Reminders`, value: metrics.totalReminders, icon: ClipboardList, color: `text-deep-forest bg-sage-gold/20` },
    { name: 'Upcoming This Month', value: metrics.upcomingThisMonth, icon: Calendar, color: 'text-[#3182ce] bg-blue-50' },
    { name: 'Due Within 7 Days', value: metrics.dueWithin7Days, icon: Clock, color: 'text-[#e53e3e] bg-red-50' },
    { name: 'Completed Reminders', value: metrics.completedReminders, icon: CheckCircle, color: 'text-[#38a169] bg-green-50' },
    { name: 'Total Emails Sent', value: metrics.totalEmailsSent, icon: Mail, color: label === 'PS' ? 'text-ink-green bg-sage-gold/15' : 'text-purple-700 bg-purple-50' },
  ];

  return (
    <div className="space-y-10">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-in" style={{ animationDelay: '0.1s' }}>
        {metricCards.map((stat) => (
          <div key={stat.name} className="bg-[#fdfdf9] border border-sage-gold p-4 flex flex-col justify-between rounded-2xl shadow-[0_4px_12px_rgba(13,83,14,0.02)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563] leading-tight">{stat.name}</span>
              <div className={`p-1.5 rounded-lg border border-sage-gold/20 ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-serif font-bold text-[#14532D]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-in animate-delay-150">
        {/* Bar Chart */}
        <div className="bg-[#fdfdf9] border border-sage-gold p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-deep-forest text-md mb-1">Monthly Reminder Count</h3>
            <p className="text-[10px] text-[#4B5563] uppercase tracking-widest font-semibold mb-4">Scheduled Reminders</p>
          </div>
          <div className="w-full flex items-center justify-center">
            <svg viewBox={`0 0 ${barChartWidth} ${barChartHeight}`} className="w-full h-36">
              {charts.monthlyCount.map((c, i) => {
                const height = (c.count / maxBarCount) * (barChartHeight - 40);
                const x = i * (barWidth + barPadding) + barPadding / 2;
                const y = barChartHeight - height - 20;
                return (
                  <g key={i} className="group cursor-pointer">
                    <rect x={x} y={20} width={barWidth} height={barChartHeight - 40} fill="#f7fafc" rx="4" />
                    <rect x={x} y={y} width={barWidth} height={height} fill={accentColor} opacity="0.85" rx="4" className="hover:opacity-100 transition-opacity" />
                    <text x={x + barWidth / 2} y={barChartHeight - 4} textAnchor="middle" fontSize="10" fill="#374151">{c.month}</text>
                    {c.count > 0 && <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" fontSize="9" fill={accentColor} fontWeight="bold">{c.count}</text>}
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-[#fdfdf9] border border-sage-gold p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-deep-forest text-md mb-1">Status Distribution</h3>
            <p className="text-[10px] text-[#4B5563] uppercase tracking-widest font-semibold mb-4">Schedules Summary</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                {totalStatusCount === 0 ? (
                  <circle cx="60" cy="60" r={donutRadius} fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                ) : (
                  donutSegments.map((seg, i) => (
                    <circle key={i} cx="60" cy="60" r={donutRadius} fill="transparent" stroke={seg.color} strokeWidth="12" strokeDasharray={seg.dashArray} strokeDashoffset={seg.dashOffset} strokeLinecap="round" />
                  ))
                )}
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#14532D]">{totalStatusCount}</span>
                <span className="text-[8px] text-[#4B5563] uppercase font-bold tracking-widest">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              {donutSegments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-[#374151]">{seg.name}</span>
                  </div>
                  <span className="font-bold text-[#1F2937]">{seg.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-[#fdfdf9] border border-sage-gold p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="font-serif font-bold text-deep-forest text-md mb-1">Emails Sent Over Time</h3>
            <p className="text-[10px] text-[#4B5563] uppercase tracking-widest font-semibold mb-4">Email Notifications Sent</p>
          </div>
          <div className="w-full flex items-center justify-center">
            <svg viewBox={`0 0 ${lineChartWidth} ${lineChartHeight}`} className="w-full h-36">
              <line x1={0} y1={lineChartHeight - 20} x2={lineChartWidth} y2={lineChartHeight - 20} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={0} y1={lineChartHeight / 2} x2={lineChartWidth} y2={lineChartHeight / 2} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 3" />
              {areaPath && <path d={areaPath} fill="url(#lineGrad)" opacity="0.15" />}
              {linePath && <path d={linePath} fill="transparent" stroke={accentColor} strokeWidth="3" strokeLinecap="round" />}
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accentColor} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              {points.map((p, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#fdfdf9" stroke={accentColor} strokeWidth="2.5" />
                  <text x={p.x} y={lineChartHeight - 4} textAnchor="middle" fontSize="10" fill="#374151">{p.month}</text>
                  {p.count > 0 && <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="8" fill={accentColor} fontWeight="bold">{p.count}</text>}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Upcoming table */}
      <div className="bg-[#fdfdf9] border border-sage-gold p-6 rounded-2xl space-y-4 shadow-sm stagger-in animate-delay-200">
        <h3 className="text-xl font-bold font-serif text-deep-forest">Upcoming {label} Reminders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-sage-gold text-[10px] font-bold font-serif uppercase tracking-widest text-[#4B5563]">
                <th className="py-3 px-4">{label} Title</th>
                <th className="py-3 px-4">Recipients</th>
                <th className="py-3 px-4">Next Reminder Date</th>
                <th className="py-3 px-4">Days Remaining</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sage-gold/30">
              {upcomingReminders.map((reminder) => {
                const days = reminder.daysRemaining;
                let dotColor = 'bg-[#e53e3e]';
                let textColor = 'text-red-700 bg-red-50';
                if (days > 30) { dotColor = 'bg-[#38a169]'; textColor = 'text-green-700 bg-green-50'; }
                else if (days > 7) { dotColor = 'bg-[#dd6b20]'; textColor = 'text-orange-700 bg-orange-50'; }
                const link = label === 'PS' ? `/capsule/${reminder.reminderId}` : `/cs-capsule/${reminder.reminderId}`;
                return (
                  <tr key={reminder._id} className="hover:bg-sage-gold/5 transition-colors">
                    <td className="py-4 px-4 font-bold text-sm text-deep-forest">
                      <Link to={link} className="hover:underline">{reminder.title}</Link>
                    </td>
                    <td className="py-4 px-4 text-sm text-[#374151] truncate max-w-xs">{reminder.recipients}</td>
                    <td className="py-4 px-4 text-sm text-[#374151]">
                      {new Date(reminder.nextReminderDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-[#1F2937]">
                      {days <= 0 ? <span className="text-red-600 font-bold">Overdue ({Math.abs(days)} days ago)</span> : <span>{days} days remaining</span>}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${textColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                        {reminder.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {upcomingReminders.length === 0 && (
                <tr><td colSpan="5" className="py-8 text-center text-[#4B5563]">No upcoming reminder schedules pending.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'cs' ? 'cs' : 'ps';

  const [psReminders, setPsReminders] = useState([]);
  const [csReminders, setCsReminders] = useState([]);
  const [psAnalytics, setPsAnalytics] = useState(null);
  const [csAnalytics, setCsAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [psRes, psAnalRes, csRes, csAnalRes] = await Promise.all([
        api.get('/capsules'),
        api.get('/capsules/analytics'),
        api.get('/cs-reminders'),
        api.get('/cs-reminders/analytics'),
      ]);
      setPsReminders(psRes.data.data);
      setPsAnalytics(psAnalRes.data.data);
      setCsReminders(csRes.data.data);
      setCsAnalytics(csAnalRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
      toast.error('Error loading dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handlePsDelete = (id) => {
    setPsReminders(prev => prev.filter(c => c._id !== id));
    api.get('/capsules/analytics').then(res => setPsAnalytics(res.data.data));
  };

  const handleCsDelete = (id) => {
    setCsReminders(prev => prev.filter(c => c._id !== id));
    api.get('/cs-reminders/analytics').then(res => setCsAnalytics(res.data.data));
  };

  const handleDeleteAll = async () => {
    if (activeTab === 'ps') {
      if (psReminders.length === 0) return toast.error('You have no PS reminders to delete');
      if (!window.confirm('Delete ALL PS Reminders? This cannot be undone.')) return;
      const confirmText = window.prompt("Type 'DELETE ALL' to confirm:");
      if (confirmText !== 'DELETE ALL') return toast.error('Wipe cancelled');
      try {
        await api.delete('/capsules');
        setPsReminders([]); setPsAnalytics(null);
        toast.success('All PS reminders deleted');
        fetchDashboardData();
      } catch (e) { toast.error('Failed to delete PS reminders'); }
    } else {
      if (csReminders.length === 0) return toast.error('You have no CS reminders to delete');
      if (!window.confirm('Delete ALL CS Reminders? This cannot be undone.')) return;
      const confirmText = window.prompt("Type 'DELETE ALL' to confirm:");
      if (confirmText !== 'DELETE ALL') return toast.error('Wipe cancelled');
      try {
        await api.delete('/cs-reminders');
        setCsReminders([]); setCsAnalytics(null);
        toast.success('All CS reminders deleted');
        fetchDashboardData();
      } catch (e) { toast.error('Failed to delete CS reminders'); }
    }
  };

  const filteredPs = psReminders.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCs = csReminders.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-ink-green" />
      </div>
    );
  }

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 stagger-in">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-serif text-deep-forest tracking-tight">Dashboard</h1>
          <p className="text-[#374151] font-medium">Manage your PS and CS filing schedules.</p>
        </div>
        {activeTab === 'ps' ? (
          <Link to="/capsule/new" className="vintage-btn-primary">
            <Plus className="w-5 h-5" /> New PS Reminder
          </Link>
        ) : (
          <Link to="/cs-capsule/new" className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold font-serif rounded-xl transition-all cursor-pointer">
            <Plus className="w-5 h-5" /> New CS Reminder
          </Link>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-sage-gold/10 border border-sage-gold/30 rounded-2xl w-fit">
        <button
          onClick={() => setSearchParams({ tab: 'ps' })}
          className={`px-8 py-2.5 rounded-xl font-serif font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'ps'
              ? 'bg-[#0D530E] text-white shadow-sm'
              : 'text-[#374151] hover:text-deep-forest'
          }`}
        >
          PS Reminders
        </button>
        <button
          onClick={() => setSearchParams({ tab: 'cs' })}
          className={`px-8 py-2.5 rounded-xl font-serif font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'cs'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'text-[#374151] hover:text-purple-700'
          }`}
        >
          CS Reminders
        </button>
      </div>

      {/* Analytics for active tab */}
      {activeTab === 'ps' && psAnalytics && (
        <AnalyticsSection analytics={psAnalytics} accentColor="#0D530E" label="PS" />
      )}
      {activeTab === 'cs' && csAnalytics && (
        <AnalyticsSection analytics={csAnalytics} accentColor="#6b46c1" label="CS" />
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center stagger-in" style={{ animationDelay: '0.2s' }}>
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B5563] group-focus-within:text-ink-green transition-colors" />
          <input
            type="text"
            className="w-full vintage-input pl-12"
            placeholder={`Search ${activeTab === 'ps' ? 'PS' : 'CS'} reminders...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={handleDeleteAll}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-500/5 border border-red-500/20 text-red-700 hover:text-red-800 hover:bg-red-500/10 transition-all flex-1 sm:flex-none justify-center cursor-pointer rounded-xl font-serif font-bold"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">Delete All</span>
        </button>
      </div>

      {/* Cards grid */}
      <div className="space-y-4 stagger-in" style={{ animationDelay: '0.25s' }}>
        <h3 className="text-xl font-bold font-serif text-deep-forest">
          All {activeTab === 'ps' ? 'PS' : 'CS'} Reminders
        </h3>
        {activeTab === 'ps' ? (
          filteredPs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPs.map(c => <CapsuleCard key={c._id} capsule={c} onDelete={handlePsDelete} />)}
            </div>
          ) : (
            <div className="text-center py-20 vintage-card">
              <div className="inline-flex p-6 bg-sage-gold/25 border border-sage-gold/50 rounded-full mb-6">
                <ClipboardList className="w-10 h-10 text-ink-green" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-deep-forest mb-2">No PS reminders found</h3>
              <p className="text-[#374151] font-medium mb-8 max-w-sm mx-auto">Create your first PS Reminder to get started.</p>
              <Link to="/capsule/new" className="vintage-btn-primary">Create First PS Reminder <Plus className="w-4 h-4" /></Link>
            </div>
          )
        ) : (
          filteredCs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCs.map(c => <CSCapsuleCard key={c._id} capsule={c} onDelete={handleCsDelete} />)}
            </div>
          ) : (
            <div className="text-center py-20 vintage-card">
              <div className="inline-flex p-6 bg-purple-100 border border-purple-200 rounded-full mb-6">
                <ClipboardList className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold font-serif text-deep-forest mb-2">No CS reminders found</h3>
              <p className="text-[#374151] font-medium mb-8 max-w-sm mx-auto">Create your first CS Reminder to get started.</p>
              <Link to="/cs-capsule/new" className="flex items-center gap-2 px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold font-serif rounded-xl transition-all cursor-pointer mx-auto w-fit">
                Create First CS Reminder <Plus className="w-4 h-4" />
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
