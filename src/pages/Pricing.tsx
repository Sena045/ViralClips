import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PricingProps {
  onUpgrade: (plan: 'pro' | 'agency') => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const Pricing: React.FC<PricingProps> = ({ onUpgrade, showNotification }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upgrading, setUpgrading] = React.useState<string | null>(null);

  const handleUpgradeClick = async (plan: 'pro' | 'agency') => {
    console.log("Pricing: handleUpgradeClick triggered", { plan, hasUser: !!user });
    
    if (!user) {
      console.warn("Pricing: User object is null. Redirecting to login.");
      showNotification("Please sign in to upgrade your plan.", "error");
      navigate('/login');
      return;
    }
    
    setUpgrading(plan);
    console.log("Pricing: Proceeding with upgrade for:", user.email);
    try {
      await onUpgrade(plan);
    } finally {
      setUpgrading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-20">
      <div className="mb-8 md:mb-12">
        <Link 
          to="/" 
          className="px-4 md:px-6 py-2.5 md:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[9px] border border-slate-800 transition-all inline-flex items-center gap-2 md:gap-3"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>
      <div className="text-center mb-12 md:mb-20 animate-fade-in">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 md:mb-6 tracking-tight uppercase leading-[1] md:leading-[0.9]">
          Scale Your <span className="gradient-text">Viral</span> Impact.
        </h1>
        <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium px-4">
          Choose the plan that fits your content strategy. Unlock elite neural processing and priority queues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-20 md:mb-32">
        {/* Free Plan */}
        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-slate-800/50 flex flex-col justify-between hover:bg-white/5 transition-all group">
          <div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 mb-6 md:mb-10 group-hover:scale-110 transition-transform">
              <i className="fas fa-seedling text-2xl md:text-3xl"></i>
            </div>
            <h4 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tight">Free Tier</h4>
            <div className="text-4xl md:text-5xl font-black text-white mb-8 md:mb-10">$0<span className="text-lg text-slate-600 font-medium">/mo</span></div>
            <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              <li className="flex items-center gap-3 md:gap-4 text-slate-400 text-sm md:text-base font-medium"><i className="fas fa-check text-blue-500"></i> 10 Free Credits</li>
              <li className="flex items-center gap-3 md:gap-4 text-slate-400 text-sm md:text-base font-medium"><i className="fas fa-check text-blue-500"></i> Max 5min Videos</li>
              <li className="flex items-center gap-3 md:gap-4 text-slate-400 text-sm md:text-base font-medium"><i className="fas fa-check text-blue-500"></i> Standard Queue</li>
              <li className="flex items-center gap-3 md:gap-4 text-slate-600 text-sm md:text-base font-medium line-through"><i className="fas fa-times"></i> Priority Worker</li>
            </ul>
          </div>
          <button className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px] md:text-xs cursor-not-allowed">
            {user?.plan === 'free' ? 'Current Plan' : 'Free Plan'}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/30 flex flex-col justify-between relative overflow-hidden md:scale-105 z-10">
          <div className="absolute top-6 md:top-8 right-6 md:right-8 bg-white text-blue-600 text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 md:py-1.5 rounded-full uppercase tracking-widest shadow-xl">Most Popular</div>
          <div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-6 md:mb-10">
              <i className="fas fa-rocket text-2xl md:text-3xl"></i>
            </div>
            <h4 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tight">Pro Creator</h4>
            <div className="text-4xl md:text-5xl font-black text-white mb-8 md:mb-10">$29<span className="text-lg text-blue-200 font-medium">/mo</span></div>
            <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              <li className="flex items-center gap-3 md:gap-4 text-blue-50 text-sm md:text-base font-medium"><i className="fas fa-check text-white"></i> 50 Credits / mo</li>
              <li className="flex items-center gap-3 md:gap-4 text-blue-50 text-sm md:text-base font-medium"><i className="fas fa-check text-white"></i> Max 45min Videos</li>
              <li className="flex items-center gap-3 md:gap-4 text-blue-50 text-sm md:text-base font-medium"><i className="fas fa-check text-white"></i> Priority Neural Queue</li>
              <li className="flex items-center gap-3 md:gap-4 text-blue-50 text-sm md:text-base font-medium"><i className="fas fa-check text-white"></i> H.264 High-Bitrate Export</li>
              <li className="flex items-center gap-3 md:gap-4 text-blue-50 text-sm md:text-base font-medium"><i className="fas fa-check text-white"></i> Custom Watermarks</li>
            </ul>
          </div>
          <button 
            onClick={() => handleUpgradeClick('pro')}
            disabled={upgrading !== null}
            className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-white text-blue-600 font-black uppercase tracking-widest text-[10px] md:text-xs hover:scale-[1.02] transition-all shadow-2xl disabled:opacity-50"
          >
            {upgrading === 'pro' ? 'Processing...' : !user ? 'Sign in to Upgrade' : user.plan === 'pro' ? 'Current Plan' : 'Upgrade Now'}
          </button>
        </div>

        {/* Agency Plan */}
        <div className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] border-slate-800/50 flex flex-col justify-between hover:bg-white/5 transition-all group">
          <div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-slate-500 mb-6 md:mb-10 group-hover:scale-110 transition-transform">
              <i className="fas fa-building text-2xl md:text-3xl"></i>
            </div>
            <h4 className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tight">Agency Elite</h4>
            <div className="text-4xl md:text-5xl font-black text-white mb-8 md:mb-10">$99<span className="text-lg text-slate-600 font-medium">/mo</span></div>
            <ul className="space-y-4 md:space-y-6 mb-8 md:mb-12">
              <li className="flex items-center gap-3 md:gap-4 text-slate-400 text-sm md:text-base font-medium"><i className="fas fa-check text-blue-500"></i> 250 Credits / mo</li>
              <li className="flex items-center gap-3 md:gap-4 text-slate-400 text-sm md:text-base font-medium"><i className="fas fa-check text-blue-500"></i> Multi-User Support</li>
              <li className="flex items-center gap-3 md:gap-4 text-slate-400 text-sm md:text-base font-medium"><i className="fas fa-check text-blue-500"></i> API Access</li>
              <li className="flex items-center gap-3 md:gap-4 text-slate-400 text-sm md:text-base font-medium"><i className="fas fa-check text-blue-500"></i> White-label Export</li>
            </ul>
          </div>
          <button 
            onClick={() => handleUpgradeClick('agency')}
            disabled={upgrading !== null}
            className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-slate-800 transition-all border border-slate-800 disabled:opacity-50"
          >
            {upgrading === 'agency' ? 'Processing...' : !user ? 'Sign in to Upgrade' : user.plan === 'agency' ? 'Current Plan' : 'Upgrade Agency'}
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto pb-20 md:pb-32">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-8 md:mb-12 text-center uppercase tracking-tight">Frequently Asked Questions</h2>
        <div className="space-y-4 md:space-y-6">
          {[
            { q: "How do credits work?", a: "One credit is used for each new video analysis. If you analyze the same video again, it's free thanks to our neural cache." },
            { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time from your settings page. You'll keep your Pro features until the end of your billing cycle." },
            { q: "What is H.264 High Profile?", a: "It's an elite encoding standard that ensures your clips look crisp on all social platforms like TikTok, Reels, and YouTube Shorts." }
          ].map((faq, i) => (
            <div key={i} className="glass-card p-6 md:p-8 rounded-2xl md:rounded-3xl border-slate-800/40">
              <h4 className="text-base md:text-lg font-black text-white mb-2 md:mb-3 uppercase tracking-tight">{faq.q}</h4>
              <p className="text-sm md:text-slate-500 font-medium leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Pricing;
