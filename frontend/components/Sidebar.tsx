
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  BookOpen, 
  Bell, 
  Settings, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'updates', label: 'Updates', icon: Bell },
    { id: 'ai-lab', label: 'AI Planner', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 border-r border-slate-800 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/50">
          <Sparkles size={24} />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">AcademiQ</span>
      </div>

      <nav className="flex-1 px-4 mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all group ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'} />
              <span className="font-medium">{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={16} />}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-2 tracking-wider">Storage Sync</p>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 w-3/4 rounded-full"></div>
          </div>
          <p className="text-xs text-slate-400 mt-2">75% Cloud Capacity</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
