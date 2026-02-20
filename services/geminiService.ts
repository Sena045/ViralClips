
import { GoogleGenAI } from "@google/genai";
import { ViralSegment, TargetingMode } from "../types";

export class GeminiService {
  private ai: any;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  public async analyzeVideo(
    videoFile: File, 
    language: string, 
    targetingMode: TargetingMode,
    highlightMode: boolean
  ): Promise<ViralSegment[]> {
    const base64Data = await this.fileToBase64(videoFile);
    
    const prompt = `You are the world's best viral shorts strategist for TikTok, YouTube Shorts, and Instagram Reels in 2026. You are an expert Shorts/Reels editor who knows exactly how to make MP4 clips perform best.

Analyze the uploaded video for a ${language} speaking audience.

Your ONLY output must be a valid JSON array with EXACTLY 8 objects — nothing else, no explanations, no markdown, no code fences, no apologies.

IMPORTANT: The final output will be exported as an MP4 with H.264 video and AAC audio. Ensure all text metadata (hooks, captions, first_frame_text) is optimized for high-retention on mobile devices using these standards.

Prioritize clips with:
- Extremely strong hook in first 3 seconds
- High emotional intensity (funny, shocking, relatable, inspiring, rage, awe)
- Instant shareability (people tag friends, save, duet)
- Retention hooks (curiosity, value, story twist, visual/audio energy)

For each of the 8 viral segments, generate MP4-ready metadata that maximizes play rate and share rate.

Return ONLY these exact fields for each object:
- "start": number (exact start time in seconds, e.g. 12.5)
- "end": number (exact end time in seconds, duration must be 30–45 seconds)
- "hook": string (5–10 word ultra-catchy title for the short)
- "mp4_caption": string (perfect ready-to-post caption: strong hook, 3–6 emojis, 1–3 trending hashtags, powerful CTA)
- "filename_suggestion": string (clean SEO-friendly MP4 filename: no spaces, keywords included)
- "first_frame_text": string (short bold text to overlay on first frame: 4–8 words max, curiosity/shock value)
- "music_suggestion": string (style of trending royalty-free music that fits, e.g. "Viral TikTok Phonk 2026")
- "score": number (virality score 1–10 — be brutally honest)
- "reasoning": string (1-2 sentences explaining the algorithm fit)
- "duration": number (end - start in seconds)

Strict rules:
- Return ONLY the JSON array.
- If video is unanalyzable, return [].
- Targeting Mode: ${targetingMode}
- Highlight Mode: ${highlightMode ? 'ENABLED' : 'DISABLED'}

Begin analysis immediately.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: videoFile.type,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '[]';
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const segments: ViralSegment[] = JSON.parse(cleanedText);
      
      if (!Array.isArray(segments)) {
        throw new Error("Invalid response format: expected an array.");
      }
      
      return segments;
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      throw new Error(error.message || "Failed to analyze video.");
    }
  }
}
