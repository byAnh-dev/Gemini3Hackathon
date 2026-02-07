
import React, { useState } from 'react';
import { 
  Terminal, 
  Scroll, 
  TrendingUp, 
  BookOpen, 
  ChevronRight,
  CheckCircle,
  Clock,
  LayoutGrid,
  Search,
  Plus,
  Upload,
  Edit2,
  X,
  FileText
} from 'lucide-react';
import { Course } from '../types';

interface Props {
  courses: Course[];
  onSelect: (course: Course) => void;
  onAddCourse: (course: Partial<Course>) => void;
  onUpdateCourse: (course: Course) => void;
}

const CoursesPage: React.FC<Props> = ({ courses, onSelect, onAddCourse, onUpdateCourse }) => {
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [addMethod, setAddMethod] = useState<'upload' | 'manual'>('upload');
  
  const getIcon = (iconName?: string) => {
    switch(iconName) {
      case 'terminal': return <Terminal className="text-blue-600" size={28} />;
      case 'scroll': return <Scroll className="text-indigo-600" size={28} />;
      case 'trending-up': return <TrendingUp className="text-emerald-600" size={28} />;
      default: return <BookOpen className="text-slate-600" size={28} />;
    }
  };

  const getBg = (iconName?: string) => {
    switch(iconName) {
      case 'terminal': return 'bg-blue-50';
      case 'scroll': return 'bg-indigo-50';
      case 'trending-up': return 'bg-emerald-50';
      default: return 'bg-slate-50';
    }
  };

  const CourseForm = ({ initialData, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState(initialData || { name: '', code: '', instructor: '' });
    return (
      <div className="space-y-4">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Course Name</label>
          <input 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
            placeholder="e.g. Intro to Psychology"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Course Code</label>
            <input 
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              placeholder="e.g. PSY101"
            />
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 block">Instructor</label>
            <input 
              value={formData.instructor}
              onChange={e => setFormData({...formData, instructor: e.target.value})}
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              placeholder="e.g. Dr. Freud"
            />
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200">Save Subject</button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 pb-32 animate-in fade-in duration-500">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Portfolio</h1>
          <p className="text-slate-500 font-medium">Your agent is currently managing {courses.length} active subjects.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter courses..." 
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 shadow-sm hover:bg-slate-50 transition-all">
            <LayoutGrid size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <div 
            key={course.id}
            className="group relative bg-white border border-slate-100 rounded-[40px] p-8 transition-all hover:shadow-2xl hover:shadow-blue-900/10 overflow-hidden"
          >
            <div className={`absolute -right-4 -top-4 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 transition-opacity ${getBg(course.icon)}`}></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                <div onClick={() => onSelect(course)} className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 cursor-pointer ${getBg(course.icon)}`}>
                  {getIcon(course.icon)}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingCourse(course); }}
                    className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  {course.canvasConnected ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                      <CheckCircle size={12} /> Sync Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
                      <Clock size={12} /> Disconnected
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-8 cursor-pointer" onClick={() => onSelect(course)}>
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1 block">
                  {course.code}
                </span>
                <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                  {course.name}
                </h3>
                <p className="text-slate-500 font-medium">{course.instructor}</p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">AI</div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">SY</div>
                </div>
                <button onClick={() => onSelect(course)} className="flex items-center gap-1 text-sm font-black text-slate-400 group-hover:text-blue-600 transition-all">
                  Deep Dive
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={() => setShowAddPopup(true)}
          className="group border-4 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all min-h-[300px]"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
            <Plus size={32} />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-slate-800">Add New Subject</h4>
            <p className="text-slate-500 text-sm font-medium">Sync another Canvas instance or upload syllabus PDF</p>
          </div>
        </button>
      </div>

      {/* Add Course Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in duration-300 relative">
            <button onClick={() => setShowAddPopup(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-2">New Course Sync</h2>
            <p className="text-slate-500 mb-8">Establish a link to your academic records.</p>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-8">
              <button 
                onClick={() => setAddMethod('upload')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${addMethod === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Upload Syllabus
              </button>
              <button 
                onClick={() => setAddMethod('manual')}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${addMethod === 'manual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Manual Entry
              </button>
            </div>

            {addMethod === 'upload' ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center group hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <h4 className="font-bold text-slate-900">Drop PDF here</h4>
                  <p className="text-xs text-slate-400 mt-2">AcademiQ will parse deadlines automatically</p>
                </div>
                <button onClick={() => setShowAddPopup(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Cancel</button>
              </div>
            ) : (
              <CourseForm 
                onSave={(data: any) => { onAddCourse(data); setShowAddPopup(false); }}
                onCancel={() => setShowAddPopup(false)}
              />
            )}
          </div>
        </div>
      )}

      {/* Edit Course Popup */}
      {editingCourse && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in duration-300 relative">
            <button onClick={() => setEditingCourse(null)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Modify Course</h2>
            <p className="text-slate-500 mb-8">Correct information for {editingCourse.code}.</p>
            <CourseForm 
              initialData={editingCourse}
              onSave={(data: any) => { onUpdateCourse({...editingCourse, ...data}); setEditingCourse(null); }}
              onCancel={() => setEditingCourse(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
