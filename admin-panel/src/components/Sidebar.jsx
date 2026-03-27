import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: 'lucide:layout-dashboard', key: 'dashboard' },
  { to: '/analytics', label: 'Analytics', icon: 'lucide:bar-chart-3', key: 'analytics' },
  { to: '/enquiries', label: 'Enquiries', icon: 'lucide:mail', key: 'enquiries', badge: 12 },
  { to: '/feedback', label: 'Feedback', icon: 'lucide:message-square', key: 'feedback' },
  { to: '/cms', label: 'CMS (Content)', icon: 'lucide:edit-3', key: 'cms' },
  { to: '/visual-editor', label: 'Visual Editor', icon: 'lucide:monitor-smartphone', key: 'visual-editor' },
];

const systemItems = [
  { to: '/integration', label: 'Integration', icon: 'lucide:code-2', key: 'integration' },
  { to: '/settings', label: 'Settings', icon: 'lucide:settings', key: 'settings' },
];

export default function Sidebar() {
  const planName = 'Enterprise';
  const planUsage = 85;

  return (
    <aside className="w-64 bg-[#F5EDE4] border-r border-[#E8DDD1] fixed h-full z-50 flex flex-col">
      <div className="p-8 pb-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#D4754C] rounded-md flex items-center justify-center">
            <Icon icon="lucide:layers" className="text-white text-xl" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#3D3A34]">
            SWCP <span className="text-[#8B8680] font-normal text-xs uppercase tracking-widest ml-1">Admin</span>
          </h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#FEFBF7] text-[#D4754C] border-r-[3px] border-[#D4754C]'
                  : 'text-[#8B8680] hover:text-[#3D3A34] hover:bg-[#FEFBF7]'
              }`
            }
          >
            <Icon icon={item.icon} className="text-lg group-hover:text-[#D4754C]" />
            {item.label}
            {item.badge && item.badge > 0 && (
              <span className="ml-auto bg-[#D4754C]/10 text-[#D4754C] text-[10px] px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}

        <div className="pt-8 pb-4">
          <p className="px-4 text-[10px] uppercase tracking-widest text-[#8B8680] opacity-50 font-bold">System</p>
        </div>

        {systemItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-[#FEFBF7] text-[#D4754C] border-r-[3px] border-[#D4754C]'
                  : 'text-[#8B8680] hover:text-[#3D3A34] hover:bg-[#FEFBF7]'
              }`
            }
          >
            <Icon icon={item.icon} className="text-lg group-hover:text-[#D4754C]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 mt-auto border-t border-[#E8DDD1]">
        <div className="bg-[#FEFBF7] border border-[#E8DDD1] rounded-xl p-4">
          <p className="text-xs text-[#8B8680] mb-2">Plan Status</p>
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-semibold">{planName}</span>
            <span className="text-[10px] text-[#8B8680]">{planUsage}% Used</span>
          </div>
          <div className="w-full h-1 bg-[#F5EDE4] rounded-full overflow-hidden">
            <div className="bg-[#D4754C] h-full" style={{ width: `${planUsage}%` }}></div>
          </div>
        </div>
      </div>
    </aside>
  );
}
