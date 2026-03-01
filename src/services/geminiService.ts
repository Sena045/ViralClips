import { GoogleGenAI, Type } from "@google/genai";
import { ViralSegment } from "../types";

export const analyzeVideoMetadata = async (fileName: string, fileSize: number, duration: number): Promise<{ clips: ViralSegment[], summary: string, best_overall_hook: string }> => {
  console.log("GeminiService: Starting analysis for", fileName, "Duration:", duration);
  
  const apiKey = (process.env.GEMINI_API_KEY as string);
  if (!apiKey) {
    console.error("GeminiService: GEMINI_API_KEY is missing!");
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `Analyze this video metadata for a viral clipping SaaS. 
  Video Name: ${fileName}
  Size: ${fileSize} bytes
  Duration: ${duration.toFixed(2)} seconds
  
  Generate viral clip timestamps (start/end) and hooks. 
  IMPORTANT: 
  1. All segments MUST be within the video duration (0 to ${duration.toFixed(2)}s).
  2. If the video is short (under 60s), generate 2-3 high-quality segments.
  3. If the video is long, generate up to 8 segments.
  4. Segments should be at least 5 seconds long.
  5. Return as JSON.
  6. Be creative with hooks and captions based on the filename.`;

  console.log("GeminiService: Sending request to Gemini...");
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  start_time_seconds: { type: Type.NUMBER },
                  end_time_seconds: { type: Type.NUMBER },
                  duration_seconds: { type: Type.NUMBER },
                  virality_score: { type: Type.NUMBER },
                  hook_title: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  social_caption: { type: Type.STRING },
                  first_frame_overlay: { type: Type.STRING },
                  seo_slug: { type: Type.STRING },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["id", "start_time_seconds", "end_time_seconds", "duration_seconds", "virality_score", "hook_title", "reason", "social_caption", "first_frame_overlay", "seo_slug", "tags"]
              }
            },
            summary: { type: Type.STRING },
            best_overall_hook: { type: Type.STRING }
          },
          required: ["clips", "summary", "best_overall_hook"]
        }
      }
    });

    const text = response.text;
    console.log("GeminiService: Received response from Gemini");
    
    if (!text) {
      console.error("GeminiService: Empty response text");
      throw new Error("Neural Engine returned an empty response.");
    }

    try {
      const parsed = JSON.parse(text);
      console.log("GeminiService: Successfully parsed JSON. Clips found:", parsed.clips?.length);
      return parsed;
    } catch (e) {
      console.error("GeminiService: Failed to parse AI response:", text);
      throw new Error("Neural Engine output was malformed.");
    }
  } catch (error: any) {
    console.error("GeminiService: API Call failed:", error);
    throw error;
  }
};
