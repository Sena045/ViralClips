import express from "express";
import { createServer as createViteServer } from "vite";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config();

// Types for our SaaS Job System
interface Job {
  id: string;
  status: 'PENDING' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  videoName: string;
  videoSize: number;
  result?: any;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, Job>();
// Simple Result Cache: Map<FileHash, AnalysisResult>
const resultCache = new Map<string, any>();

// Simulated Database for SaaS Credits
const userCredits = new Map<string, number>();
const userPlans = new Map<string, 'free' | 'pro' | 'agency'>();
const DEFAULT_FREE_CREDITS = 3;

/**
 * Helper to generate a simple hash for a video
 */
function getVideoHash(name: string, size: number): string {
  return `${name}-${size}`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // --- SaaS API ROUTES ---

  /**
   * 0. Get User Profile (Credits)
   */
  app.get("/api/user/profile", (req, res) => {
    const userId = "demo-user"; 
    if (!userCredits.has(userId)) {
      userCredits.set(userId, DEFAULT_FREE_CREDITS);
      userPlans.set(userId, 'free');
    }
    res.json({
      id: userId,
      credits: userCredits.get(userId),
      plan: userPlans.get(userId)
    });
  });

  /**
   * 1. Request a Presigned URL for Upload
   */
  app.post("/api/jobs/upload-url", (req, res) => {
    const userId = "demo-user";
    if (!userCredits.has(userId)) {
      userCredits.set(userId, DEFAULT_FREE_CREDITS);
    }
    
    const { fileName, fileSize } = req.body;
    const videoHash = getVideoHash(fileName, fileSize);
    
    // CHECK CACHE FIRST
    if (resultCache.has(videoHash)) {
      const jobId = uuidv4();
      const cachedResult = resultCache.get(videoHash);
      
      const job: Job = {
        id: jobId,
        status: 'COMPLETED',
        videoName: fileName,
        videoSize: fileSize,
        result: cachedResult,
        createdAt: Date.now()
      };
      
      jobs.set(jobId, job);
      
      return res.json({
        jobId,
        isCached: true,
        creditsRemaining: userCredits.get(userId),
        message: "Instant analysis: Result found in neural cache (0 credits used)."
      });
    }

    // NO CACHE - CHECK CREDITS
    const currentCredits = userCredits.get(userId) || 0;
    if (currentCredits <= 0) {
      return res.status(403).json({ 
        error: "Insufficient credits", 
        code: "OUT_OF_CREDITS" 
      });
    }

    const jobId = uuidv4();
    const job: Job = {
      id: jobId,
      status: 'PENDING',
      videoName: fileName,
      videoSize: fileSize,
      createdAt: Date.now()
    };
    
    jobs.set(jobId, job);
    userCredits.set(userId, currentCredits - 1);

    const uploadUrl = `/api/mock-upload/${jobId}`;
    
    res.json({
      jobId,
      uploadUrl,
      isCached: false,
      creditsRemaining: userCredits.get(userId)
    });
  });

  /**
   * 2. Mock Upload Endpoint
   * Simulates the direct-to-S3 upload.
   */
  app.put("/api/mock-upload/:jobId", (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    
    if (!job) return res.status(404).json({ error: "Job not found" });
    
    job.status = 'UPLOADING';
    
    // Consume the stream to avoid connection reset issues with large files
    req.on('data', () => {}); 
    req.on('end', () => {
      job.status = 'PROCESSING';
      res.status(200).send();
    });
  });

  /**
   * 3. Get Job Status
   */
  app.get("/api/jobs/:jobId", (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);
    
    if (!job) return res.status(404).json({ error: "Job not found" });
    
    res.json(job);
  });

  /**
   * 4. Update Job Result (from client)
   */
  app.post("/api/jobs/:jobId/complete", (req, res) => {
    const { jobId } = req.params;
    const { result } = req.body;
    const job = jobs.get(jobId);
    
    if (!job) return res.status(404).json({ error: "Job not found" });
    
    job.status = 'COMPLETED';
    job.result = result;
    
    // STORE IN CACHE
    const videoHash = getVideoHash(job.videoName, job.videoSize);
    resultCache.set(videoHash, job.result);
    
    res.json({ success: true });
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  // Upgrade credits after payment
app.post("/api/user/upgrade", (req, res) => {
  const userId = "demo-user";
  const { plan } = req.body;
  const creditsToAdd = plan === 'pro' ? 50 : 250;
  
  const currentCredits = userCredits.get(userId) || 0;
  const newCredits = currentCredits + creditsToAdd;
  userCredits.set(userId, newCredits);
  userPlans.set(userId, plan);
  
  res.json({ 
    success: true, 
    credits: newCredits,
    plan: plan,
    message: `Successfully upgraded to ${plan.toUpperCase()}! ${creditsToAdd} credits added.`
  });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`SaaS Backend running at http://localhost:${PORT}`);
  });
}

startServer();
