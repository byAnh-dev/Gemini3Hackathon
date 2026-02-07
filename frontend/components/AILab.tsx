
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, Bot, Loader2, Zap, Layout, Calendar, AlertCircle } from 'lucide-react';
import { chatWithAgent } from '../services/geminiService';

const AILab: React.FC = () => {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: 'Welcome to the AI Planner. I am synced with your Canvas and Outlook. How can I help you arrange your workspace or schedule today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await chatWithAgent(userText, messages);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
    } catch (err: any) {
      console.error("Chat Error:", err);
      let errorMsg = "I'm having trouble connecting to your workspace data. Please try again.";
      if (err.message?.includes('429') || err.message?.includes('quota')) {
        errorMsg = "My processing quota has been exceeded for a moment. Please wait about 30 seconds and try again.";
      }
      setMessages(prev => [...prev, { role: 'bot', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 animate-in fade-in duration-500">
      <header className="p-8 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg">
              <Sparkles size={24} />
            </div>
            AI Planner
          </h1>
          <p className="text-slate-500 font-medium">Your agent-driven workspace coordinator.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-500 shadow-sm">
            <Zap size={14} className="text-amber-500" />
            Optimizing Workload
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col mx-8 mb-8 bg-white rounded-[40px] border border-slate-100 shadow-sm">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-5 rounded-[28px] text-sm leading-relaxed font-medium ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-200' 
                    : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center animate-pulse">
                  <Bot size={20} />
                </div>
                <div className="bg-slate-50 p-5 rounded-[28px] rounded-tl-none border border-slate-100 flex items-center gap-2">
                  <Loader2 className="animate-spin text-blue-600" size={18} />
                  <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Agent Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-50 bg-slate-50/50">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., 'Reschedule my study block to Monday' or 'How can I optimize my workspace?'"
              className="w-full pl-6 pr-16 py-5 bg-white border border-slate-200 rounded-3xl shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={() => setInput("Optimize my next week's schedule")} className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1.5 rounded-lg hover:bg-white hover:text-blue-600 transition-all flex items-center gap-1.5">
              <Calendar size={12} /> Weekly Optimization
            </button>
            <button onClick={() => setInput("What's my highest risk task?")} className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white border border-slate-100 px-3 py-1.5 rounded-lg hover:bg-white hover:text-blue-600 transition-all flex items-center gap-1.5">
              <Layout size={12} /> Priority Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AILab;
