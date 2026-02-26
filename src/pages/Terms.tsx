import React from 'react';
import { Link } from 'react-router-dom';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-8 pt-20 pb-32">
      <div className="mb-12">
        <Link 
          to="/" 
          className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] border border-slate-800 transition-all inline-flex items-center gap-3"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>
      <h1 className="text-5xl font-black text-white mb-8 tracking-tight uppercase">Terms & Conditions</h1>
      <div className="glass-card p-12 rounded-[3rem] border-slate-800/50 text-slate-400 space-y-8 leading-relaxed font-medium">
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Acceptance of Terms</h2>
          <p>By accessing and using ViralClips AI, you agree to be bound by these Terms and Conditions. If you do not agree, please refrain from using our services.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. Service Description</h2>
          <p>ViralClips AI provides neural-powered video analysis and segment extraction services. We use advanced H.264 encoding and AI models to identify high-retention moments in your content.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. User Responsibilities</h2>
          <p>You are responsible for the content you upload. You must own the rights to any video processed through our engine. We do not tolerate illegal, harmful, or copyright-infringing content.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Credit System</h2>
          <p>Our service operates on a credit-based system. Credits are consumed upon successful analysis of a new video. Cached results do not consume additional credits.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">5. Limitation of Liability</h2>
          <p>ViralClips AI is provided "as is". We are not liable for any direct or indirect damages resulting from the use or inability to use our neural engine.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
