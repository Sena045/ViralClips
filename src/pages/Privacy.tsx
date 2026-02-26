import React from 'react';
import { Link } from 'react-router-dom';

const Privacy: React.FC = () => {
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
      <h1 className="text-5xl font-black text-white mb-8 tracking-tight uppercase">Privacy Policy</h1>
      <div className="glass-card p-12 rounded-[3rem] border-slate-800/50 text-slate-400 space-y-8 leading-relaxed font-medium">
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">1. Data Collection</h2>
          <p>We collect minimal data required to provide our services: your email address for account management and the video files you upload for analysis.</p>
        </section>
        
        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">2. Video Processing</h2>
          <p>Uploaded videos are processed by our neural workers. We do not share your raw video files with third parties. Analysis results (clips and metadata) are stored securely in your private library.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">3. Neural Cache</h2>
          <p>To optimize performance, we store a neural fingerprint of processed videos. This allows us to provide instant results if the same content is uploaded again, saving you time and credits.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">4. Security</h2>
          <p>We implement industry-standard encryption for data at rest and in transit. Your viral library is protected by secure authentication protocols.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">5. Your Rights</h2>
          <p>You have the right to request the deletion of your account and all associated data, including your viral library, at any time through our settings panel.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
