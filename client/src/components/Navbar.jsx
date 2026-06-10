import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, PlusCircle, Inbox, LayoutDashboard, Clock } from 'lucide-react';
import useAuthStore from '../store/authStore';
import NotificationBell from './NotificationBell';


const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Capsule', path: '/capsule/new', icon: PlusCircle },
    { name: 'Inbox', path: '/inbox', icon: Inbox },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#fdfdf9] border-b border-sage-gold shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="p-2 bg-sage-gold/25 border border-sage-gold/50 rounded-xl group-hover:rotate-6 transition-transform duration-300">
              <Clock className="w-5 h-5 text-ink-green" />
            </div>
            <span className="text-2xl font-serif font-bold text-deep-forest tracking-tight">
              TimeCapsule
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-bold font-serif transition-all duration-300 ${
                  location.pathname === item.path
                    ? 'text-deep-forest'
                    : 'text-deep-forest/60 hover:text-deep-forest'
                }`}
              >
                <item.icon className={`w-4 h-4 ${location.pathname === item.path ? 'text-ink-green' : 'text-deep-forest/40'}`} />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            
            <div className="flex items-center gap-2 px-3 py-1 bg-sage-gold/20 border border-sage-gold/40 rounded-full">
              <img
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=0D530E&color=FBF5DD`}
                alt="Profile"
                className="w-6 h-6 rounded-full border border-sage-gold"
              />
              <span className="hidden sm:inline text-xs font-bold text-deep-forest">
                {user?.name}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-deep-forest/50 hover:text-[#800020] hover:bg-[#800020]/5 rounded-xl transition-all cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fdfdf9] border-t border-sage-gold shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center w-full h-16 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-bold font-serif tracking-tight transition-all duration-300 ${
                  isActive ? 'text-deep-forest' : 'text-deep-forest/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-ink-green' : 'text-deep-forest/40'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
