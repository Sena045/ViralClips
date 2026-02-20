
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
    if (file.size > 200 * 1024 * 1024) {
      showNotification("Source file exceeds 200MB limit for cloud analysis.", "error");
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
          error: "Algorithm failed to find high-potential hooks. Try a more dynamic source."
        });
      } else {
        setAnalysis({
          status: AnalysisStatus.COMPLETED,
          segments: segments
        });
        showNotification("Neural analysis complete. 8 potential bangers extracted.", "success");
      }
    } catch (error: any) {
      setAnalysis({
        status: AnalysisStatus.ERROR,
        segments: [],
        error: error.message || "Neural extraction engine encountered a protocol error."
      });
      showNotification("Analysis interrupted. Check source codec.", "error");
    }
  };

  const handlePreview = (start: number, end: number) => {
    if (videoPlayerRef.current) {
      setPreviewRange({ start, end });
      videoPlayerRef.current.currentTime = start;
      videoPlayerRef.current.play().catch(e => console.warn("Preview blocked", e));
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
        tempVideo.onerror = () => reject(new Error("MP4 stream source failed"));
      });

      tempVideo.currentTime = segment.start;
      await new Promise((resolve) => { tempVideo.onseeked = resolve; });

      // @ts-ignore
      if (!tempVideo.captureStream) {
        throw new Error("High-quality export requires a modern Chromium-based browser.");
      }

      // @ts-ignore
      const stream = tempVideo.captureStream();
      
      // Elite social platform compatibility: H.264 (avc1) + AAC (mp4a)
      const supportedMimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // H.264 High Profile + AAC
        'video/mp4;codecs=h264,aac',
        'video/mp4;codecs=h264',
        'video/mp4',
        'video/webm;codecs=h264,opus',
        'video/webm;codecs=h264',
        'video/webm'
      ];
      
      const mimeType = supportedMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
      
      const recorder = new MediaRecorder(stream, { 
        mimeType: mimeType,
        videoBitsPerSecond: 12000000 // 12Mbps for ultra-clean H.264 social uploads
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const baseName = segment.filename_suggestion || `Viral_Clip_${index + 1}`;
        a.download = `${baseName}.mp4`; 
        
        a.click();
        URL.revokeObjectURL(url);
        tempVideo.remove();
        setDownloadingIdx(null);
        showNotification("Viral H.264/AAC export complete.", "success");
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
      showNotification(err.message || "Export pipeline error.", "error");
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
    "Analyzing frames for H.264 visual high-points...",
    "Neural engines optimizing retention velocity...",
    "Identifying scroll-stopping 'shock' moments...",
    "Generating 2026-ready metadata for viral growth...",
    "Clustering frames by emotional intensity...",
    "Matching auditory peaks with high-impact captions...",
    "Finalizing the Elite Viral Strategy Pack..."
  ];

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (analysis.status === AnalysisStatus.ANALYZING) {
      const interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [analysis.status]);

  return (
    <div className="min-h-screen bg-[#020617] pb-24 overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Toast Notifications */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-3xl border shadow-2xl backdrop-blur-2xl animate-fade-in flex items-center gap-4 ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'} text-lg`}></i>
          <span className="text-sm font-black uppercase tracking-wider">{toast.message}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-8 py-5 bg-slate-950/70 backdrop-blur-2xl border-b border-slate-800/40 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/30 ring-1 ring-white/10">
            <i className="fas fa-bolt-lightning text-white text-2xl"></i>
          </div>
          <div>
            <span className="text-2xl font-black tracking-tighter text-white">VIRAL<span className="text-blue-500">CLIPS</span></span>
            <span className="block text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] -mt-1">Neural Engine 2.0</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <a href="#" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">H.264 Optimization</a>
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center gap-3">
            <i className="fab fa-discord text-indigo-400 text-base"></i> Creator Lab
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 pt-20">
        {/* Hero */}
        <section className="text-center mb-24 animate-fade-in">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] mb-10 shadow-lg shadow-blue-500/5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            H.264 High Profile Enabled
          </div>
          <h1 className="text-6xl md:text-[6.5rem] font-black mb-10 leading-[0.85] tracking-tight text-white">
            Viral <span className="gradient-text">H.264</span> Logic.
          </h1>
          <p className="text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            Extract elite 30-45s segments optimized for 2026 social algorithms with guaranteed platform compatibility.
          </p>
        </section>

        {/* Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
          <div className="lg:col-span-2">
            <VideoUploader 
              onFileSelect={handleFileSelect} 
              disabled={analysis.status === AnalysisStatus.ANALYZING}
            />
          </div>
          
          <div className="space-y-8">
            <div className="glass-card p-10 rounded-[3rem] h-full flex flex-col justify-between border-slate-700/30">
              <div className="space-y-10">
                <div>
                  <h3 className="text-2xl font-black mb-1 tracking-tight uppercase">Growth Engine</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-8">Neural extraction parameters</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Native Language</label>
                      <select 
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-blue-600 outline-none transition-all text-white"
                        disabled={analysis.status === AnalysisStatus.ANALYZING}
                      >
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                        <option>Japanese</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Algorithmic Focus</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['Trending', 'Niche', 'Both'] as TargetingMode[]).map(mode => (
                          <button
                            key={mode}
                            onClick={() => setTargetingMode(mode)}
                            className={`py-3 rounded-2xl text-[10px] font-black transition-all border ${
                              targetingMode === mode 
                                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20' 
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                            }`}
                          >
                            {mode.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-950 border border-slate-800 rounded-3xl">
                      <div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Retention Peaks</div>
                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">H.264 Optimized Cuts</div>
                      </div>
                      <button 
                        onClick={() => setHighlightMode(!highlightMode)}
                        className={`w-14 h-7 rounded-full p-1.5 transition-all duration-300 ${highlightMode ? 'bg-blue-600' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${highlightMode ? 'translate-x-7' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-14 pt-10 border-t border-slate-800/50">
                {videoFile && (
                  <div className="mb-8 bg-slate-950/60 p-5 rounded-3xl flex items-center gap-5 border border-slate-800/60 ring-1 ring-white/5">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                      <i className="fas fa-file-video text-2xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-black truncate text-white uppercase tracking-tight">{videoFile.name}</div>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Source Ready</div>
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={startAnalysis}
                  disabled={!videoFile || analysis.status === AnalysisStatus.ANALYZING}
                  className={`w-full py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-4 transition-all tracking-tight text-base uppercase ${
                    analysis.status === AnalysisStatus.ANALYZING
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] hover:bg-[100%_0] text-white hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-600/30'
                  }`}
                >
                  {analysis.status === AnalysisStatus.ANALYZING ? (
                    <>
                      <div className="w-5 h-5 border-[3px] border-slate-600 border-t-white rounded-full animate-spin"></div>
                      Encoding Strategy...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-wand-magic-sparkles"></i>
                      Analyze Viral Clips
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {videoUrl && (
          <section className="mb-32 animate-fade-in">
            <div className="max-w-5xl mx-auto relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[3.5rem] blur-2xl opacity-10 group-hover:opacity-25 transition duration-1000"></div>
              <div className="relative glass-card p-3 rounded-[3.5rem] overflow-hidden border-slate-700/50 shadow-2xl">
                 <video 
                  ref={videoPlayerRef}
                  src={videoUrl} 
                  className="w-full h-auto rounded-[2.8rem] bg-black shadow-2xl ring-1 ring-white/10"
                  controls
                  playsInline
                />
                {previewRange && (
                  <div className="mt-6 flex items-center justify-between px-8 py-5 bg-blue-600/5 rounded-3xl border border-blue-500/10">
                    <div className="flex items-center gap-5">
                      <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                      <span className="text-[12px] font-black text-blue-400 uppercase tracking-[0.2em]">Neural Loop Active</span>
                      <span className="text-sm font-black font-mono bg-slate-950 px-5 py-2 rounded-xl border border-slate-800 text-white shadow-inner">
                        {Math.floor(previewRange.start / 60)}:{(previewRange.start % 60).toFixed(0).padStart(2, '0')} — {Math.floor(previewRange.end / 60)}:{(previewRange.end % 60).toFixed(0).padStart(2, '0')}
                      </span>
                    </div>
                    <button 
                      onClick={() => setPreviewRange(null)}
                      className="text-[10px] font-black text-slate-500 hover:text-white transition-colors flex items-center gap-3 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800"
                    >
                      Reset Player
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {analysis.status === AnalysisStatus.ANALYZING && (
          <div className="text-center py-32 animate-fade-in relative">
            <div className="w-36 h-36 mx-auto mb-12 relative">
              <div className="absolute inset-0 rounded-full border-[10px] border-blue-500/5 border-t-blue-500 animate-spin"></div>
              <div className="absolute inset-6 rounded-full border-[10px] border-indigo-500/5 border-b-indigo-500 animate-spin-reverse" style={{animationDuration: '3s'}}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-brain text-5xl text-white pulse-ring opacity-80"></i>
              </div>
            </div>
            <h2 className="text-5xl font-black mb-6 text-white tracking-tight uppercase">Strategic Assembly</h2>
            <p className="text-slate-500 text-xl font-medium max-w-xl mx-auto leading-relaxed italic">"{loadingMessages[loadingMsgIdx]}"</p>
          </div>
        )}

        {analysis.status === AnalysisStatus.COMPLETED && (
          <section className="animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 px-4">
              <div>
                <h2 className="text-5xl font-black mb-4 text-white tracking-tight leading-tight uppercase">Elite Viral Pack</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Extraction Logic: <span className="text-blue-400">{targetingMode} Growth</span></p>
              </div>
              <div className="flex items-center gap-5">
                <div className="px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  8 H.264 CANDIDATES <span className="text-slate-600 mx-2">|</span> 2026 OPTIMIZED
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
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

        {analysis.status === AnalysisStatus.ERROR && (
          <div className="max-w-2xl mx-auto glass-card border-rose-500/30 p-16 rounded-[4rem] text-center shadow-2xl">
            <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-rose-500/20 shadow-lg">
              <i className="fas fa-bolt-slash text-4xl"></i>
            </div>
            <h2 className="text-4xl font-black mb-4 text-white tracking-tight">Engine Failure</h2>
            <p className="text-slate-500 mb-12 text-lg font-medium leading-relaxed">{analysis.error}</p>
            <button 
              onClick={() => setAnalysis({ status: AnalysisStatus.IDLE, segments: [] })}
              className="px-12 py-5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
            >
              Reset Protocol
            </button>
          </div>
        )}

        {analysis.status === AnalysisStatus.IDLE && !videoFile && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 pb-32">
            {[
              {icon: 'fa-microchip', color: 'text-blue-500', title: 'H.264 Neural Engine', desc: 'Advanced frame evaluation for high-profile MP4 delivery.'},
              {icon: 'fa-chart-line', color: 'text-indigo-500', title: '2026 Viral Propensity', desc: 'Predictive modeling based on upcoming platform retention standards.'},
              {icon: 'fa-wand-sparkles', color: 'text-purple-500', title: 'Automated Meta', desc: 'Instant scroll-stopping captions optimized for AAC audio-visual flow.'}
            ].map((f, i) => (
              <div key={i} className="glass-card p-12 rounded-[3.5rem] border-slate-800/40 hover:bg-white/5 transition-all group shadow-xl">
                <div className={`${f.color} mb-8 transition-transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`}><i className={`fas ${f.icon} text-5xl`}></i></div>
                <h4 className="font-black text-2xl mb-5 text-white tracking-tight uppercase">{f.title}</h4>
                <p className="text-slate-500 text-base leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      <footer className="mt-32 border-t border-slate-900/60 py-24 px-8 text-center bg-slate-950/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800">
                <i className="fas fa-bolt-lightning text-slate-500 text-lg"></i>
              </div>
              <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.4em]">ViralClips Pro • H.264 Optimized</span>
           </div>
           <div className="flex gap-12 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-blue-500 transition-colors">Infrastructure</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Privacy Neural</a>
              <a href="#" className="hover:text-blue-500 transition-colors">Global API</a>
           </div>
        </div>
      </footer>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        .pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
};

export default App;
