
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisStatus, AnalysisState, ViralSegment, TargetingMode } from './types';
import { GeminiService } from './services/geminiService';
import VideoUploader from './components/VideoUploader';
import SegmentCard from './components/SegmentCard';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('English');
  const [targetingMode, setTargetingMode] = useState<TargetingMode>('Both');
  const [highlightMode, setHighlightMode] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    status: AnalysisStatus.IDLE,
    segments: []
  });
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [previewRange, setPreviewRange] = useState<{start: number, end: number} | null>(null);
  const geminiServiceRef = useRef<GeminiService | null>(null);
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);

  useEffect(() => {
    geminiServiceRef.current = new GeminiService();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const handleFileSelect = (file: File) => {
    // 200MB limit for browser stability
    if (file.size > 200 * 1024 * 1024) {
      showNotification("File too large. Please use a video under 200MB for reliable analysis.", "error");
      return;
    }
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setAnalysis({ status: AnalysisStatus.IDLE, segments: [] });
    setPreviewRange(null);
  };

  const startAnalysis = async () => {
    if (!videoFile || !geminiServiceRef.current) return;

    setAnalysis({ status: AnalysisStatus.ANALYZING, segments: [] });
    
    try {
      const segments = await geminiServiceRef.current.analyzeVideo(
        videoFile, 
        language, 
        targetingMode, 
        highlightMode
      );
      if (segments.length === 0) {
        setAnalysis({
          status: AnalysisStatus.ERROR,
          segments: [],
          error: "No viral segments found. Try a different video or adjust targeting."
        });
      } else {
        setAnalysis({
          status: AnalysisStatus.COMPLETED,
          segments: segments
        });
        showNotification("Success! 8 high-potential segments extracted.", "success");
      }
    } catch (error: any) {
      setAnalysis({
        status: AnalysisStatus.ERROR,
        segments: [],
        error: error.message || "An unexpected error occurred during neural analysis."
      });
      showNotification("Analysis failed. Please check file format.", "error");
    }
  };

  const handlePreview = (start: number, end: number) => {
    if (videoPlayerRef.current) {
      setPreviewRange({ start, end });
      videoPlayerRef.current.currentTime = start;
      videoPlayerRef.current.play().catch(e => console.warn("Autoplay blocked", e));
      videoPlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDownloadClip = async (segment: ViralSegment, index: number) => {
    if (!videoUrl || downloadingIdx !== null) return;
    setDownloadingIdx(index);
    try {
      const tempVideo = document.createElement('video');
      tempVideo.src = videoUrl;
      tempVideo.muted = true;
      tempVideo.style.display = 'none';
      tempVideo.playsInline = true;
      document.body.appendChild(tempVideo);

      await new Promise((resolve, reject) => {
        tempVideo.onloadedmetadata = resolve;
        tempVideo.onerror = () => reject(new Error("Media failed to load"));
      });

      tempVideo.currentTime = segment.start;
      await new Promise((resolve) => { tempVideo.onseeked = resolve; });

      // @ts-ignore
      if (!tempVideo.captureStream) {
        throw new Error("Trimming requires a modern browser (Chrome, Edge, or Safari 14.1+).");
      }

      // @ts-ignore
      const stream = tempVideo.captureStream();
      
      // Attempt to find supported MP4 H264/AAC or high-quality WebM fallback
      const supportedMimeTypes = [
        'video/mp4;codecs=avc1,mp4a.40.2', // H.264 + AAC (True MP4)
        'video/mp4;codecs=h264',
        'video/mp4',
        'video/webm;codecs=h264,opus',
        'video/webm;codecs=h264',
        'video/webm;codecs=vp9',
        'video/webm'
      ];
      
      const mimeType = supportedMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      
      const recorder = new MediaRecorder(stream, { 
        mimeType: mimeType,
        videoBitsPerSecond: 8000000 // 8Mbps for social-ready HD quality
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Force .mp4 extension for best platform compatibility
        const baseName = segment.filename_suggestion || `Viral_${index + 1}`;
        a.download = `${baseName}.mp4`; 
        
        a.click();
        URL.revokeObjectURL(url);
        tempVideo.remove();
        setDownloadingIdx(null);
        showNotification("MP4 Export Complete!", "success");
      };

      recorder.start();
      await tempVideo.play();

      const durationMs = (segment.end - segment.start) * 1000;
      setTimeout(() => {
        tempVideo.pause();
        recorder.stop();
      }, durationMs);

    } catch (err: any) {
      setDownloadingIdx(null);
      showNotification(err.message || "Export failed.", "error");
    }
  };

  useEffect(() => {
    const video = videoPlayerRef.current;
    if (!video || !previewRange) return;

    const checkTime = () => {
      if (video.currentTime >= previewRange.end) {
        video.pause();
        video.currentTime = previewRange.start;
      }
    };

    video.addEventListener('timeupdate', checkTime);
    return () => video.removeEventListener('timeupdate', checkTime);
  }, [previewRange]);

  const loadingMessages = [
    "Neural engine scanning frames for high-retention cues...",
    "Evaluating shock factors and emotional peaks...",
    "Detecting retention hooks and curiosity loops...",
    "Optimizing segments for 2026 algorithmic trends...",
    "Generating high-impact captions and viral keywords...",
    "Ranking candidates by predicted share velocity...",
    "Finalizing 8-pack viral strategy..."
  ];

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (analysis.status === AnalysisStatus.ANALYZING) {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [analysis.status]);

  return (
    <div className="min-h-screen bg-[#020617] pb-24 overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span className="text-sm font-bold">{toast.message}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 bg-slate-950/60 backdrop-blur-xl border-b border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <i className="fas fa-bolt text-white text-xl"></i>
          </div>
          <span className="text-xl font-black tracking-tighter text-white">VIRAL<span className="text-blue-500">CLIPS</span><span className="text-slate-600 text-[10px] ml-1 uppercase font-bold tracking-widest">v2.0 PRO</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-semibold text-slate-400 hover:text-white transition-all">Docs</a>
          <button className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center gap-2">
            <i className="fab fa-discord text-indigo-400"></i> Creator Lab
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-16">
        {/* Hero */}
        <section className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            2026 Retention Meta Optimized
          </div>
          <h1 className="text-5xl md:text-[5.5rem] font-black mb-8 leading-[0.9] tracking-tight text-white">
            Extract Viral Gold <span className="gradient-text">Instantly.</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Elite AI growth expert identifies the top 8 segments from your long-form video that will trigger algorithm velocity.
          </p>
        </section>

        {/* Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-24">
          <div className="lg:col-span-2">
            <VideoUploader 
              onFileSelect={handleFileSelect} 
              disabled={analysis.status === AnalysisStatus.ANALYZING}
            />
          </div>
          
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-[2.5rem] h-full flex flex-col justify-between border-slate-700/30">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-1">Targeting Logic</h3>
                  <p className="text-xs text-slate-500 mb-6">Fine-tune the viral extraction engine</p>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2.5 ml-1">Audience Language</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3.5 text-sm font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                        disabled={analysis.status === AnalysisStatus.ANALYZING}
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>Japanese</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2.5 ml-1">Targeting Mode</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Trending', 'Niche', 'Both'] as TargetingMode[]).map(mode => (
                          <button
                            key={mode}
                            onClick={() => setTargetingMode(mode)}
                            className={`py-2.5 rounded-xl text-[10px] font-black transition-all border ${
                              targetingMode === mode 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {mode.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                      <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Highlight Mode</div>
                        <div className="text-[9px] text-slate-500 font-bold">Prioritize high-emotion peaks</div>
                      </div>
                      <button 
                        onClick={() => setHighlightMode(!highlightMode)}
                        className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${highlightMode ? 'bg-blue-600' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-all duration-300 ${highlightMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-slate-800/50">
                {videoFile && (
                  <div className="mb-6 bg-slate-950/50 p-4 rounded-2xl flex items-center gap-4 border border-slate-800/50">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400">
                      <i className="fas fa-file-video text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate text-white">{videoFile.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB • HD Source</div>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={startAnalysis}
                  disabled={!videoFile || analysis.status === AnalysisStatus.ANALYZING}
                  className={`w-full py-4.5 rounded-[1.25rem] font-black flex items-center justify-center gap-3 transition-all tracking-tight ${
                    analysis.status === AnalysisStatus.ANALYZING
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-blue-600/20'
                  }`}
                >
                  {analysis.status === AnalysisStatus.ANALYZING ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin"></div>
                      Neural Extraction Active...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-microchip"></i>
                      Analyze Viral Potential
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Video Player */}
        {videoUrl && (
          <section className="mb-24 animate-fade-in">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              <div className="relative glass-card p-2 rounded-[2.5rem] overflow-hidden border-slate-700/50">
                 <video 
                  ref={videoPlayerRef}
                  src={videoUrl} 
                  className="w-full h-auto rounded-[2rem] bg-black shadow-2xl"
                  controls
                  playsInline
                />
                {previewRange && (
                  <div className="mt-4 flex items-center justify-between px-6 py-4 bg-blue-600/5 rounded-2xl border border-blue-500/10">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
                      <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Looped Preview Active</span>
                      <span className="text-xs font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-white">
                        {Math.floor(previewRange.start / 60)}:{(previewRange.start % 60).toFixed(0).padStart(2, '0')} - {Math.floor(previewRange.end / 60)}:{(previewRange.end % 60).toFixed(0).padStart(2, '0')}
                      </span>
                    </div>
                    <button 
                      onClick={() => setPreviewRange(null)}
                      className="text-[10px] font-black text-slate-500 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest"
                    >
                      Close Preview
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {analysis.status === AnalysisStatus.ANALYZING && (
          <div className="text-center py-24 animate-fade-in">
            <div className="w-28 h-28 mx-auto mb-10 relative">
              <div className="absolute inset-0 rounded-full border-[8px] border-blue-500/5 border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-5 rounded-full border-[8px] border-indigo-500/5 border-b-indigo-500 animate-spin-reverse" style={{animationDuration: '2.5s'}}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-4xl text-white pulse-ring"></i>
              </div>
            </div>
            <h2 className="text-4xl font-black mb-4 text-white">Generating Viral 8-Pack</h2>
            <p className="text-slate-500 text-lg font-medium max-w-lg mx-auto leading-relaxed">{loadingMessages[loadingMsgIdx]}</p>
          </div>
        )}

        {/* Results Grid */}
        {analysis.status === AnalysisStatus.COMPLETED && (
          <section className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 px-2">
              <div>
                <h2 className="text-4xl font-black mb-3 text-white tracking-tight">The Neural Strategy Pack</h2>
                <p className="text-slate-500 font-medium">8 segments identified with elite retention probability for 2026.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Extraction Mode: <span className="text-blue-400">{targetingMode}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {analysis.segments.map((segment, idx) => (
                <SegmentCard 
                  key={idx} 
                  segment={segment} 
                  index={idx}
                  onPreview={handlePreview}
                  onDownload={handleDownloadClip}
                  onNotify={showNotification}
                  isDownloading={downloadingIdx === idx}
                />
              ))}
            </div>
          </section>
        )}

        {/* Error Handling */}
        {analysis.status === AnalysisStatus.ERROR && (
          <div className="max-w-2xl mx-auto glass-card border-rose-500/30 p-12 rounded-[2.5rem] text-center">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
              <i className="fas fa-bolt-slash text-3xl"></i>
            </div>
            <h2 className="text-3xl font-black mb-3 text-white">System Error</h2>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">{analysis.error}</p>
            <button 
              onClick={() => setAnalysis({ status: AnalysisStatus.IDLE, segments: [] })}
              className="px-10 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-2xl font-black transition-all"
            >
              Reload Engine
            </button>
          </div>
        )}

        {/* Feature Grid (Idle) */}
        {analysis.status === AnalysisStatus.IDLE && !videoFile && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16 pb-24">
            {[
              {icon: 'fa-gauge-high', color: 'text-blue-500', title: 'Sub-30s Analysis', desc: 'Neural architecture optimized for rapid scanning of raw media files.'},
              {icon: 'fa-chart-area', color: 'text-indigo-500', title: 'Algorithmic Fit', desc: 'Moment selection strictly follows 2026 retention meta for TikTok & Reels.'},
              {icon: 'fa-pen-nib', color: 'text-purple-500', title: 'Strategic Copy', desc: 'Instant high-converting captions and hashtags generated for every clip.'}
            ].map((f, i) => (
              <div key={i} className="glass-card p-10 rounded-[2rem] border-slate-800/40 hover:bg-white/5 transition-all group">
                <div className={`${f.color} mb-6 transition-transform group-hover:scale-110`}><i className={`fas ${f.icon} text-4xl`}></i></div>
                <h4 className="font-bold text-xl mb-3 text-white">{f.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="mt-24 border-t border-slate-900/50 py-16 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-slate-400 text-sm"></i>
              </div>
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">ViralClips AI • Global v2.0</span>
           </div>
           <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
              <a href="#" className="hover:text-blue-500">Infrastructure</a>
              <a href="#" className="hover:text-blue-500">Security</a>
              <a href="#" className="hover:text-blue-500">API Documentation</a>
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 2.5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
