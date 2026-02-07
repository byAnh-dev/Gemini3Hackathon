
import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Clock, 
  MessageSquare, 
  GraduationCap,
  ShieldCheck,
  Check,
  Phone,
  Hash,
  Mail
} from 'lucide-react';
import { UserPreferences } from '../types';

interface Props {
  onComplete: (prefs: UserPreferences) => void;
}

const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<UserPreferences>({
    onboarded: true,
    workStyle: 'early',
    notificationChannel: 'In-App',
    reminderFrequency: 'standard',
    agentPersonality: 'supportive'
  });

  const next = () => {
    // Basic validation for phone if SMS is chosen
    if (step === 3 && prefs.notificationChannel === 'SMS' && !prefs.phoneNumber) {
        alert("Please enter a phone number for SMS notifications.");
        return;
    }
    setStep(s => s + 1);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 flex items-center justify-center p-4 z-[200]">
      <div className="max-w-xl w-full">
        {step === 1 && (
          <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl mb-8 animate-float">
              <Sparkles size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Welcome to AcademiQ</h1>
            <p className="text-slate-500 text-lg mb-10 font-medium">
              Your autonomous AI study agent is ready to organize your academic life.
            </p>
            <button 
              onClick={next}
              className="px-10 py-4 bg-slate-900 text-white rounded-full font-bold shadow-xl flex items-center gap-3 mx-auto hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              Initialize Agent
              <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Clock size={24} /></div>
              <h2 className="text-2xl font-bold">What's your rhythm?</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 mb-10">
              <button 
                onClick={() => setPrefs({...prefs, workStyle: 'early'})}
                className={`p-6 rounded-3xl border-2 text-left transition-all ${prefs.workStyle === 'early' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">Start Early</h3>
                  {prefs.workStyle === 'early' && <div className="p-1 bg-blue-600 rounded-full text-white"><Check size={12}/></div>}
                </div>
                <p className="text-slate-500 text-sm">Spread tasks out. More free evenings, less stress.</p>
              </button>
              <button 
                onClick={() => setPrefs({...prefs, workStyle: 'last-minute'})}
                className={`p-6 rounded-3xl border-2 text-left transition-all ${prefs.workStyle === 'last-minute' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">Efficient Burst</h3>
                  {prefs.workStyle === 'last-minute' && <div className="p-1 bg-blue-600 rounded-full text-white"><Check size={12}/></div>}
                </div>
                <p className="text-slate-500 text-sm">Work better under pressure? We'll maximize focus time.</p>
              </button>
            </div>
            <button onClick={next} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2">
              Next Step
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><MessageSquare size={24} /></div>
              <h2 className="text-2xl font-bold">Notification Channel</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {['SMS', 'Discord', 'In-App'].map((c) => (
                <button 
                  key={c}
                  onClick={() => setPrefs({...prefs, notificationChannel: c as any})}
                  className={`py-6 rounded-2xl border-2 font-bold transition-all ${prefs.notificationChannel === c ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 hover:border-indigo-100 text-slate-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Dynamic Inputs for SMS/Discord */}
            <div className="mb-10 space-y-4">
                {prefs.notificationChannel === 'SMS' && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Mobile Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="tel" 
                                placeholder="+1 (555) 000-0000"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                value={prefs.phoneNumber || ''}
                                onChange={(e) => setPrefs({...prefs, phoneNumber: e.target.value})}
                            />
                        </div>
                    </div>
                )}
                {prefs.notificationChannel === 'Discord' && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Discord Authorization</label>
                        <button 
                            onClick={() => setPrefs({...prefs, discordHandle: '@user#1234'})}
                            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${prefs.discordHandle ? 'bg-indigo-600 text-white' : 'bg-[#5865F2] text-white hover:bg-[#4752C4]'}`}
                        >
                            <Hash size={20} />
                            {prefs.discordHandle ? `Authorized: ${prefs.discordHandle}` : 'Connect Discord Account'}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl flex gap-4 mb-10">
              <ShieldCheck className="text-indigo-600 shrink-0" />
              <p className="text-sm text-slate-600 leading-relaxed">
                By enabling SMS/Discord, our agent will ping you specifically when Risk Scores exceed 8.
              </p>
            </div>
            <button onClick={next} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">
              Finalize Preferences
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="bg-white rounded-[40px] p-10 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Mail size={24} /></div>
              <h2 className="text-2xl font-bold">Connect Outlook / Email</h2>
            </div>
            <p className="text-slate-500 mb-8 font-medium">
              Link your university email to track new announcements, deadline changes, and direct faculty feedback.
            </p>
            
            <button 
              onClick={next}
              className="w-full py-6 mb-4 bg-blue-600 text-white rounded-3xl font-black shadow-lg shadow-blue-200 flex items-center justify-center gap-3 hover:bg-blue-700 transition-all"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail size={18} />
              </div>
              Sync Microsoft Outlook
            </button>
            <button 
              onClick={next}
              className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
            >
              Skip for now
            </button>

            <div className="mt-8 p-6 bg-slate-50 rounded-3xl flex gap-4">
              <ShieldCheck className="text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                AcademiQ only scans for academic keywords (syllabus, grade, deadline) and never reads personal messages.
              </p>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white shadow-xl mb-8">
              <GraduationCap size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4">Agent Authorized</h2>
            <p className="text-slate-500 mb-10 font-medium">
              We've established links with Canvas, Outlook, and Google Calendar. Syllabus analysis starting now.
            </p>
            <div className="space-y-3 mb-10">
              <div className="flex items-center gap-3 justify-center text-emerald-600 font-bold">
                <Check size={20} /> CS301 Syllabus Parsed
              </div>
              <div className="flex items-center gap-3 justify-center text-emerald-600 font-bold">
                <Check size={20} /> Outlook Sync Complete
              </div>
              <div className="flex items-center gap-3 justify-center text-slate-400 font-bold">
                <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
                Generating Weekly Plan...
              </div>
            </div>
            <button 
              onClick={() => onComplete(prefs)}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200"
            >
              Enter Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
