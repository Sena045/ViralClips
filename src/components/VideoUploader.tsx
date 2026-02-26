
import React, { useState, useRef } from 'react';

interface VideoUploaderProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onFileSelect(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative h-[18rem] md:h-[24rem] flex flex-col items-center justify-center border-2 border-dashed rounded-[2rem] md:rounded-[3rem] transition-all duration-500 group overflow-hidden ${
        isDragging 
          ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-2xl shadow-blue-500/20' 
          : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-xl'}`}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        disabled={disabled}
      />
      
      {/* Decorative gradient behind icon */}
      <div className={`absolute w-24 h-24 md:w-32 md:h-32 blur-[60px] md:blur-[80px] rounded-full transition-all duration-700 ${isDragging ? 'bg-blue-600 opacity-40 scale-150' : 'bg-blue-600 opacity-20 scale-100'}`}></div>

      <div className={`relative bg-slate-950/80 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] mb-6 md:mb-8 border transition-all duration-500 ${isDragging ? 'border-blue-500/50 scale-110 shadow-lg' : 'border-slate-800 scale-100 shadow-none'}`}>
        <i className={`fas fa-clapperboard text-3xl md:text-5xl transition-colors duration-500 ${isDragging ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-400'}`}></i>
      </div>
      
      <div className="relative z-10 text-center px-6 md:px-12">
        <h3 className="text-xl md:text-2xl font-black mb-2 md:mb-3 text-white tracking-tight">Drop Source Raw Media</h3>
        <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-sm mx-auto">
          MP4, WebM, or MOV up to 500MB. <br/> Let AI growth experts analyze your flow.
        </p>
      </div>
      
      {!disabled && (
        <div className="mt-6 md:mt-10 relative z-10 overflow-hidden rounded-xl md:rounded-2xl group/btn">
          <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
          <button className="relative px-8 md:px-10 py-3 md:py-3.5 bg-slate-800 group-hover/btn:bg-transparent rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest text-white transition-colors duration-300 border border-slate-700/50 group-hover/btn:border-transparent">
            Choose File
          </button>
        </div>
      )}

      {/* Grid lines decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
    </div>
  );
};

export default VideoUploader;
