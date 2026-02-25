
import React, { useState } from 'react';
import { ViralSegment } from '../types';

interface SegmentCardProps {
  segment: ViralSegment;
  index: number;
  onPreview: (start: number, end: number) => void;
  onDownload: (segment: ViralSegment, index: number) => void;
  onNotify: (msg: string, type: 'success' | 'error') => void;
  isDownloading: boolean;
}

const SegmentCard: React.FC<SegmentCardProps> = ({ segment, index, onPreview, onDownload, onNotify, isDownloading }) => {
  const [isCopying, setIsCopying] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-rose-400';
    if (score >= 7) return 'text-orange-400';
    return 'text-amber-400';
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(segment.social_caption);
      setIsCopying(true);
      onNotify('Viral caption ready for paste.', 'success');
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      onNotify('Clipboard access denied.', 'error');
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden hover:ring-2 hover:ring-blue-500/40 transition-all duration-500 flex flex-col h-full relative group shadow-xl">
      {isDownloading && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-8 animate-fade-in border-2 border-blue-500/20 rounded-[2.5rem]">
          <div className="w-16 h-16 border-[5px] border-blue-500/10 border-t-blue-500 rounded-full animate-spin mb-6"></div>
          <h5 className="font-black text-xl mb-2 text-white uppercase tracking-tighter">Encoding MP4</h5>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Applying H.264 profile optimization for 2026 platform standards.</p>
        </div>
      )}

      <div className="relative h-56 bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Scroll Stopper Overlay Simulation */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 transform -rotate-2 shadow-2xl ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-500">
             <span className="text-white text-[10px] font-black uppercase text-center block leading-tight tracking-tight max-w-[140px]">
               {segment.first_frame_overlay}
             </span>
          </div>
        </div>

        <div className="absolute top-4 left-4 z-30 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-white/10 shadow-lg text-slate-300">
          Neural Hit #{index + 1}
        </div>
        
        <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 items-end">
            <span className="bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-400/30 shadow-lg text-white">
                {segment.duration_seconds}s
            </span>
            {segment.music_suggestion && (
              <span className="bg-slate-950/90 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/50 shadow-md">
                  {segment.music_suggestion}
              </span>
            )}
        </div>
        
        <button 
          onClick={() => onPreview(segment.start_time_seconds, segment.end_time_seconds)}
          aria-label="Preview Neural Loop"
          className="group/btn relative z-30 w-16 h-16 bg-white/10 hover:bg-blue-600 backdrop-blur-xl rounded-full flex items-center justify-center transition-all border border-white/20 shadow-2xl active:scale-90"
        >
          <i className="fas fa-play text-xl translate-x-0.5 text-white group-hover/btn:scale-125 transition-transform"></i>
          <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20"></div>
        </button>
        
        <div className="absolute inset-0 opacity-60 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 group-hover:scale-110 transition-transform duration-[2s] bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <h4 className="font-black text-lg leading-[1.1] flex-1 mr-4 line-clamp-2 text-white tracking-tight uppercase">{segment.hook_title}</h4>
          <div className="text-right flex flex-col items-center bg-slate-950 px-3 py-2 rounded-2xl border border-slate-800 shadow-inner">
            <span className={`text-2xl font-black ${getScoreColor(segment.virality_score / 10)}`}>{segment.virality_score}</span>
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Growth</span>
          </div>
        </div>
        
        <div className="mb-6 bg-slate-950 p-4 rounded-3xl border border-slate-800 shadow-inner group/caption">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Social Meta Copy</span>
            <button 
              onClick={handleCopyCaption}
              className={`text-[9px] font-black uppercase tracking-widest transition-all px-3 py-1 rounded-lg border ${isCopying ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-blue-500 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:text-blue-400'}`}
            >
              <i className={`fas ${isCopying ? 'fa-check' : 'fa-copy'} mr-2`}></i>
              {isCopying ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 italic font-medium">"{segment.social_caption}"</p>
        </div>

        <div className="mb-6 flex flex-col gap-2">
          <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">Target Filename</div>
          <div className="text-[10px] bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 font-mono text-slate-500 truncate shadow-inner italic">
            {segment.seo_slug}.mp4
          </div>
        </div>
        
        <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Neural Stamp</span>
            <span className="text-[11px] font-mono font-black text-slate-300 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
              {formatTime(segment.start_time_seconds)} — {formatTime(segment.end_time_seconds)}
            </span>
          </div>
          
          <button 
            disabled={isDownloading}
            onClick={() => onDownload(segment, index)}
            className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
          >
            <i className="fas fa-file-export text-sm"></i>
            MP4 Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;
