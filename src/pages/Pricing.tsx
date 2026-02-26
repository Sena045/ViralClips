import React from 'react';
import { Link } from 'react-router-dom';

interface PricingProps {
  onUpgrade: (plan: 'pro' | 'agency') => void;
}

const Pricing: React.FC<PricingProps> = ({ onUpgrade }) => {
  return (
    <div className="max-w-7xl mx-auto px-8 pt-20">
      <div className="mb-12">
        <Link 
          to="/" 
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] border border-slate-800 transition-all inline-flex items-center gap-3"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>
      <div className="text-center mb-20 animate-fade-in">
        <h1 className="text-6xl md:text-7xl font-black text-white mb-6 tracking-tight uppercase leading-[0.9]">
          Scale Your <span className="gradient-text">Viral</span> Impact.
        </h1>
        <p className="text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
          Choose the plan that fits your content strategy. Unlock elite neural processing and priority queues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
        {/* Free Plan */}
        <div className="glass-card p-12 rounded-[4rem] border-slate-800/50 flex flex-col justify-between hover:bg-white/5 transition-all group">
          <div>
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 mb-10 group-hover:scale-110 transition-transform">
              <i className="fas fa-seedling text-3xl"></i>
            </div>
            <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Free Tier</h4>
            <div className="text-5xl font-black text-white mb-10">$0<span className="text-lg text-slate-600 font-medium">/mo</span></div>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 text-slate-400 text-base font-medium"><i className="fas fa-check text-blue-500"></i> 3 Free Credits</li>
              <li className="flex items-center gap-4 text-slate-400 text-base font-medium"><i className="fas fa-check text-blue-500"></i> Max 5min Videos</li>
              <li className="flex items-center gap-4 text-slate-400 text-base font-medium"><i className="fas fa-check text-blue-500"></i> Standard Queue</li>
              <li className="flex items-center gap-4 text-slate-600 text-base font-medium line-through"><i className="fas fa-times"></i> Priority Worker</li>
            </ul>
          </div>
          <button className="w-full py-5 rounded-2xl bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-xs cursor-not-allowed">Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className="glass-card p-12 rounded-[4rem] bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/30 flex flex-col justify-between relative overflow-hidden scale-105 z-10">
          <div className="absolute top-8 right-8 bg-white text-blue-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Most Popular</div>
          <div>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-10">
              <i className="fas fa-rocket text-3xl"></i>
            </div>
            <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Pro Creator</h4>
            <div className="text-5xl font-black text-white mb-10">$29<span className="text-lg text-blue-200 font-medium">/mo</span></div>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 text-blue-50 text-base font-medium"><i className="fas fa-check text-white"></i> 50 Credits / mo</li>
              <li className="flex items-center gap-4 text-blue-50 text-base font-medium"><i className="fas fa-check text-white"></i> Max 45min Videos</li>
              <li className="flex items-center gap-4 text-blue-50 text-base font-medium"><i className="fas fa-check text-white"></i> Priority Neural Queue</li>
              <li className="flex items-center gap-4 text-blue-50 text-base font-medium"><i className="fas fa-check text-white"></i> H.264 High-Bitrate Export</li>
              <li className="flex items-center gap-4 text-blue-50 text-base font-medium"><i className="fas fa-check text-white"></i> Custom Watermarks</li>
            </ul>
          </div>
          <button 
            onClick={() => onUpgrade('pro')}
            className="w-full py-5 rounded-2xl bg-white text-blue-600 font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-2xl"
          >
            Upgrade Now
          </button>
        </div>

        {/* Agency Plan */}
        <div className="glass-card p-12 rounded-[4rem] border-slate-800/50 flex flex-col justify-between hover:bg-white/5 transition-all group">
          <div>
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 mb-10 group-hover:scale-110 transition-transform">
              <i className="fas fa-building text-3xl"></i>
            </div>
            <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Agency Elite</h4>
            <div className="text-5xl font-black text-white mb-10">$99<span className="text-lg text-slate-600 font-medium">/mo</span></div>
            <ul className="space-y-6 mb-12">
              <li className="flex items-center gap-4 text-slate-400 text-base font-medium"><i className="fas fa-check text-blue-500"></i> 250 Credits / mo</li>
              <li className="flex items-center gap-4 text-slate-400 text-base font-medium"><i className="fas fa-check text-blue-500"></i> Multi-User Support</li>
              <li className="flex items-center gap-4 text-slate-400 text-base font-medium"><i className="fas fa-check text-blue-500"></i> API Access</li>
              <li className="flex items-center gap-4 text-slate-400 text-base font-medium"><i className="fas fa-check text-blue-500"></i> White-label Export</li>
            </ul>
          </div>
          <button 
            onClick={() => onUpgrade('agency')}
            className="w-full py-5 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all border border-slate-800"
          >
            Upgrade Agency
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto pb-32">
        <h2 className="text-4xl font-black text-white mb-12 text-center uppercase tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-6">
          {[
            { q: "How do credits work?", a: "One credit is used for each new video analysis. If you analyze the same video again, it's free thanks to our neural cache." },
            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time from your settings page. You'll keep your Pro features until the end of your billing cycle." },
            { q: "What is H.264 High Profile?", a: "It's an elite encoding standard that ensures your clips look crisp on all social platforms like TikTok, Reels, and YouTube Shorts." }
          ].map((faq, i) => (
            <div key={i} className="glass-card p-8 rounded-3xl border-slate-800/40">
              <h4 className="text-lg font-black text-white mb-3 uppercase tracking-tight">{faq.q}</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Pricing;
