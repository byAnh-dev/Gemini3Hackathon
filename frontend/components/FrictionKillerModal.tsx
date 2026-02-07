
import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Clock, BookOpen, X, Loader2 } from 'lucide-react';
import { Task, AIStarterResponse } from '../types';
import { getAIStarterKit } from '../services/geminiService';

interface Props {
  task: Task;
  onClose: () => void;
}

const FrictionKillerModal: React.FC<Props> = ({ task, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AIStarterResponse | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getAIStarterKit(task);
        setData(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [task]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Friction Killer Agent</h2>
              <p className="text-blue-100 text-sm">Automated start guide for: {task.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-500 font-medium animate-pulse">Analyzing syllabus & rubrics...</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={20} className="text-blue-600" />
                  <h3 className="font-bold text-slate-800">Mission Summary</h3>
                </div>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {data.summary}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <h3 className="font-bold text-slate-800">5-Step Starter Checklist</h3>
                </div>
                <div className="space-y-3">
                  {data.steps.map((step, i) => (
                    <div key={i} className="flex gap-4 items-start group">
                      <div className="mt-1 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm group-hover:border-green-300 transition-colors">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <Clock className="text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Estimated Effort</p>
                    <p className="font-bold text-slate-800">{data.estimatedTime}</p>
                  </div>
                </div>
                <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-center text-white font-medium cursor-pointer hover:bg-slate-800 transition-colors">
                  Open Linked Materials
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">Failed to generate guide. Please try again.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FrictionKillerModal;
