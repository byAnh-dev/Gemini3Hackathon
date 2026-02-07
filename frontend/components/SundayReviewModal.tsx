
import React, { useState } from 'react';
import { X, Sparkles, Check, ChevronRight, Calendar, Clock, Edit2 } from 'lucide-react';
import { TimeBlock } from '../types';

interface Props {
  onAccept: (blocks: TimeBlock[]) => void;
  onClose: () => void;
}

const SundayReviewModal: React.FC<Props> = ({ onAccept, onClose }) => {
  const [proposedBlocks, setProposedBlocks] = useState<TimeBlock[]>([
    { id: 'p1', day: 'Mon', startTime: 10, duration: 2, title: 'Algorithms Review', type: 'focus', color: 'bg-slate-800' },
    { id: 'p2', day: 'Tue', startTime: 14, duration: 1.5, title: 'History Reading', type: 'focus', color: 'bg-slate-800' },
    { id: 'p3', day: 'Thu', startTime: 9, duration: 3, title: 'ECON Project Work', type: 'focus', color: 'bg-slate-800' },
  ]);

  const updateTitle = (id: string, newTitle: string) => {
    setProposedBlocks(prev => prev.map(b => b.id === id ? { ...b, title: newTitle } : b));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-blue-600 p-8 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">Weekly Review</h2>
              <p className="text-blue-100 text-sm font-medium">Oct 21 - Oct 27 proposed blocks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-10">
          <div className="bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-100 flex gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
              <Check size={20} />
            </div>
            <p className="text-blue-900 text-sm leading-relaxed font-medium">
              Your agent has analyzed 4 upcoming deadlines. These 3 focus blocks have been optimized to avoid your predicted friction points.
            </p>
          </div>

          <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto pr-2">
            {proposedBlocks.map((block) => (
              <div key={block.id} className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between group transition-all hover:border-blue-200">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-600">
                    <span className="text-[10px] font-black uppercase tracking-tighter">{block.day}</span>
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <input 
                        className="font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                        value={block.title}
                        onChange={(e) => updateTitle(block.id, e.target.value)}
                      />
                      <Edit2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {block.startTime}:00 - {block.startTime + block.duration}:00 • {block.duration} Hours Focus
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-[10px] font-black text-rose-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Remove</button>
                  <ChevronRight size={20} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
            >
              Dismiss
            </button>
            <button 
              onClick={() => onAccept(proposedBlocks)}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Accept & Sync Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SundayReviewModal;
