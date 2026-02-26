import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  userCredits: number;
  onShowPricing: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userCredits, onShowPricing }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: 'fa-house' },
    { name: 'My Clips', path: '/clips', icon: 'fa-clapperboard' },
    { name: 'Pricing', path: '/pricing', icon: 'fa-tags' },
    { name: 'Settings', path: '/settings', icon: 'fa-gear' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] pb-24 overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-8 py-5 bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/40 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 ring-1 ring-white/10">
              <i className="fas fa-bolt-lightning text-white text-2xl"></i>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter text-white">VIRAL<span className="text-blue-500">CLIPS</span></span>
              <span className="block text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] -mt-1">Neural Engine 2.0</span>
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

        <div className="flex items-center gap-6">
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Credits: {userCredits}</span>
            <button 
              onClick={onShowPricing}
              className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-500 transition-all uppercase"
            >
              Get More
            </button>
          </div>
          <button className="hidden md:flex px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all items-center gap-3">
            <i className="fab fa-discord text-indigo-400 text-base"></i> Creator Lab
          </button>
        </div>
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
