
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
      await navigator.clipboard.writeText(segment.mp4_caption);
      setIsCopying(true);
      onNotify('Caption copied to clipboard!', 'success');
      setTimeout(() => setIsCopying(false), 2000);
    } catch (err) {
      onNotify('Failed to copy caption.', 'error');
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden hover:ring-1 hover:ring-blue-500/50 transition-all flex flex-col h-full relative group">
      {isDownloading && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-fade-in">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <h5 className="font-bold text-lg mb-1">Exporting MP4...</h5>
          <p className="text-xs text-slate-400 leading-relaxed">Encoding with optimized bitrates for 2026 platform standards.</p>
        </div>
      )}

      <div className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Scroll Stopper Overlay Simulation */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 transform -rotate-1 shadow-2xl">
             <span className="text-white text-xs font-black uppercase text-center block leading-tight tracking-tight">
               {segment.first_frame_text}
             </span>
          </div>
        </div>

        <div className="absolute top-3 left-3 z-30 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider border border-white/10">
          Viral Candidate #{index + 1}
        </div>
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 items-end">
            <span className="bg-blue-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-blue-400/30">
                {segment.duration}s
            </span>
            <span className="bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-slate-400 border border-slate-700/50">
                {segment.music_suggestion}
            </span>
        </div>
        
        <button 
          onClick={() => onPreview(segment.start, segment.end)}
          aria-label="Preview this clip"
          className="group/btn relative z-30 w-14 h-14 bg-white/10 hover:bg-blue-600 backdrop-blur-md rounded-full flex items-center justify-center transition-all border border-white/20 shadow-2xl"
        >
          <i className="fas fa-play text-lg translate-x-0.5 group-hover/btn:scale-110 transition-transform"></i>
        </button>
        
        <div className="absolute inset-0 opacity-40 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 group-hover:scale-105 transition-transform duration-700 bg-[url('https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-bold text-base leading-tight flex-1 mr-3 line-clamp-2">{segment.hook}</h4>
          <div className="text-right flex flex-col items-center">
            <span className={`text-xl font-black ${getScoreColor(segment.score)}`}>{segment.score}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Virality</span>
          </div>
        </div>
        
        <div className="mb-4 bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimized Caption</span>
            <button 
              onClick={handleCopyCaption}
              className={`text-[10px] font-bold transition-colors ${isCopying ? 'text-green-400' : 'text-blue-400 hover:text-blue-300'}`}
            >
              <i className={`fas ${isCopying ? 'fa-check' : 'fa-copy'} mr-1`}></i>
              {isCopying ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3 italic">"{segment.mp4_caption}"</p>
        </div>

        <div className="mb-4 flex flex-col gap-1">
          <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Target Filename</div>
          <div className="text-[10px] bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 font-mono text-slate-400 truncate">
            {segment.filename_suggestion}.mp4
          </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">Segment</span>
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {formatTime(segment.start)} — {formatTime(segment.end)}
            </span>
          </div>
          
          <button 
            disabled={isDownloading}
            onClick={() => onDownload(segment, index)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <i className="fas fa-file-video"></i>
            MP4 Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;
