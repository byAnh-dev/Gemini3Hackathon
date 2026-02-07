
import React, { useMemo } from 'react';
import { 
  Zap, 
  Calendar, 
  Target, 
  ArrowRight,
  Sparkles,
  AlertCircle,
  Clock,
  ChevronRight,
  Terminal,
  Scroll,
  TrendingUp,
  BookOpen,
  ArrowUpRight
} from 'lucide-react';
import { Task, Course } from '../types';
import RiskBadge from './RiskBadge';
import { MOCK_COURSES } from '../constants';

interface Props {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onLaunchReview: () => void;
  isSundaySimulated?: boolean;
}

const Dashboard: React.FC<Props> = ({ tasks, onTaskClick, onLaunchReview, isSundaySimulated = true }) => {
  const now = new Date();
  const currentHour = now.getHours();
  const isAfterHours = currentHour >= 19; 
  const scheduleLabel = isAfterHours ? "Tomorrow's Schedule" : "Today's Schedule";
  const scheduleDate = isAfterHours 
    ? new Date(now.getTime() + 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  // Simulation: We treat it as Sunday if prop is true
  const isSunday = isSundaySimulated || now.getDay() === 0;

  const activeTasks = useMemo(() => tasks.filter(t => !t.completed), [tasks]);

  const topTasks = useMemo(() => [...activeTasks]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 2), [activeTasks]);

  const upcomingTasks = useMemo(() => [...activeTasks]
    .filter(t => !topTasks.find(tt => tt.id === t.id))
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()), [activeTasks, topTasks]);

  const dailySchedule = useMemo(() => {
    return [
      { time: '09:00 AM', title: 'Deep Work: Algorithms', type: 'Focus', color: 'bg-blue-500', taskId: 't1' },
      { time: '11:30 AM', title: 'History Lecture', type: 'Class', color: 'bg-indigo-500', taskId: 't4' },
      { time: '02:00 PM', title: 'Project Meeting', type: 'Meeting', color: 'bg-emerald-500' },
      { time: '04:30 PM', title: 'Lab Submission', type: 'Deadline', color: 'bg-rose-500', taskId: 't1' },
    ];
  }, [isAfterHours]);

  const handleScheduleItemClick = (item: any) => {
    if (item.taskId) {
      const task = tasks.find(t => t.id === item.taskId);
      if (task) onTaskClick(task);
    }
  };

  const getSubjectIcon = (courseId: string) => {
    const course = MOCK_COURSES.find(c => c.id === courseId || c.code === courseId);
    if (!course) return <BookOpen size={24} />;
    
    switch(course.icon) {
      case 'terminal': return <Terminal size={24} />;
      case 'scroll': return <Scroll size={24} />;
      case 'trending-up': return <TrendingUp size={24} />;
      default: return <BookOpen size={24} />;
    }
  };

  const getCourseBg = (courseId: string) => {
    const course = MOCK_COURSES.find(c => c.id === courseId || c.code === courseId);
    if (!course) return 'bg-slate-100 text-slate-600';
    
    switch(course.icon) {
      case 'terminal': return 'bg-blue-100 text-blue-600';
      case 'scroll': return 'bg-indigo-100 text-indigo-600';
      case 'trending-up': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="p-8 pb-20 animate-in fade-in duration-500">
      {/* Sunday Review Banner */}
      {isSunday && (
        <div className="mb-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[40px] p-8 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-10 duration-700">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 rounded-[28px] flex items-center justify-center backdrop-blur-md shrink-0">
              <Sparkles size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Review Next Week's Schedule</h2>
              <p className="text-blue-100 font-medium">It's Sunday. Your agent has prepared a pending optimization for the week ahead.</p>
            </div>
          </div>
          <button 
            onClick={onLaunchReview}
            className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-black shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            Launch Review
            <ArrowUpRight size={20} />
          </button>
        </div>
      )}

      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Good morning, Alex.</h1>
          <p className="text-slate-500 font-medium">Your agent has {activeTasks.length > 0 ? 2 : 0} high-priority updates from Canvas & Outlook.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-full font-bold text-slate-700 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
            <Calendar size={18} />
            Weekly Outlook
          </button>
          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Sparkles size={18} />
            Sync All
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Main Content: Scrollable */}
        <div className="flex-1 space-y-12 min-w-0">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Zap size={20} className="text-amber-500 fill-amber-500" />
              <h2 className="text-xl font-bold text-slate-800">Top Focus Items Today</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topTasks.map(task => (
                <div key={task.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <RiskBadge score={task.riskScore} />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} Days Left
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{task.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                      {task.description || "Synthesizing requirements from syllabus..."}
                    </p>
                  </div>
                  <button 
                    onClick={() => onTaskClick(task)}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-blue-600 transition-colors"
                  >
                    View Mission
                    <ArrowRight size={18} />
                  </button>
                </div>
              ))}
              {topTasks.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-[40px]">
                  <p className="text-slate-400 font-bold italic">All major focus items are archived. Good job, Alex!</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-800">Pipeline Tracking</h2>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{upcomingTasks.length} Items Total</span>
            </div>
            <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
              {upcomingTasks.map((task, idx) => (
                <div 
                  key={task.id} 
                  onClick={() => onTaskClick(task)}
                  className={`p-6 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer group ${idx !== upcomingTasks.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getCourseBg(task.courseId)}`}>
                      {getSubjectIcon(task.courseId)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{task.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {task.courseId} • Due {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="hidden md:block text-right">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">{task.points} PTS</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Weight</p>
                    </div>
                    <RiskBadge score={task.riskScore} />
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
              {upcomingTasks.length === 0 && activeTasks.length === 0 && (
                <div className="p-12 text-center opacity-40 italic">No upcoming tasks. Enjoy the peace!</div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Insights: Sticky */}
        <div className="w-full lg:w-[350px] space-y-8 sticky top-8">
          <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{scheduleLabel}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{scheduleDate}</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                <Clock size={20} />
              </div>
            </div>

            <div className="space-y-5">
              {dailySchedule.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleScheduleItemClick(item)}
                  className={`flex gap-4 group cursor-pointer p-2 -m-2 rounded-2xl transition-all ${item.taskId ? 'hover:bg-slate-50' : ''}`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mt-1.5`}></div>
                    {idx !== dailySchedule.length - 1 && <div className="w-0.5 h-full bg-slate-100 mt-1"></div>}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{item.time}</p>
                      {item.taskId && <ChevronRight size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                    <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md mt-1 inline-block font-bold">
                      {item.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 text-blue-600" />
                <p className="text-xs leading-relaxed text-blue-800 font-medium">
                  {isAfterHours 
                    ? "Agent Note: Tomorrow has a high-density morning. Suggesting a 9 AM start to avoid Dijkstra lab pile-up."
                    : "Agent Note: You have an open gap at 3 PM. Suggesting pre-reading for the History Seminar."}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              Agent Log
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></div>
                <p className="text-sm text-slate-600 font-medium leading-snug">
                  Canvas Announcement: <span className="text-slate-900 font-bold">Quiz 3 postponed</span> to Friday. Updated.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-slate-200 mt-2 shrink-0"></div>
                <p className="text-sm text-slate-600 font-medium leading-snug">
                  Email from Dr. Turing: Syllabus parsing updated for Project 4.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
