import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  userCredits: number;
  userPlan: string;
  userId: string | null;
  onShowPricing: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userCredits, userPlan, userId, onShowPricing, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'fa-house' },
    { name: 'Pricing', path: '/pricing', icon: 'fa-tags' },
  ];

  const isGuest = !userId || userId === 'Guest';

  return (
    <div className="min-h-screen bg-[#020617] pb-24 overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-4 md:px-8 py-4 md:py-5 bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/40 flex justify-between items-center">
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/" className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 ring-1 ring-white/10">
              <i className="fas fa-bolt-lightning text-white text-xl md:text-2xl"></i>
            </div>
            <div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-white">VIRAL<span className="text-blue-500">CLIPS</span></span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2 ml-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${
                  location.pathname === item.path
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <i className={`fas ${item.icon} text-sm`}></i>
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* User Profile & Logout */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-xl">
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                {isGuest ? 'Neural Link' : 'Active Pilot'}
              </span>
              <span className="text-[10px] font-bold text-slate-300 truncate max-w-[120px]">{userId || 'Guest'}</span>
            </div>
            <div className="w-[1px] h-6 bg-slate-800 mx-1"></div>
            {isGuest ? (
              <Link 
                to="/login"
                className="text-blue-500 hover:text-blue-400 transition-colors"
                title="Login"
              >
                <i className="fas fa-sign-in-alt text-sm"></i>
              </Link>
            ) : (
              <button 
                onClick={() => {
                  console.log("Layout: Logout button clicked");
                  onLogout();
                }}
                className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                title="Logout"
              >
                <i className="fas fa-power-off text-sm"></i>
              </button>
            )}
          </div>

          <div className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2 md:gap-3">
            <span className="text-[9px] md:text-[10px] font-black text-blue-400 uppercase tracking-widest">Credits: {userCredits}</span>
            <button 
              onClick={onShowPricing}
              className="text-[8px] md:text-[9px] font-black bg-blue-600 text-white px-2 md:px-3 py-1 rounded-lg hover:bg-blue-500 transition-all uppercase"
            >
              Get More
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-slate-950/80 backdrop-blur-3xl border-t border-slate-800/50 px-6 py-4 flex justify-around items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-all ${
              location.pathname === item.path ? 'text-blue-500' : 'text-slate-500'
            }`}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
          </Link>
        ))}
      </nav>

      <main>
        {children}
      </main>

      <footer className="mt-32 border-t border-slate-900/60 py-24 px-8 text-center bg-slate-950/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                <i className="fas fa-bolt-lightning text-slate-500 text-lg"></i>
              </div>
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">ViralClips Pro • H.264 Optimized</span>
           </div>
           <div className="flex gap-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              <Link to="/terms" className="hover:text-blue-500 transition-colors">Terms</Link>
              <Link to="/refund" className="hover:text-blue-500 transition-colors">Refund</Link>
              <Link to="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
              <Link to="/business-model" className="hover:text-blue-500 transition-colors">Business Model</Link>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
