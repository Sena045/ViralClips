import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MyClips: React.FC = () => {
  const [clips, setClips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate fetching clips from backend
    setTimeout(() => {
      setClips([
        { id: 1, title: 'Epic Gaming Moment', date: '2026-02-24', duration: '35s', thumbnail: 'https://picsum.photos/seed/clip1/400/225' },
        { id: 2, title: 'Product Reveal Hook', date: '2026-02-23', duration: '42s', thumbnail: 'https://picsum.photos/seed/clip2/400/225' },
        { id: 3, title: 'Viral Interview Snippet', date: '2026-02-22', duration: '28s', thumbnail: 'https://picsum.photos/seed/clip3/400/225' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-20">
      <div className="mb-10 md:mb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 md:mb-4 tracking-tight uppercase">My Viral Library</h1>
          <p className="text-slate-400 text-base md:text-lg font-medium">Manage and download your previously generated neural clips.</p>
        </div>
        <Link 
          to="/" 
          className="px-6 md:px-8 py-3 md:py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[8px] md:text-[10px] border border-slate-800 transition-all flex items-center gap-2 md:gap-3 self-start md:self-center"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card aspect-video rounded-[2rem] md:rounded-[2.5rem] animate-pulse bg-slate-900/50 border-slate-800"></div>
          ))}
        </div>
      ) : clips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {clips.map((clip) => (
            <div key={clip.id} className="glass-card group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-slate-800/50 hover:border-blue-500/30 transition-all shadow-xl">
              <div className="relative aspect-video overflow-hidden">
                <img src={clip.thumbnail} alt={clip.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="w-12 h-12 md:w-14 md:h-14 bg-white text-black rounded-full flex items-center justify-center text-lg md:text-xl shadow-2xl hover:scale-110 transition-transform">
                    <i className="fas fa-play"></i>
                  </button>
                </div>
                <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 px-2 md:px-3 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest">
                  {clip.duration}
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tight uppercase truncate flex-1 mr-4">{clip.title}</h3>
                  <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">{clip.date}</span>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <button className="flex-1 py-2.5 md:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all">
                    Download
                  </button>
                  <button className="px-3 md:px-4 py-2.5 md:py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-xl transition-all border border-slate-800">
                    <i className="fas fa-share-nodes text-xs md:text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 md:py-32 glass-card rounded-[2.5rem] md:rounded-[4rem] border-slate-800/40">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900 rounded-2xl md:rounded-3xl flex items-center justify-center text-slate-700 mx-auto mb-6 md:mb-8">
            <i className="fas fa-clapperboard text-2xl md:text-3xl"></i>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-white mb-3 md:mb-4 uppercase tracking-tight">No Clips Found</h3>
          <p className="text-slate-500 text-sm md:text-base mb-10 max-w-sm mx-auto">Start analyzing videos to build your viral library.</p>
        </div>
      )}
    </div>
  );
};

export default MyClips;
