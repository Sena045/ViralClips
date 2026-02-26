import React from 'react';
import { Link } from 'react-router-dom';

interface SettingsProps {
  userCredits: number;
}

const Settings: React.FC<SettingsProps> = ({ userCredits }) => {
  return (
    <div className="max-w-4xl mx-auto px-8 pt-20">
      <div className="mb-12">
        <Link 
          to="/" 
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] border border-slate-800 transition-all inline-flex items-center gap-3"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>
      <div className="mb-16">
        <h1 className="text-5xl font-black text-white mb-4 tracking-tight uppercase">Account Settings</h1>
        <p className="text-slate-400 text-lg font-medium">Manage your profile, credits, and neural engine preferences.</p>
      </div>

      <div className="space-y-10">
        {/* Profile Section */}
        <div className="glass-card p-10 rounded-[3rem] border-slate-800/50 shadow-xl">
          <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
            <i className="fas fa-user text-blue-500"></i>
            Neural Identity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Display Name</label>
              <input type="text" defaultValue="Demo Creator" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Email Address</label>
              <input type="email" defaultValue="demo@viralclips.ai" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Usage Section */}
        <div className="glass-card p-10 rounded-[3rem] border-slate-800/50 shadow-xl">
          <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
            <i className="fas fa-chart-pie text-indigo-500"></i>
            Usage & Credits
          </h3>
          <div className="flex items-center justify-between p-8 bg-slate-950 border border-slate-800 rounded-[2rem]">
            <div>
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Available Credits</div>
              <div className="text-4xl font-black text-white tracking-tighter">{userCredits} <span className="text-lg text-slate-600">/ 3</span></div>
            </div>
            <button className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">
              Buy More Credits
            </button>
          </div>
          <p className="mt-6 text-xs text-slate-500 font-medium leading-relaxed">
            Credits are deducted only for new video analysis. Cached results are always free. Credits reset on the 1st of every month for Pro members.
          </p>
        </div>

        {/* Preferences Section */}
        <div className="glass-card p-10 rounded-[3rem] border-slate-800/50 shadow-xl">
          <h3 className="text-2xl font-black text-white mb-8 uppercase tracking-tight flex items-center gap-4">
            <i className="fas fa-sliders text-purple-500"></i>
            Engine Preferences
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-2xl">
              <div>
                <div className="text-sm font-black text-white uppercase tracking-tight">Auto-Captioning</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Generate social captions automatically</div>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full p-1 flex justify-end">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-6 bg-slate-950 border border-slate-800 rounded-2xl">
              <div>
                <div className="text-sm font-black text-white uppercase tracking-tight">H.264 High Profile</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Always export in maximum quality</div>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full p-1 flex justify-end">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 flex justify-end gap-6">
          <button className="px-10 py-4 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">
            Discard Changes
          </button>
          <button className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all">
            Save Neural Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
