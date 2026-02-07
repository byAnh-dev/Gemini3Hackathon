
import React from 'react';
import { 
  Bell, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Mail,
  BookOpen,
  Settings
} from 'lucide-react';

const UpdatesPage: React.FC = () => {
  const updates = [
    {
      id: 1,
      source: 'Canvas',
      title: 'Assignment Deadline Changed',
      desc: 'CS301: Project 4 has been extended by 48 hours.',
      time: '2 hours ago',
      type: 'info',
      icon: <BookOpen className="text-blue-500" />
    },
    {
      id: 2,
      source: 'System',
      title: 'Syllabus Parsing Complete',
      desc: 'ECON201 syllabus has been successfully indexed and tasks created.',
      time: '5 hours ago',
      type: 'success',
      icon: <CheckCircle2 className="text-emerald-500" />
    },
    {
      id: 3,
      source: 'Outlook',
      title: 'Email from Prof. Miller',
      desc: 'Subject: Correction on Midterm Rubric. AI has updated your checklist.',
      time: 'Yesterday',
      type: 'warning',
      icon: <Mail className="text-amber-500" />
    },
    {
      id: 4,
      source: 'System',
      title: 'High Workload Warning',
      desc: 'Next Tuesday has 3 overlapping deadlines. Suggesting rescheduling.',
      time: 'Yesterday',
      type: 'critical',
      icon: <AlertTriangle className="text-rose-500" />
    }
  ];

  return (
    <div className="p-8 pb-32 animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Intelligence Log</h1>
          <p className="text-slate-500 font-medium">Tracking all external syncs and agent decisions.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search logs..." 
                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-rose-500 transition-colors">
            <Trash2 size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {updates.map(update => (
            <div key={update.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex gap-6 group">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-slate-100 transition-colors">
                {update.icon}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-900 text-lg">{update.title}</h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{update.time}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{update.desc}</p>
                <div className="mt-4 flex gap-2">
                   <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                     {update.source}
                   </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[32px] p-8 text-white">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Source Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-blue-400" />
                    <span className="text-sm font-bold">Canvas API</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Mail size={18} className="text-indigo-400" />
                    <span className="text-sm font-bold">Outlook Sync</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                    <Settings size={18} className="text-slate-400" />
                    <span className="text-sm font-bold">Discord Webhook</span>
                </div>
                <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full font-bold">OFFLINE</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-900/20">
             <Bell className="mb-4 text-blue-200" size={32} />
             <h3 className="text-xl font-bold mb-2">Push Notifications</h3>
             <p className="text-sm text-blue-100 mb-6">Enable mobile notifications to get real-time risk alerts from the agent.</p>
             <button className="w-full py-3 bg-white text-blue-600 rounded-2xl font-black text-sm">Enable Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
