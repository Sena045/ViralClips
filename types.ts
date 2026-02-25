
export interface ViralSegment {
  id: number;
  start_time_seconds: number;
  end_time_seconds: number;
  duration_seconds: number;
  virality_score: number;
  reason: string;
  hook_title: string;
  social_caption: string;
  first_frame_overlay: string;
  seo_slug: string;
  tags: string[];
  // Keeping these for UI compatibility or mapping
  music_suggestion?: string; 
}

export interface AnalysisResult {
  clips: ViralSegment[];
  summary: string;
  best_overall_hook: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export type TargetingMode = 'Trending' | 'Niche' | 'Both';

export interface AnalysisState {
  status: AnalysisStatus;
  result?: AnalysisResult;
  error?: string;
}
