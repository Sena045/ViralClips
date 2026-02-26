import React from 'react';
import { Link } from 'react-router-dom';

const Refund: React.FC = () => {
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
      <h1 className="text-5xl font-black text-white mb-8 tracking-tight uppercase">Refund Policy</h1>
      <div className="glass-card p-12 rounded-[3rem] border-slate-800/50 text-slate-400 space-y-8 leading-relaxed font-medium">
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Neural Analysis Credits</h2>
          <p>Credits purchased for video analysis are non-refundable once they have been used. We provide 3 free credits to all new users to test the quality of our neural engine before committing to a purchase.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. Subscription Cancellations</h2>
          <p>You may cancel your Pro Creator or Agency Elite subscription at any time. Upon cancellation, you will retain access to your Pro features until the end of your current billing cycle. We do not offer partial refunds for unused subscription time.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. Technical Failures</h2>
          <p>If a technical error on our part results in a failed analysis where credits were deducted, please contact our support team. We will investigate the issue and credit your account for any valid technical failures.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Quality Satisfaction</h2>
          <p>As AI analysis is subjective, we do not offer refunds based on the "viral propensity" or creative choices made by the neural engine. We encourage users to use their free credits to understand the engine's logic.</p>
        </section>
      </div>
    </div>
  );
};

export default Refund;
