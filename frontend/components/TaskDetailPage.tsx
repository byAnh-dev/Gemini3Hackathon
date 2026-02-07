
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  BookOpen, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Square,
  CheckSquare,
  Archive,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Task, AIStarterResponse } from '../types';
import { getAIStarterKit } from '../services/geminiService';
import RiskBadge from './RiskBadge';

interface Props {
  task: Task;
  onBack: () => void;
  onToggleComplete: (taskId: string) => void;
}

const TaskDetailPage: React.FC<Props> = ({ task, onBack, onToggleComplete }) => {
  const [aiData, setAiData] = useState<AIStarterResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<boolean[]>([]);

  const fetchAI = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAIStarterKit(task);
      setAiData(result);
      setCompletedSteps(new Array(result.steps.length).fill(false));
    } catch (err: any) {
      console.error("Failed to fetch AI details", err);
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        setError("AI Quota Exceeded. Please wait a moment before retrying.");
      } else {
        setError("Unable to generate analysis right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAI();
    window.scrollTo(0, 0);
  }, [task]);

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const handleArchive = () => {
    onToggleComplete(task.id);
    onBack();
  };

  const daysLeft = Math.ceil((new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const progressPercent = aiData ? Math.round((completedSteps.filter(Boolean).length / aiData.steps.length) * 100) : 0;

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>

        <button 
          onClick={handleArchive}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all shadow-sm ${
            task.completed 
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:shadow-emerald-200'
          }`}
        >
          <CheckCircle2 size={18} />
          {task.completed ? 'Mission Archived' : 'Mark as Finished'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <header>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                {task.courseId}
              </span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black tracking-widest uppercase">
                {task.type}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4">{task.title}</h1>
            <p className="text-xl text-slate-500 leading-relaxed">
              {task.description || "No specific instructions provided in the Canvas export."}
            </p>
          </header>

          {/* AI Intelligence Block */}
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Agent Analysis</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini 3</p>
                </div>
              </div>
              {loading && <Loader2 className="animate-spin text-blue-600" size={24} />}
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-4">
                <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-1/3 animate-pulse"></div>
                </div>
                <p className="text-slate-400 font-medium">Synthesizing syllabus requirements...</p>
              </div>
            ) : error ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-6">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Analysis Unavailable</h4>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">{error}</p>
                </div>
                <button 
                  onClick={fetchAI}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
                >
                  <RefreshCw size={18} />
                  Retry Analysis
                </button>
              </div>
            ) : aiData ? (
              <div className="space-y-10">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Strategic Summary</h4>
                  <p className="text-slate-700 leading-relaxed text-lg">
                    {aiData.summary}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Execution Steps</h4>
                    <span className="text-xs font-black text-blue-600">{progressPercent}% Completed</span>
                  </div>
                  <div className="space-y-4">
                    {aiData.steps.map((step, i) => (
                      <div 
                        key={i} 
                        onClick={() => toggleStep(i)}
                        className={`flex gap-4 items-start group cursor-pointer p-4 rounded-2xl border transition-all ${
                          completedSteps[i] 
                            ? 'bg-slate-50 border-emerald-100 opacity-60' 
                            : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {completedSteps[i] ? (
                            <CheckSquare className="text-emerald-500" size={22} />
                          ) : (
                            <Square className="text-slate-300 group-hover:text-blue-400" size={22} />
                          )}
                        </div>
                        <div className={`flex-1 text-slate-700 font-medium leading-relaxed ${completedSteps[i] ? 'line-through text-slate-400' : ''}`}>
                          {step}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 italic">
                Agent was unable to analyze this specific task.
              </div>
            )}
          </section>

          {/* Resources */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 mb-6">Connected Materials</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(task.materials || ['Syllabus.pdf', 'Weekly Reading.docx']).map((mat, idx) => (
                <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:text-blue-600 transition-colors">
                      <BookOpen size={20} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{mat}</span>
                  </div>
                  <ExternalLink size={16} className="text-slate-300" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Execution Metrics</h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">{aiData?.estimatedTime || '---'}</p>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Est. Time to Complete</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">{new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-slate-400 font-medium">Final Deadline</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-amber-400">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">{daysLeft} Days Window</p>
                  <p className="text-xs text-slate-400 font-medium">Remaining Buffers</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Target size={24} />
                </div>
                <div>
                  <p className="text-sm font-bold">{task.points} Points</p>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Academic Value</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <RiskBadge score={task.riskScore} />
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Agent Note: {task.riskScore >= 8 ? "Highly urgent. Prioritize this today." : "Manageable risk. Stick to the focus blocks."}
              </p>
            </div>

            <button 
              onClick={handleArchive}
              className="w-full mt-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
            >
              Archive Mission
              <Archive size={18} />
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100">
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              Procrastination Risk
            </h4>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Agent predicts <strong>{task.riskScore * 10}% chance</strong> of friction. Using the checklist above reduces this score by 20 points.
            </p>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: `${task.riskScore * 10}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
