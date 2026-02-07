
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import TaskDetailPage from './components/TaskDetailPage';
import CourseDetailPage from './components/CourseDetailPage';
import CoursesPage from './components/CoursesPage';
import SchedulePage from './components/SchedulePage';
import UpdatesPage from './components/UpdatesPage';
import SettingsPage from './components/SettingsPage';
import AILab from './components/AILab';
import SundayReviewModal from './components/SundayReviewModal';
import Auth from './components/Auth';
import { UserPreferences, Task, Course, TimeBlock } from './types';
import { MOCK_TASKS, MOCK_COURSES, MOCK_SCHEDULE_BLOCKS } from './constants';
import { Sparkles, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [scheduleBlocks, setScheduleBlocks] = useState<TimeBlock[]>(MOCK_SCHEDULE_BLOCKS);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSundayReview, setShowSundayReview] = useState(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('academiq_token') === 'true';
  });

  const [prefs, setPrefs] = useState<UserPreferences | null>(() => {
    const saved = localStorage.getItem('academiq_prefs');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = () => {
    localStorage.setItem('academiq_token', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('academiq_token');
    setIsLoggedIn(false);
    setSelectedTask(null);
    setSelectedCourse(null);
    setActiveTab('dashboard');
  };

  const handleOnboardingComplete = (newPrefs: UserPreferences) => {
    localStorage.setItem('academiq_prefs', JSON.stringify(newPrefs));
    setPrefs(newPrefs);
  };

  const handleUpdatePrefs = (newPrefs: UserPreferences) => {
    localStorage.setItem('academiq_prefs', JSON.stringify(newPrefs));
    setPrefs(newPrefs);
  };

  const syncAgent = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedCourse(null);
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedTask(null);
    setActiveTab('courses');
  };

  const handleAddCourse = (newCourse: Partial<Course>) => {
    const fullCourse: Course = {
      id: Math.random().toString(36).substr(2, 9),
      code: newCourse.code || 'UNKNOWN',
      name: newCourse.name || 'Untitled Course',
      instructor: newCourse.instructor || 'Staff',
      syllabusProcessed: false,
      canvasConnected: false,
      icon: 'book-open'
    };
    setCourses([...courses, fullCourse]);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  // Task Completion Logic
  const handleToggleComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ));
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, completed: !prev.completed } : null);
    }
  };

  // Schedule Block Handlers
  const handleAddBlock = (block: Omit<TimeBlock, 'id'>) => {
    const newBlock: TimeBlock = {
      ...block,
      id: Math.random().toString(36).substr(2, 9),
    };
    setScheduleBlocks([...scheduleBlocks, newBlock]);
  };

  const handleUpdateBlock = (updatedBlock: TimeBlock) => {
    setScheduleBlocks(scheduleBlocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
  };

  const handleDeleteBlock = (id: string) => {
    setScheduleBlocks(scheduleBlocks.filter(b => b.id !== id));
  };

  const handleAcceptReview = (proposedBlocks: TimeBlock[]) => {
    setScheduleBlocks(prev => [...prev, ...proposedBlocks]);
    setShowSundayReview(false);
  };

  const handleBackToDashboard = () => {
    setSelectedTask(null);
    setSelectedCourse(null);
  };

  const handleSidebarTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedTask(null);
    setSelectedCourse(null);
  };

  // Rendering logic
  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  if (!prefs) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar 
        activeTab={selectedTask ? 'dashboard' : (selectedCourse ? 'courses' : activeTab)} 
        setActiveTab={handleSidebarTabChange} 
      />
      
      <main className="flex-1 ml-64 min-h-screen relative overflow-x-hidden">
        {/* Floating AI Notification Toast */}
        <div className="fixed top-6 right-8 z-[60] flex items-center gap-3">
            {isSyncing && (
                <div className="bg-slate-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-800 animate-in fade-in slide-in-from-right-4">
                    <Loader2 className="animate-spin text-blue-400" size={18} />
                    <span className="text-sm font-bold tracking-tight">Syncing with Canvas...</span>
                </div>
            )}
            <button 
                onClick={syncAgent}
                className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm hover:shadow-md transition-all group"
            >
                <Sparkles size={20} className="group-hover:scale-110 transition-transform" />
            </button>
        </div>

        {selectedTask ? (
          <TaskDetailPage 
            task={selectedTask} 
            onBack={handleBackToDashboard} 
            onToggleComplete={handleToggleComplete}
          />
        ) : selectedCourse ? (
          <CourseDetailPage 
            course={selectedCourse} 
            tasks={tasks} 
            onBack={handleBackToDashboard} 
            onTaskClick={handleTaskClick}
          />
        ) : (
          <div className="w-full">
            {activeTab === 'dashboard' && (
              <Dashboard 
                tasks={tasks} 
                onTaskClick={handleTaskClick} 
                onLaunchReview={() => setShowSundayReview(true)}
              />
            )}
            {activeTab === 'calendar' && (
              <SchedulePage 
                tasks={tasks} 
                blocks={scheduleBlocks}
                onAddBlock={handleAddBlock}
                onUpdateBlock={handleUpdateBlock}
                onDeleteBlock={handleDeleteBlock}
              />
            )}
            {activeTab === 'updates' && <UpdatesPage />}
            {activeTab === 'courses' && (
              <CoursesPage 
                courses={courses} 
                onSelect={handleCourseSelect} 
                onAddCourse={handleAddCourse}
                onUpdateCourse={handleUpdateCourse}
              />
            )}
            {activeTab === 'ai-lab' && <AILab />}
            {activeTab === 'settings' && (
                <SettingsPage 
                    prefs={prefs} 
                    onUpdatePrefs={handleUpdatePrefs} 
                    onLogout={handleLogout}
                    onAddCourse={() => setActiveTab('courses')}
                />
            )}
            
            {!['dashboard', 'calendar', 'updates', 'courses', 'settings', 'ai-lab'].includes(activeTab) && (
              <div className="h-screen flex flex-col items-center justify-center p-20 text-center opacity-40">
                <div className="w-32 h-32 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                    <Sparkles size={64} className="text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Module Initializing</h2>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">
                  The AI Agent is still syncing historical data for {activeTab}. Check back in a moment.
                </p>
              </div>
            )}
          </div>
        )}

        {showSundayReview && (
          <SundayReviewModal 
            onAccept={handleAcceptReview} 
            onClose={() => setShowSundayReview(false)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
