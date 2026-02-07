
import React from 'react';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  BookOpen,
  Mail,
  Zap,
  ChevronRight,
  TrendingUp,
  Terminal,
  Scroll
} from 'lucide-react';
import { Course, Task } from '../types';
import RiskBadge from './RiskBadge';

interface Props {
  course: Course;
  tasks: Task[];
  onBack: () => void;
  onTaskClick: (task: Task) => void;
}

const CourseDetailPage: React.FC<Props> = ({ course, tasks, onBack, onTaskClick }) => {
  const courseTasks = tasks.filter(t => t.courseId === course.id || t.courseId === course.code);
  
  const getIcon = () => {
    switch(course.icon) {
      case 'terminal': return <Terminal size={32} />;
      case 'scroll': return <Scroll size={32} />;
      case 'trending-up': return <TrendingUp size={32} />;
      default: return <BookOpen size={32} />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <header className="flex items-start gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                  {course.code}
                </span>
                {course.canvasConnected ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-full">
                    <CheckCircle size={10} /> Canvas Linked
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-full">
                    <AlertCircle size={10} /> Link Canvas
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-black text-slate-900">{course.name}</h1>
              <p className="text-lg text-slate-500 mt-2 flex items-center gap-2">
                <User size={18} /> {course.instructor}
              </p>
            </div>
          </header>

          <section className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" /> Syllabus Intelligence
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg mb-8">
              {course.syllabusSummary || "Agent is still analyzing the syllabus document for thematic patterns and grade weighting..."}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                <Zap className="text-amber-500" />
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Weighting Focus</p>
                  <p className="font-bold text-slate-800">40% Exams / 60% Projects</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                <Calendar className="text-indigo-500" />
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Next Major Event</p>
                  <p className="font-bold text-slate-800">Midterm (Oct 28)</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Course Missions</h3>
            <div className="space-y-4">
              {courseTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => onTaskClick(task)}
                  className="bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{task.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        Due {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <RiskBadge score={task.riskScore} />
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              ))}
              {courseTasks.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium italic">No active missions for this course.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Instructor Contact</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-blue-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold truncate">{course.instructor.toLowerCase().replace(' ', '.')}@university.edu</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Office Hours: Mon 2-4PM</p>
                </div>
              </div>
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-sm font-bold border border-white/10 transition-all">
                Generate Inquiry Draft
              </button>
            </div>
          </div>

          <div className="bg-blue-600 rounded-[40px] p-8 text-white shadow-xl shadow-blue-900/20">
            <h4 className="text-xl font-black mb-2">Subject Performance</h4>
            <p className="text-blue-100 text-sm mb-6">Agent predicts a <span className="font-bold">B+ baseline</span> based on current syllabus requirements.</p>
            <div className="h-2 w-full bg-blue-800 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-white w-3/4"></div>
            </div>
            <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black shadow-lg">
              View Grade Outlook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
