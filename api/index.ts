import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import cors from "cors";
import * as dotenv from "dotenv";
import jwt from "jsonwebtoken";
import * as admin from "firebase-admin";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "elite-shorts-secret-key-2024";

// Initialize Firebase Admin
let db: admin.firestore.Firestore | null = null;
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      console.log("Firebase Admin initialized successfully.");
    }
    db = admin.firestore();
  } else {
    console.warn("Firebase environment variables missing. Falling back to in-memory storage.");
  }
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error);
}

// Types
interface User {
  id: string;
  email: string;
  passwordHash: string;
  plan: 'free' | 'pro' | 'agency';
  credits: number;
  createdAt: number;
}
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
const resultCacheFallback = new Map<string, any>();
const usersFallback = new Map<string, User>();
const DEFAULT_FREE_CREDITS = 10;

async function getCachedResult(hash: string): Promise<any | null> {
  if (db) {
    const cacheDoc = await db.collection('cache').doc(hash).get();
    return cacheDoc.exists ? cacheDoc.data()?.result : null;
  }
  return resultCacheFallback.get(hash) || null;
}

async function saveToCache(hash: string, result: any): Promise<void> {
  if (db) {
    await db.collection('cache').doc(hash).set({ result, createdAt: Date.now() });
  } else {
    resultCacheFallback.set(hash, result);
  }
}

async function getUser(userId: string): Promise<User | null> {
  if (db) {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.exists ? (userDoc.data() as User) : null;
  }
  return usersFallback.get(userId) || null;
}

async function saveUser(user: User): Promise<void> {
  if (db) {
    await db.collection('users').doc(user.id).set(user);
  } else {
    usersFallback.set(user.id, user);
  }
}

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split(" ")[1];
  try {
    if (db) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      (req as any).userId = decodedToken.uid;
      (req as any).email = decodedToken.email;
      next();
    } else {
      if (idToken.startsWith("eyJhbGciOiJSUzI1NiI")) {
        const decoded = jwt.decode(idToken) as any;
        if (decoded && decoded.sub) {
          (req as any).userId = decoded.sub;
          (req as any).email = decoded.email;
          next();
          return;
        }
        throw new Error("Invalid Firebase token format.");
      }
      const decoded = jwt.verify(idToken, JWT_SECRET) as { userId: string };
      (req as any).userId = decoded.userId;
      next();
    }
  } catch (error: any) {
    res.status(401).json({ error: "Authentication Failed", details: error.message });
  }
};

function getVideoHash(name: string, size: number): string {
  return `${name}-${size}`;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.get("/api/user/profile", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const email = (req as any).email;
  let user = await getUser(userId);
  if (!user && email) {
    user = { id: userId, email, passwordHash: "", plan: 'free', credits: DEFAULT_FREE_CREDITS, createdAt: Date.now() };
    await saveUser(user);
  }
  if (user && user.plan === 'free' && user.credits === 0) {
    user.credits = DEFAULT_FREE_CREDITS;
    await saveUser(user);
  }
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: userId, email: user.email, credits: user.credits, plan: user.plan });
});

app.post("/api/jobs/upload-url", authenticate, async (req, res) => {
  const userId = (req as any).userId;
  const user = await getUser(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { fileName, fileSize } = req.body;
  const videoHash = getVideoHash(fileName, fileSize);
  const cachedResult = await getCachedResult(videoHash);
  if (cachedResult) {
    const jobId = uuidv4();
    const job: Job = { id: jobId, status: 'COMPLETED', videoName: fileName, videoSize: fileSize, result: cachedResult, createdAt: Date.now() };
    jobs.set(jobId, job);
    return res.json({ jobId, isCached: true, creditsRemaining: user.credits, message: "Instant analysis: Result found in neural cache (0 credits used)." });
  }
  if (user.credits <= 0) return res.status(403).json({ error: "Insufficient credits", code: "OUT_OF_CREDITS" });
  const jobId = uuidv4();
  const job: Job = { id: jobId, status: 'PENDING', videoName: fileName, videoSize: fileSize, createdAt: Date.now() };
  jobs.set(jobId, job);
  user.credits -= 1;
  await saveUser(user);
  res.json({ jobId, uploadUrl: `/api/mock-upload/${jobId}`, isCached: false, creditsRemaining: user.credits });
});

app.put("/api/mock-upload/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  job.status = 'UPLOADING';
  req.on('data', () => {}); 
  req.on('end', () => {
    job.status = 'PROCESSING';
    res.status(200).send();
  });
});

app.get("/api/jobs/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

app.post("/api/jobs/:jobId/complete", (req, res) => {
  const { jobId } = req.params;
  const { result } = req.body;
  const job = jobs.get(jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  job.status = 'COMPLETED';
  job.result = result;
  saveToCache(getVideoHash(job.videoName, job.videoSize), job.result);
  res.json({ success: true });
});

app.post("/api/user/upgrade", authenticate, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const email = (req as any).email;
    const { plan } = req.body;
    let user = await getUser(userId);
    if (!user && email) {
      user = { id: userId, email, passwordHash: "", plan: 'free', credits: DEFAULT_FREE_CREDITS, createdAt: Date.now() };
      await saveUser(user);
    }
    if (!user) return res.status(404).json({ error: "User profile not found" });
    const creditsToAdd = plan === 'pro' ? 50 : 250;
    user.credits += creditsToAdd;
    user.plan = plan;
    await saveUser(user);
    res.json({ success: true, credits: user.credits, plan: plan });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

export default app;
