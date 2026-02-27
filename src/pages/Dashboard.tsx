import React, { useState, useEffect, useRef } from 'react';
import { AnalysisStatus, AnalysisState, ViralSegment, TargetingMode, SaaSJob } from '../types';
import VideoUploader from '../components/VideoUploader';
import SegmentCard from '../components/SegmentCard';
import { analyzeVideoMetadata } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  userCredits: number;
  userPlan: 'free' | 'pro' | 'agency';
  onUpdateCredits: () => void;
  onShowPricing: () => void;
  showNotification: (message: string, type: 'success' | 'error') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userCredits, userPlan, onUpdateCredits, onShowPricing, showNotification }) => {
  const { token } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [language, setLanguage] = useState<string>('English');
  const [targetingMode, setTargetingMode] = useState<TargetingMode>('Both');
  const [highlightMode, setHighlightMode] = useState<boolean>(true);
  const [analysis, setAnalysis] = useState<AnalysisState>({
    status: AnalysisStatus.IDLE
  });
  
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [previewRange, setPreviewRange] = useState<{start: number, end: number} | null>(null);
  const [downloadingIdx, setDownloadingIdx] = useState<number | null>(null);

  const handleFileSelect = (file: File) => {
    if (userCredits <= 0) {
      onShowPricing();
      showNotification("You've used all your free credits. Upgrade to continue.", "error");
      return;
    }
    if (file.size > 500 * 1024 * 1024) {
      showNotification("Source file exceeds 500MB limit for neural analysis.", "error");
      return;
    }

    // Check duration
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempVideo.src);
      const duration = tempVideo.duration;
      
      const maxDuration = userPlan === 'free' ? 300 : (userPlan === 'pro' ? 2700 : 7200); // 5min, 45min, 2hr
      const planName = userPlan === 'free' ? 'Free' : (userPlan === 'pro' ? 'Pro' : 'Agency');

      if (duration > maxDuration) {
        onShowPricing();
        showNotification(`Videos longer than ${maxDuration / 60} minutes require a higher tier license. Your current ${planName} plan limit is ${maxDuration / 60} minutes.`, "error");
        setVideoFile(null);
        setVideoUrl(null);
      } else {
        setVideoFile(file);
        setVideoDuration(duration);
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        setAnalysis({ status: AnalysisStatus.IDLE });
        setPreviewRange(null);
      }
    };
    tempVideo.src = URL.createObjectURL(file);
  };

  const startAnalysis = async () => {
    if (!videoFile) return;

    setAnalysis({ status: AnalysisStatus.UPLOADING });
    
    try {
      const urlRes = await fetch("/api/jobs/upload-url", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ fileName: videoFile.name, fileSize: videoFile.size })
      });
      
      if (urlRes.status === 403) {
        onShowPricing();
        throw new Error("Insufficient credits. Please upgrade.");
      }

      if (!urlRes.ok) throw new Error("Failed to get upload authorization");
      const { jobId, uploadUrl, creditsRemaining, isCached, message } = await urlRes.json();
      onUpdateCredits();

      if (isCached) {
        setAnalysis({ status: AnalysisStatus.ANALYZING });
        showNotification(message || "Instant result from neural cache!", "success");
        
        const jobRes = await fetch(`/api/jobs/${jobId}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const job = await jobRes.json();
        
        setAnalysis({
          status: AnalysisStatus.COMPLETED,
          result: job.result
        });
        return;
      }

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: videoFile
      });
      
      if (!uploadRes.ok) throw new Error("Upload failed");

      setAnalysis({ status: AnalysisStatus.ANALYZING });
      
      // CALL GEMINI FROM FRONTEND
      try {
        const result = await analyzeVideoMetadata(videoFile.name, videoFile.size, videoDuration);
        
        // SYNC WITH BACKEND
        await fetch(`/api/jobs/${jobId}/complete`, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ result })
        });

        setAnalysis({
          status: AnalysisStatus.COMPLETED,
          result
        });
        showNotification("Neural analysis complete. Results delivered.", "success");
      } catch (aiError: any) {
        throw new Error(`Neural Engine Error: ${aiError.message}`);
      }

    } catch (error: any) {
      setAnalysis({
        status: AnalysisStatus.ERROR,
        error: error.message || "SaaS pipeline error."
      });
      showNotification(error.message || "Analysis interrupted.", "error");
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

      tempVideo.currentTime = segment.start_time_seconds;
      await new Promise((resolve) => { tempVideo.onseeked = resolve; });

      // @ts-ignore
      if (!tempVideo.captureStream) {
        throw new Error("High-quality export requires a modern Chromium-based browser.");
      }

      // @ts-ignore
      const stream = tempVideo.captureStream();
      
      const supportedMimeTypes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
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
        videoBitsPerSecond: 12000000 
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const baseName = segment.seo_slug || `Viral_Clip_${index + 1}`;
        a.download = `${baseName}.mp4`; 
        
        a.click();
        URL.revokeObjectURL(url);
        tempVideo.remove();
        setDownloadingIdx(null);
        showNotification("Viral H.264/AAC export complete.", "success");
      };

      recorder.start();
      
      const stopRecorder = () => {
        if (recorder.state === 'recording') {
          tempVideo.pause();
          recorder.stop();
        }
      };

      tempVideo.onended = stopRecorder;
      await tempVideo.play();

      // Ensure we don't record past the actual video end
      const actualEnd = Math.min(segment.end_time_seconds, tempVideo.duration);
      const actualStart = Math.max(segment.start_time_seconds, 0);
      const durationMs = (actualEnd - actualStart) * 1000;
      
      setTimeout(stopRecorder, durationMs);

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
    "Generating 2027-ready metadata for viral growth...",
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getNeuralStamp = () => {
    return `NS-260226-V1`; // Based on current date 2026-02-26
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 md:pt-20">
      {/* Hero */}
      <section className="text-center mb-16 md:mb-24 animate-fade-in">
        <div className="inline-flex items-center gap-3 px-4 md:px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] mb-6 md:mb-10 shadow-lg shadow-blue-500/5">
          <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
          Neural Stamp: 260226 // H.264 High Profile
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-[6.5rem] font-black mb-6 md:mb-10 leading-[0.9] md:leading-[0.85] tracking-tight text-white">
          Viral <span className="gradient-text">H.264</span> Logic.
        </h1>
        <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium px-4">
          Extract elite 30-45s segments optimized for 2027 social algorithms with guaranteed platform compatibility.
        </p>
      </section>

      {/* Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 mb-20 md:mb-32">
        <div className="lg:col-span-2">
          <VideoUploader 
            onFileSelect={handleFileSelect} 
            disabled={analysis.status === AnalysisStatus.ANALYZING}
          />
        </div>
        
        <div className="space-y-6 md:space-y-8">
          <div className="glass-card p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] h-full flex flex-col justify-between border-slate-700/30">
            <div className="space-y-8 md:space-y-10">
              <div>
                <h3 className="text-xl md:text-2xl font-black mb-1 tracking-tight uppercase">Growth Engine</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6 md:mb-8">Neural extraction parameters</p>
                
                <div className="space-y-5 md:space-y-6">
                  <div>
                    <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 md:mb-3 ml-1">Native Language</label>
                    <select 
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-black focus:ring-2 focus:ring-blue-600 outline-none transition-all text-white"
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
                    <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 md:mb-3 ml-1">Algorithmic Focus</label>
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                      {(['Trending', 'Niche', 'Both'] as TargetingMode[]).map(mode => (
                        <button
                          key={mode}
                          onClick={() => setTargetingMode(mode)}
                          className={`py-2 md:py-3 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black transition-all border ${
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

                  <div className="flex items-center justify-between p-4 md:p-5 bg-slate-950 border border-slate-800 rounded-2xl md:rounded-3xl">
                    <div>
                      <div className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">Retention Peaks</div>
                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">H.264 Optimized Cuts</div>
                    </div>
                    <button 
                      onClick={() => setHighlightMode(!highlightMode)}
                      className={`w-12 md:w-14 h-6 md:h-7 rounded-full p-1 md:p-1.5 transition-all duration-300 ${highlightMode ? 'bg-blue-600' : 'bg-slate-800'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${highlightMode ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-slate-800/50">
              {videoFile && (
                <div className="mb-6 md:mb-8 bg-slate-950/60 p-4 md:p-5 rounded-2xl md:rounded-3xl flex items-center gap-4 md:gap-5 border border-slate-800/60 ring-1 ring-white/5">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-900 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-500 shadow-inner">
                    <i className="fas fa-file-video text-xl md:text-2xl"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs md:text-sm font-black truncate text-white uppercase tracking-tight">{videoFile.name}</div>
                    <div className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-widest">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Source Ready</div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={startAnalysis}
                disabled={!videoFile || analysis.status === AnalysisStatus.ANALYZING}
                className={`w-full py-4 md:py-5 rounded-xl md:rounded-[1.5rem] font-black flex items-center justify-center gap-3 md:gap-4 transition-all tracking-tight text-sm md:text-base uppercase ${
                  analysis.status === AnalysisStatus.ANALYZING
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] hover:bg-[100%_0] text-white hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-600/30'
                }`}
              >
                {analysis.status === AnalysisStatus.ANALYZING ? (
                  <>
                    <div className="w-4 h-4 md:w-5 md:h-5 border-[2px] md:border-[3px] border-slate-600 border-t-white rounded-full animate-spin"></div>
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
        <section className="mb-20 md:mb-32 animate-fade-in">
          <div className="max-w-5xl mx-auto relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-[2rem] md:rounded-[3.5rem] blur-2xl opacity-10 group-hover:opacity-25 transition duration-1000"></div>
            <div className="relative glass-card p-2 md:p-3 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border-slate-700/50 shadow-2xl">
               {/* Neural Stamp Overlay */}
               <div className="absolute top-4 md:top-10 right-4 md:right-10 z-30 pointer-events-none animate-fade-in">
                <div className="bg-black/40 backdrop-blur-md px-3 md:px-6 py-1.5 md:py-3 rounded-xl md:rounded-2xl border border-white/10 flex flex-col items-end shadow-2xl">
                  <span className="text-[6px] md:text-[8px] font-black text-blue-400 uppercase tracking-[0.3em] mb-0.5 md:mb-1">Neural Stamp</span>
                  <span className="text-[10px] md:text-xs font-mono font-black text-white tracking-widest">{getNeuralStamp()}</span>
                </div>
              </div>

               <video 
                ref={videoPlayerRef}
                src={videoUrl} 
                className="w-full h-auto rounded-[1.8rem] md:rounded-[2.8rem] bg-black shadow-2xl ring-1 ring-white/10"
                controls
                playsInline
              />
              {previewRange && (
                <div className="mt-4 md:mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-8 py-4 md:py-5 bg-blue-600/5 rounded-2xl md:rounded-3xl border border-blue-500/10">
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
                    <span className="text-[10px] md:text-[12px] font-black text-blue-400 uppercase tracking-[0.2em]">Neural Loop Active</span>
                    <span className="text-xs md:text-sm font-black font-mono bg-slate-950 px-3 md:px-5 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-slate-800 text-white shadow-inner">
                      {formatTime(previewRange.start)} — {formatTime(previewRange.end)}
                    </span>
                  </div>
                  <button 
                    onClick={() => setPreviewRange(null)}
                    className="w-full md:w-auto text-[9px] md:text-[10px] font-black text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2 md:gap-3 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-lg md:rounded-xl border border-slate-800"
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
        <div className="text-center py-16 md:py-32 animate-fade-in relative">
          <div className="w-24 h-24 md:w-36 md:h-36 mx-auto mb-8 md:mb-12 relative">
            <div className="absolute inset-0 rounded-full border-[6px] md:border-[10px] border-blue-500/5 border-t-blue-500 animate-spin"></div>
            <div className="absolute inset-4 md:inset-6 rounded-full border-[6px] md:border-[10px] border-indigo-500/5 border-b-indigo-500 animate-spin-reverse" style={{animationDuration: '3s'}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <i className="fas fa-brain text-3xl md:text-5xl text-white pulse-ring opacity-80"></i>
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 md:mb-6 text-white tracking-tight uppercase">Strategic Assembly</h2>
          <p className="text-slate-500 text-base md:text-xl font-medium max-w-xl mx-auto leading-relaxed italic px-4">"{loadingMessages[loadingMsgIdx]}"</p>
        </div>
      )}

      {analysis.status === AnalysisStatus.COMPLETED && analysis.result && (
        <section className="animate-fade-in pb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 mb-10 md:mb-12 px-2 md:px-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-3 md:mb-4 text-white tracking-tight leading-tight uppercase">Elite Viral Pack</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] md:text-xs">Extraction Logic: <span className="text-blue-400">{targetingMode} Growth</span></p>
            </div>
            <div className="flex items-center gap-4 md:gap-5">
              <div className="px-4 md:px-6 py-2 md:py-3 bg-slate-900/50 border border-slate-800 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {analysis.result.clips.length} H.264 CANDIDATES <span className="text-slate-600 mx-2">|</span> 2027 OPTIMIZED
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {analysis.result.clips.map((segment, idx) => (
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
            onClick={() => {
              setAnalysis({ status: AnalysisStatus.IDLE });
              startAnalysis();
            }}
            className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {analysis.status === AnalysisStatus.IDLE && !videoFile && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-10 md:mt-20 pb-20 md:pb-32">
          {[
            {icon: 'fa-microchip', color: 'text-blue-500', title: 'H.264 Neural Engine', desc: 'Advanced frame evaluation for high-profile MP4 delivery.'},
            {icon: 'fa-chart-line', color: 'text-indigo-500', title: '2027 Viral Propensity', desc: 'Predictive modeling based on upcoming platform retention standards.'},
            {icon: 'fa-wand-sparkles', color: 'text-purple-500', title: 'Automated Meta', desc: 'Instant scroll-stopping captions optimized for AAC audio-visual flow.'}
          ].map((f, i) => (
            <div key={i} className="glass-card p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border-slate-800/40 hover:bg-white/5 transition-all group shadow-xl">
              <div className={`${f.color} mb-6 md:mb-8 transition-transform group-hover:scale-110 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]`}><i className={`fas ${f.icon} text-4xl md:text-5xl`}></i></div>
              <h4 className="font-black text-xl md:text-2xl mb-4 md:mb-5 text-white tracking-tight uppercase">{f.title}</h4>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed font-medium">{f.desc}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
