
import { GoogleGenAI } from "@google/genai";
import { ViralSegment, TargetingMode, AnalysisResult } from "../types";

export class GeminiService {
  private ai: any = null;

  private getClient() {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined. Please set it in your environment variables.");
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
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
  ): Promise<AnalysisResult> {
    const base64Data = await this.fileToBase64(videoFile);
    
    const prompt = `You are ViralClips AI, an elite 2026 shorts editor specialized in repurposing video content into high-velocity TikTok/Reels/Shorts clips. You understand current algorithms: prioritize strong hooks in first 3 seconds, emotional peaks, questions/curiosity gaps, fast pacing, relatability, controversy (mild), quotable lines, visual surprises, and self-contained segments that drive loops/re-watches.

Task: Analyze the provided video content. Extract EXACTLY 8 high-potential clips (30-45 seconds each) optimized for maximum retention and virality.

Key Evaluation Criteria (score each clip internally 0-100 for virality propensity):
- Hook strength (first 3-5s must grab instantly)
- Emotional/engagement peaks (shock, laugh, "aha", drama, relatability)
- Pacing & energy (quick cuts potential, no slow exposition)
- Self-contained value (works without full video context)
- 2026 trends: authenticity/raw moments > polish, niche resonance or broad appeal, text-overlay friendly, loop potential
- Platform fit: vertical framing cues, face/upper-body focus, audio-visual sync for H.264 exports

Strategic Mode: ${targetingMode.toUpperCase()}
- TRENDING: Broad appeal, meme-ability, universal hooks, trending phrasing
- NICHE: Deep community resonance, insider knowledge, cult engagement
- BOTH: Balanced hybrid

Language: ${language}
High-Emotion Peaks: ${highlightMode ? 'PRIORITIZE' : 'STANDARD'}

Output STRICT JSON (no markdown, no preamble):
{
  "clips": [
    {
      "id": 1,
      "start_time_seconds": number,
      "end_time_seconds": number,
      "duration_seconds": number,
      "virality_score": number,
      "reason": "string",
      "hook_title": "string",
      "social_caption": "string",
      "first_frame_overlay": "string",
      "seo_slug": "string",
      "tags": ["string"],
      "music_suggestion": "string"
    }
  ],
  "summary": "string",
  "best_overall_hook": "string"
}

Prioritize diversity: mix hook styles (question, bold claim, visual tease, story snippet, tip list, controversy, reaction). Ensure timestamps are precise. Segments must be contiguous and non-overlapping where ideal.`;

    try {
      const ai = this.getClient();
      const response = await ai.models.generateContent({
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
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });

      const text = response.text || '{}';
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const result: AnalysisResult = JSON.parse(cleanedText);
      
      if (!result.clips || !Array.isArray(result.clips)) {
        throw new Error("Invalid neural response format: missing clips array.");
      }
      
      return result;
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      throw new Error(error.message || "Neural extraction failed.");
    }
  }
}
