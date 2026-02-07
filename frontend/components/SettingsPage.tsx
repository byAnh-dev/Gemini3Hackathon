
import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  BookOpen, 
  Bell, 
  Smartphone, 
  Shield, 
  LogOut, 
  ChevronRight,
  Database,
  Globe,
  Plus,
  Zap,
  Clock,
  MessageSquare,
  Sparkles,
  Check
} from 'lucide-react';
import { UserPreferences } from '../types';

interface Props {
  prefs: UserPreferences;
  onUpdatePrefs: (newPrefs: UserPreferences) => void;
  onLogout: () => void;
  onAddCourse: () => void;
}

const SettingsPage: React.FC<Props> = ({ prefs, onUpdatePrefs, onLogout, onAddCourse }) => {
  const [activeSection, setActiveSection] = useState('account');

  const updateWorkStyle = (style: 'early' | 'last-minute') => {
    onUpdatePrefs({ ...prefs, workStyle: style });
  };

  const updatePersonality = (personality: 'concise' | 'verbose' | 'supportive') => {
    onUpdatePrefs({ ...prefs, agentPersonality: personality });
  };

  const sections = [
    { id: 'account', label: 'Account Profile', icon: User },
    { id: 'academic', label: 'Academic Sync', icon: BookOpen },
    { id: 'notifications', label: 'Alert Methods', icon: Bell },
    { id: 'agent', label: 'Agent Persona', icon: Zap },
    { id: 'advanced', label: 'Security & Cloud', icon: Shield },
  ];

  return (
    <div className="p-8 pb-32 animate-in fade-in duration-500">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuration</h1>
        <p className="text-slate-500 font-medium">Fine-tune how your agent behaves and communicates.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 space-y-1">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${
                activeSection === section.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <section.icon size={20} />
              {section.label}
            </button>
          ))}
          <div className="pt-8">
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm min-w-0">
          
          {activeSection === 'account' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400">
                  <User size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Alex Student</h3>
                  <p className="text-slate-500">alex.student@university.edu</p>
                  <button className="text-xs font-black text-blue-600 uppercase tracking-widest mt-2">Edit Avatar</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">University Identity</label>
                  <input type="text" disabled value="University of Technology" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-500 font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Enrollment Year</label>
                  <input type="text" placeholder="2024" className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'academic' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Study Workload Preference</h3>
                <p className="text-slate-500 mb-6">Determines how the agent schedules tasks from your Canvas sync.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => updateWorkStyle('early')}
                    className={`p-6 rounded-3xl border-2 text-left transition-all ${prefs.workStyle === 'early' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={20} className={prefs.workStyle === 'early' ? 'text-blue-600' : 'text-slate-400'} />
                      <h4 className="font-bold text-slate-900">Start Early</h4>
                    </div>
                    <p className="text-sm text-slate-500">More tasks scheduled 7+ days before deadline.</p>
                  </button>
                  <button 
                    onClick={() => updateWorkStyle('last-minute')}
                    className={`p-6 rounded-3xl border-2 text-left transition-all ${prefs.workStyle === 'last-minute' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={20} className={prefs.workStyle === 'last-minute' ? 'text-blue-600' : 'text-slate-400'} />
                      <h4 className="font-bold text-slate-900">Efficient Burst</h4>
                    </div>
                    <p className="text-sm text-slate-500">Focused work periods closer to the deadline.</p>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 mb-4">Course Management</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <Database size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">Canvas Integration</p>
                        <p className="text-xs text-slate-400">Synced 4 mins ago</p>
                      </div>
                    </div>
                    <button className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-lg">Reset Sync</button>
                  </div>
                  <button 
                    onClick={onAddCourse}
                    className="w-full p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all"
                  >
                    <Plus size={20} />
                    Add Another Course Source
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-6">Critical Risk Alerts</h3>
                <div className="space-y-6">
                  {['In-App', 'SMS', 'Discord'].map((method) => (
                    <div key={method} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                          {method === 'In-App' && <Bell size={24} />}
                          {method === 'SMS' && <Smartphone size={24} />}
                          {method === 'Discord' && <MessageSquare size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{method} Notifications</p>
                          <p className="text-sm text-slate-500">Alerts when Risk Score &gt; 8</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => onUpdatePrefs({...prefs, notificationChannel: method as any})}
                        className={`w-14 h-8 rounded-full transition-all relative ${prefs.notificationChannel === method ? 'bg-blue-600' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${prefs.notificationChannel === method ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {prefs.notificationChannel === 'SMS' && (
                <div className="p-8 bg-blue-50 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                  <h4 className="font-bold text-blue-900">SMS Configuration</h4>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-blue-600 uppercase tracking-widest">Mobile Number</label>
                    <input 
                      type="text" 
                      className="w-full p-4 bg-white border border-blue-100 rounded-2xl font-bold"
                      value={prefs.phoneNumber || ''}
                      onChange={(e) => onUpdatePrefs({...prefs, phoneNumber: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'agent' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-2">Agent Personality</h3>
                <p className="text-slate-500 mb-8">Choose how the friction-killer agent speaks to you.</p>
                
                <div className="space-y-4">
                  {[
                    { id: 'concise', label: 'Concise & Sharp', desc: 'Direct instructions, minimal fluff.', icon: Zap },
                    { id: 'supportive', label: 'Supportive Coach', desc: 'Encouraging tone, focus on motivation.', icon: Sparkles },
                    { id: 'verbose', label: 'Academic Mentor', desc: 'Detailed explanations and context.', icon: BookOpen },
                  ].map((p) => (
                    <button 
                      key={p.id}
                      onClick={() => updatePersonality(p.id as any)}
                      className={`w-full p-6 rounded-3xl border-2 flex items-center justify-between transition-all ${prefs.agentPersonality === p.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${prefs.agentPersonality === p.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <p.icon size={24} />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-900">{p.label}</h4>
                          <p className="text-sm text-slate-500">{p.desc}</p>
                        </div>
                      </div>
                      {prefs.agentPersonality === p.id && <Check size={20} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'advanced' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
               <div>
                  <h3 className="text-xl font-black text-slate-900 mb-4 text-rose-500">Security & Privacy</h3>
                  <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 space-y-4">
                    <p className="text-sm text-rose-700 font-medium">Clear all local storage and reset all agent associations. This action cannot be undone.</p>
                    <button className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-200">Delete Local Data</button>
                  </div>
               </div>

               <div>
                 <h3 className="text-xl font-black text-slate-900 mb-4">Cloud Synchronization</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-3xl">
                      <Globe className="mb-4 text-slate-400" />
                      <h4 className="font-bold mb-1">Timezone</h4>
                      <p className="text-sm text-slate-500 font-medium">PST (UTC -8)</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-3xl">
                      <Database className="mb-4 text-slate-400" />
                      <h4 className="font-bold mb-1">Backup</h4>
                      <p className="text-sm text-slate-500 font-medium">Last: 2 hrs ago</p>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
