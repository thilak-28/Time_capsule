import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.data);
      setUnreadCount(data.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every min
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      toast.error('Error marking as read');
    }
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (error) {
      toast.error('Error deleting notification');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-deep-forest/60 hover:text-deep-forest hover:bg-sage-gold/25 rounded-lg transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#800020] text-paper-cream text-[9px] font-bold flex items-center justify-center rounded-full border border-[#fdfdf9]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-[#fdfdf9] border border-sage-gold rounded-2xl shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-sage-gold flex justify-between items-center bg-sage-gold/15">
              <h3 className="font-serif font-bold text-deep-forest">Notifications</h3>
              <span className="text-xs text-deep-forest/50 font-bold">{unreadCount} unread</span>
            </div>
            <div className="max-h-96 overflow-y-auto scroll-thin">
              {notifications.length > 0 ? (
                <div className="divide-y divide-sage-gold/30">
                  {notifications.map((n) => (
                    <div key={n._id} className={`p-4 hover:bg-sage-gold/15 transition-colors ${!n.isRead ? 'bg-sage-gold/20' : ''}`}>
                      <p className="text-sm text-deep-forest mb-2">{n.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-deep-forest/40 font-bold">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {!n.isRead && (
                            <button onClick={() => markAsRead(n._id)} className="p-1 text-deep-forest/50 hover:text-[#0D530E] cursor-pointer" title="Mark as read">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => deleteNotif(n._id)} className="p-1 text-deep-forest/50 hover:text-[#800020] cursor-pointer" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-deep-forest/40">
                  <p className="text-sm">No notifications</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
