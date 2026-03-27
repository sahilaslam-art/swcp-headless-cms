import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';

export default function TopNavbar({ pageTitle }) {
  const { user, logout } = useAuth();
  const userName = user?.username || 'Admin User';
  const userRole = user?.role === 'admin' ? 'Account Admin' : 'User';
  const userAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}&backgroundColor=f5ede4`;
  const showNotificationBadge = true;

  return (
    <header className="h-20 border-b border-[#E8DDD1] bg-[#F5EDE4] px-8 flex items-center justify-between sticky top-0 z-40">
      <h2 className="text-2xl font-bold tracking-tight text-[#3D3A34]">{pageTitle}</h2>
      <div className="flex items-center gap-6">
        <a href="#search" className="relative group cursor-pointer">
          <Icon icon="lucide:search" className="text-[#8B8680] text-xl group-hover:text-[#3D3A34]" />
        </a>
        <a href="#notifications" className="relative group cursor-pointer">
          <Icon icon="lucide:bell" className="text-[#8B8680] text-xl group-hover:text-[#3D3A34]" />
          {showNotificationBadge && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D4754C] rounded-full"></span>
          )}
        </a>
        <div className="h-8 w-[1px] bg-[#E8DDD1]"></div>
        <button id="user-profile-btn" className="flex items-center gap-3 group">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-[#3D3A34]">{userName}</p>
            <p className="text-[10px] text-[#8B8680] uppercase tracking-tighter">{userRole}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#E8DDD1] p-0.5 group-hover:border-[#D4754C] transition-all">
            <img src={userAvatar} alt="User" className="w-full h-full rounded-full bg-[#FEFBF7]" />
          </div>
        </button>
        <button onClick={logout} className="ml-2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-red-50 text-[#8B8680] hover:text-red-500 transition-colors" title="Logout">
          <Icon icon="lucide:log-out" className="text-lg" />
        </button>
      </div>
    </header>
  );
}
