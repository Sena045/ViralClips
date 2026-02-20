
export interface ViralSegment {
  start: number;
  end: number;
  hook: string;
  mp4_caption: string;
  filename_suggestion: string;
  first_frame_text: string;
  music_suggestion: string;
  score: number;
  reasoning: string;
  duration: number;
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
  segments: ViralSegment[];
  error?: string;
}
