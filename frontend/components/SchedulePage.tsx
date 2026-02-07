
import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus,
  X,
  Zap,
  BookOpen,
  Sparkles,
  Trash2,
  MoreVertical,
  Type as FontIcon
} from 'lucide-react';
import { Task, TimeBlock } from '../types';

interface Props {
  tasks: Task[];
  blocks: TimeBlock[];
  onAddBlock: (block: Omit<TimeBlock, 'id'>) => void;
  onUpdateBlock: (block: TimeBlock) => void;
  onDeleteBlock: (id: string) => void;
}

const SchedulePage: React.FC<Props> = ({ tasks, blocks, onAddBlock, onUpdateBlock, onDeleteBlock }) => {
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  
  // Form states for adding
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState('Mon');
  const [newTime, setNewTime] = useState('09:00');
  const [newDuration, setNewDuration] = useState('1.0');
  const [newType, setNewType] = useState<'class' | 'focus' | 'personal'>('focus');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [h, m] = newTime.split(':').map(Number);
    const startTimeDecimal = h + (m / 60);
    
    onAddBlock({
      title: newTitle || 'Untitled Block',
      day: newDay,
      startTime: startTimeDecimal,
      duration: parseFloat(newDuration),
      type: newType,
      color: newType === 'class' ? 'bg-blue-600' : newType === 'focus' ? 'bg-slate-800' : 'bg-emerald-600'
    });
    
    setShowAddBlock(false);
    setNewTitle('');
  };

  const getDeadlinesForDay = (day: string) => {
    // In a real app, match date. Here we mock specific days for demo based on MOCK_TASKS
    const dayMap: any = { 'Tue': 't1', 'Wed': 't4', 'Fri': 't6' };
    const taskId = dayMap[day];
    return tasks.find(t => t.id === taskId);
  };

  return (
    <div className="p-8 pb-32 animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl font-black text-slate-900">Academic Schedule</h1>
          <div className="flex items-center bg-white rounded-full p-1 border border-slate-200 shadow-sm">
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronLeft size={20}/></button>
            <span className="px-4 font-bold text-slate-700">Oct 14 - 20, 2024</span>
            <button className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setShowAddBlock(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all hover:scale-105"
            >
                <Plus size={20} />
                Add Focus Block
            </button>
        </div>
      </header>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden relative">
        <div className="grid grid-cols-8 border-b border-slate-100 sticky top-0 bg-white z-40">
          <div className="p-4 bg-slate-50/50 border-r border-slate-100"></div>
          {days.map(day => (
            <div key={day} className="p-4 text-center border-r border-slate-100 last:border-r-0">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{day}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-50 min-h-[100px] relative">
              <div className="p-4 text-right border-r border-slate-100 bg-slate-50/30">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                </span>
              </div>
              {days.map(day => (
                <div key={day} className="border-r border-slate-100 last:border-r-0 relative group min-h-[100px]">
                  {/* Grid background placeholder */}
                </div>
              ))}
            </div>
          ))}

          {/* Absolute Positioned Blocks Layer */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {blocks.map(block => {
              const dayIndex = days.indexOf(block.day);
              if (dayIndex === -1) return null;
              
              // 100px is the min-height of one hour row
              const topOffset = (block.startTime - 7) * 100;
              const height = block.duration * 100;
              const leftOffset = (100 / 8) * (dayIndex + 1);

              return (
                <div 
                  key={block.id}
                  onClick={() => setSelectedBlock(block)}
                  className={`absolute pointer-events-auto p-2 cursor-pointer transition-all hover:brightness-110 active:scale-[0.98] ${block.color || 'bg-blue-600'} text-white rounded-xl shadow-md border-2 border-white z-20 group`}
                  style={{
                    top: `${topOffset}px`,
                    height: `${height}px`,
                    left: `${leftOffset}%`,
                    width: `${100 / 8}%`
                  }}
                >
                  <div className="h-full flex flex-col justify-start overflow-hidden">
                    <p className="text-[10px] font-black opacity-80 uppercase leading-none mb-1">
                      {Math.floor(block.startTime)}:{((block.startTime % 1) * 60).toString().padStart(2, '0')}
                    </p>
                    <p className="text-xs font-bold leading-tight line-clamp-2">{block.title}</p>
                    {block.duration > 1 && (
                      <p className="text-[10px] mt-1 opacity-60 italic">{block.type}</p>
                    )}
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={14} />
                  </div>
                </div>
              );
            })}

            {/* Render Deadlines as Thin Overlays */}
            {days.map((day, dIdx) => {
              const deadline = getDeadlinesForDay(day);
              if (!deadline) return null;
              const leftOffset = (100 / 8) * (dIdx + 1);
              // Mock deadlines at 12 PM (row 12 - 7 = 5)
              const topOffset = (12 - 7) * 100;

              return (
                <div 
                  key={`deadline-${day}`}
                  className="absolute p-1 bg-rose-50 border-rose-200 border-2 text-rose-700 rounded-xl shadow-sm z-30 pointer-events-auto cursor-help"
                  style={{
                    top: `${topOffset}px`,
                    height: `60px`,
                    left: `${leftOffset}%`,
                    width: `${100 / 8}%`,
                    marginTop: '20px' // Offset within the hour
                  }}
                >
                  <div className="flex items-center gap-1 text-[8px] font-black uppercase text-rose-500 mb-0.5">
                    <Zap size={10} /> Deadline
                  </div>
                  <p className="text-[10px] font-black leading-tight line-clamp-2 uppercase">{deadline.title}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Block Popup */}
      {showAddBlock && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <form onSubmit={handleAddSubmit} className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in duration-300 relative">
            <button type="button" onClick={() => setShowAddBlock(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
            <h2 className="text-2xl font-black text-slate-900 mb-2">New Schedule Block</h2>
            <p className="text-slate-500 mb-8">Establish a focused mission or recurring event.</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Event Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. History Seminar"
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Day</label>
                  <select 
                    value={newDay}
                    onChange={e => setNewDay(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Type</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="focus">Deep Focus</option>
                    <option value="class">Class/Lecture</option>
                    <option value="personal">Personal Time</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Time</label>
                  <input 
                    type="time" 
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" 
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Duration (Hours)</label>
                  <input 
                    type="number" 
                    step="0.5" 
                    value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-6 bg-blue-50 rounded-3xl flex gap-4">
                <Sparkles size={20} className="text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">
                  AcademiQ suggests a 1.5hr slot to maximize cognitive absorption without fatigue.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200"
              >
                Create Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Block Details Popup (Google Calendar style) */}
      {selectedBlock && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl p-8 animate-in zoom-in duration-300 relative">
            <div className={`w-full h-2 absolute top-0 left-0 rounded-t-full ${selectedBlock.color || 'bg-blue-600'}`}></div>
            
            <div className="flex justify-between items-start mb-6 pt-2">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${selectedBlock.color || 'bg-blue-600'}`}>
                   {selectedBlock.type === 'class' ? <BookOpen size={20} /> : <Zap size={20} />}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedBlock.title}</h2>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => { onDeleteBlock(selectedBlock.id); setSelectedBlock(null); }}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => setSelectedBlock(null)}
                  className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 text-slate-600">
                <CalendarIcon size={20} className="shrink-0 mt-1" />
                <div>
                  <p className="font-bold">{selectedBlock.day}, October 1{days.indexOf(selectedBlock.day) + 4}</p>
                  <p className="text-sm">
                    {Math.floor(selectedBlock.startTime)}:{((selectedBlock.startTime % 1) * 60).toString().padStart(2, '0')} 
                    {' - '}
                    {Math.floor(selectedBlock.startTime + selectedBlock.duration)}:{(((selectedBlock.startTime + selectedBlock.duration) % 1) * 60).toString().padStart(2, '0')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-slate-600">
                <FontIcon size={20} className="shrink-0 mt-1" />
                <div>
                  <p className="font-bold uppercase text-[10px] tracking-widest text-slate-400 mb-1">Type</p>
                  <p className="font-medium text-slate-900 capitalize">{selectedBlock.type}</p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Agent Intelligence</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "You typically perform best in this time slot. I've locked this block to prevent secondary notifications from Discord."
                </p>
              </div>

              <div className="flex gap-3">
                <button 
                  className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  onClick={() => setSelectedBlock(null)}
                >
                  Close
                </button>
                <button 
                  className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                  onClick={() => {
                    // Quick way to demonstrate edit
                    onUpdateBlock({...selectedBlock, title: selectedBlock.title + ' (Updated)'});
                    setSelectedBlock(null);
                  }}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Clock size={24} />
            </div>
            <div>
                <h4 className="font-bold text-slate-900">Weekly Utilization</h4>
                <p className="text-sm text-slate-500">Your agent has optimized 24 study hours this week.</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <CalendarIcon size={24} />
            </div>
            <div>
                <h4 className="font-bold text-slate-900">Sync Status</h4>
                <p className="text-sm text-slate-500">Google Calendar & Canvas synced 4 mins ago.</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
