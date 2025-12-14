import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Bell, Sun, Moon, Menu, Loader2 } from 'lucide-react';
import { AppRoute } from './types';
import { Dashboard } from './components/Dashboard';
import { StudyCompanion } from './components/Academic/StudyCompanion';
import { LabGenerator } from './components/Academic/LabGenerator';
import { KnowledgeVault } from './components/Academic/KnowledgeVault';
import { BudgetTracker } from './components/Life/BudgetTracker';
import { ResumeBuilder } from './components/Career/ResumeBuilder';
import { AttendanceTracker } from './components/Academic/AttendanceTracker';
import { UserProfile } from './components/Profile/UserProfile';
import { Sidebar } from './components/Layout/Sidebar';
import { BackgroundCanvas } from './components/Layout/BackgroundCanvas';
import { Login } from './components/Auth/Login';
import { BottomNav } from './components/Layout/BottomNav';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import { api } from './services/api';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

const NotificationBell: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-500">Notifications</h3>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Clear</button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm">
                    All caught up!
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''}`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!n.read && <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5"></div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path={`/${AppRoute.ACADEMIC}`} element={<PageWrapper><StudyCompanion /></PageWrapper>} />
        <Route path={`/${AppRoute.VAULT}`} element={<PageWrapper><KnowledgeVault /></PageWrapper>} />
        <Route path={`/${AppRoute.ATTENDANCE}`} element={<PageWrapper><AttendanceTracker /></PageWrapper>} />
        <Route path={`/${AppRoute.LABS}`} element={<PageWrapper><LabGenerator /></PageWrapper>} />
        <Route path={`/${AppRoute.LIFE}`} element={<PageWrapper><BudgetTracker /></PageWrapper>} />
        <Route path={`/${AppRoute.CAREER}`} element={<PageWrapper><ResumeBuilder /></PageWrapper>} />
        <Route path={`/${AppRoute.PROFILE}`} element={<PageWrapper><UserProfile /></PageWrapper>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// --- Enhanced Entry Animation Component ---
interface EntrySplashProps {
  onComplete: () => void;
  user: any;
}

const EntrySplash: React.FC<EntrySplashProps> = ({ onComplete, user }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const firstName = user.name.split(' ')[0];

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <motion.div 
            animate={{ 
               scale: [1, 1.2, 1],
               opacity: [0.3, 0.5, 0.3] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px]"
         />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>
      
      <div className="flex flex-col items-center relative z-10">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "backOut" }}
          className="relative w-32 h-32 mb-8 flex items-center justify-center"
        >
           {/* Rotating Outer Ring */}
           <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-white/10 border-t-primary-500 border-r-indigo-500"
           />
           
           {/* Inner Pulsing Circle */}
           <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-2 rounded-full bg-slate-900 shadow-2xl border border-white/5 flex items-center justify-center"
           >
               <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                   <defs>
                     <linearGradient id="logo_grad_splash" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                       <stop offset="0%" stopColor="#f97316" />
                       <stop offset="100%" stopColor="#6366f1" />
                     </linearGradient>
                   </defs>
                   {/* Animated Paths */}
                   <motion.path 
                      d="M12 10H20C24.4183 10 28 13.5817 28 18V22C28 26.4183 24.4183 30 20 30H12" 
                      stroke="url(#logo_grad_splash)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                   />
                   <motion.path 
                      d="M12 20H24" 
                      stroke="url(#logo_grad_splash)" 
                      strokeWidth="3.5" 
                      strokeLinecap="round" 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, ease: "easeInOut", delay: 0.8 }}
                   />
                   <motion.circle 
                      cx="30" cy="10" r="3" fill="#f97316" 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2, type: "spring" }}
                   />
                   <motion.circle 
                      cx="30" cy="30" r="3" fill="#6366f1" 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.4, type: "spring" }}
                   />
                </svg>
           </motion.div>
        </motion.div>

        {/* Text Animations */}
        <div className="text-center overflow-hidden px-4">
          <motion.h2 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2"
          >
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-400">{firstName}</span>
          </motion.h2>
          
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.2 }}
             className="flex items-center justify-center gap-2 text-slate-400 text-sm font-mono mt-3"
          >
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             <span>Initializing {user.branch || 'System'} Protocol...</span>
          </motion.div>
        </div>

        {/* Loading Bar */}
        <motion.div 
          className="mt-12 h-1 bg-slate-800 rounded-full w-64 overflow-hidden relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
           <motion.div 
             className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
             initial={{ x: '-100%' }}
             animate={{ x: '100%' }}
             transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
           />
           <motion.div 
             className="h-full bg-gradient-to-r from-primary-600 to-indigo-600"
             initial={{ width: 0 }}
             animate={{ width: "100%" }}
             transition={{ delay: 0.8, duration: 1.8, ease: "easeInOut" }}
           />
        </motion.div>
      </div>
    </motion.div>
  );
};

const MainLayout: React.FC = () => {
  const { user, setUser, isLoading } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const handleLogin = (userData: any) => {
    setShowSplash(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 border border-white/10"
              >
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                     <defs>
                       <linearGradient id="logo_grad_loader" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                         <stop offset="0%" stopColor="#f97316" />
                         <stop offset="100%" stopColor="#6366f1" />
                       </linearGradient>
                     </defs>
                     <path d="M12 10H20C24.4183 10 28 13.5817 28 18V22C28 26.4183 24.4183 30 20 30H12" stroke="url(#logo_grad_loader)" strokeWidth="3.5" strokeLinecap="round" />
                     <path d="M12 20H24" stroke="url(#logo_grad_loader)" strokeWidth="3.5" strokeLinecap="round" />
                     <circle cx="30" cy="10" r="3" fill="#f97316" />
                     <circle cx="30" cy="30" r="3" fill="#6366f1" />
                  </svg>
              </motion.div>
              <Loader2 className="animate-spin text-primary-600" size={24} />
              <p className="text-slate-500 text-sm font-medium animate-pulse">Initializing OS...</p>
          </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen">
        <BackgroundCanvas />
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/90 dark:bg-slate-950/90 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-100 selection:text-primary-900 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {showSplash && <EntrySplash key="splash" onComplete={() => setShowSplash(false)} user={user} />}
      </AnimatePresence>

      <BackgroundCanvas />
      
      {/* Desktop Sidebar / Mobile Menu Drawer */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        onLogout={handleLogout} 
        user={user} 
      />
      
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden md:ml-72 transition-all duration-300">
        {/* Mobile Header - Compact */}
        <header className="flex items-center justify-between px-4 py-3 md:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-2.5">
             <div className="w-8 h-8 relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-lg blur-sm opacity-40"></div>
                <div className="relative w-full h-full bg-slate-900 rounded-lg flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
                        <defs>
                            <linearGradient id="logo_grad_mobile" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#f97316" />
                                <stop offset="100%" stopColor="#6366f1" />
                            </linearGradient>
                        </defs>
                        <path d="M12 10H20C24.4183 10 28 13.5817 28 18V22C28 26.4183 24.4183 30 20 30H12" stroke="url(#logo_grad_mobile)" strokeWidth="3.5" strokeLinecap="round" />
                        <path d="M12 20H24" stroke="url(#logo_grad_mobile)" strokeWidth="3.5" strokeLinecap="round" />
                        <circle cx="30" cy="10" r="3" fill="#f97316" />
                        <circle cx="30" cy="30" r="3" fill="#6366f1" />
                    </svg>
                </div>
             </div>
             <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">EngiLife</span>
          </div>
          <div className="flex gap-1.5">
            <ThemeToggle />
            <NotificationBell />
          </div>
        </header>

        <main className="w-full max-w-7xl mx-auto p-4 md:p-8 pb-32 md:pb-24">
           {/* Top Tools Row (Desktop) */}
           <div className="hidden md:flex justify-end gap-2 mb-6">
              <ThemeToggle />
              <NotificationBell />
           </div>

           <AnimatedRoutes />
        </main>
      </div>

      <BottomNav onOpenMenu={() => setSidebarOpen(true)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <MainLayout />
      </HashRouter>
    </AppProvider>
  );
}