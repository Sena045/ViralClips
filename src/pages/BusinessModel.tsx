import React from 'react';
import { Link } from 'react-router-dom';

const BusinessModel: React.FC = () => {
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
      <h1 className="text-5xl font-black text-white mb-8 tracking-tight uppercase">Business Model</h1>
      <div className="glass-card p-12 rounded-[3rem] border-slate-800/50 text-slate-400 space-y-8 leading-relaxed font-medium">
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">The Neural Economy</h2>
          <p>ViralClips AI operates on a "Value-per-Analysis" model. We believe creators should only pay for the computational power they consume while scaling their content.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Freemium Entry</h2>
          <p>We offer a generous free tier with 3 neural credits. This allows every creator to experience the power of H.264 optimized extraction without any upfront cost.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. Subscription Tiers</h2>
          <p>Our Pro and Agency plans are designed for high-volume creators. These subscriptions provide a predictable monthly credit allowance at a significant discount compared to individual credit purchases.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. Strategic Efficiency</h2>
          <p>Our proprietary Neural Cache technology reduces our operational costs by avoiding redundant processing. We pass these savings directly to our users through competitive pricing and free re-analysis.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Future Roadmap</h2>
          <p>We are expanding into API licensing for large media houses and social agencies, allowing them to integrate our viral logic directly into their own content pipelines.</p>
        </section>
      </div>
    </div>
  );
};

export default BusinessModel;
