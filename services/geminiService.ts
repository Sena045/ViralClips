
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
    
    const prompt = `You are the world's most elite viral shorts strategist. You specialize in H.264 video and AAC audio delivery formats for 2026 platforms (TikTok, Reels, YouTube Shorts).

Analyze the uploaded video for a ${language} audience.

Your task: Identify EXACTLY 8 viral segments. Each must be 30-45 seconds long.

IMPORTANT: The output will be exported as MP4 (H.264/AAC). Your captions and hook metadata must "look good" when viewed on mobile screens with these codecs. Use high-impact language, emotional hooks, and clear value propositions.

Return ONLY a valid JSON array of 8 objects. No markdown. No text outside the JSON.

Fields required for each segment:
- "start": number (exact start time in seconds)
- "end": number (exact end time in seconds, duration 30-45s)
- "hook": string (5-10 word high-velocity title)
- "mp4_caption": string (complete ready-to-post caption with emojis, tags, and CTA)
- "filename_suggestion": string (SEO-optimized slug)
- "first_frame_text": string (short 4-8 word "scroll stopper" overlay text)
- "music_suggestion": string (2026 trending music style)
- "score": number (1-10 virality rating)
- "reasoning": string (1-2 sentences on why this segment fits the algorithm)
- "duration": number (end - start)

Strict Rules:
- Return ONLY JSON.
- If analysis fails, return [].
- Targeting: ${targetingMode}
- High-Emotion Peaks: ${highlightMode ? 'ENABLED' : 'DISABLED'}

Process now.`;

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
        throw new Error("Invalid neural response format.");
      }
      
      return segments;
    } catch (error: any) {
      console.error("Gemini analysis error:", error);
      throw new Error(error.message || "Neural extraction failed.");
    }
  }
}
