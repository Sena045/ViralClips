import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  signInWithPopup,
  User as FirebaseUser
} from "firebase/auth";
import { auth, googleProvider } from '../services/firebase';

interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'agency';
  credits: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    console.log("AuthContext: Initiating logout...");
    try {
      if (auth) {
        await signOut(auth);
        console.log("AuthContext: Firebase signOut successful.");
      }
    } catch (error) {
      console.error("AuthContext: Firebase signOut failed:", error);
    } finally {
      // Always clear local state regardless of Firebase signOut success
      setToken(null);
      setUser(null);
      setIsLoading(false);
      localStorage.removeItem('viralclips_demo_token');
      console.log("AuthContext: Local state cleared.");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!auth) {
      // Demo Mode Fallback
      const demoToken = localStorage.getItem('viralclips_demo_token');
      if (demoToken) {
        setToken(demoToken);
        setUser({ id: 'demo-user', email: 'demo@viralclips.ai', plan: 'free', credits: 10 });
      }
      setIsLoading(false);
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setIsLoading(false);
      return;
    }
    
    try {
      const idToken = await currentUser.getIdToken(true);
      setToken(idToken);
      
      const res = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      let data;
      try {
        data = await res.json();
      } catch (e) {
        console.error("Failed to parse profile response as JSON", e);
        data = { error: "Invalid server response" };
      }
      
      if (res.ok) {
        setUser(data);
      } else {
        console.error("Profile fetch failed:", data);
        // Fallback: We are authenticated via Firebase, but backend profile is missing or failing
        setUser({ 
          id: currentUser.uid, 
          email: currentUser.email || 'authenticated-user', 
          plan: 'free', 
          credits: 10 
        });
      }
    } catch (e) {
      console.error("Auth refresh failed", e);
      // Even on network error, we want to set a fallback user so the app doesn't think we are logged out
      setUser({ 
        id: currentUser.uid, 
        email: currentUser.email || 'authenticated-user', 
        plan: 'free', 
        credits: 10 
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("AuthContext: Initializing...", { authConfigured: !!auth });
    if (!auth) {
      refreshUser();
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("AuthContext: Firebase user detected", firebaseUser.email);
        await refreshUser();
      } else {
        console.log("AuthContext: No Firebase user detected, clearing state.");
        setUser(null);
        setToken(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [refreshUser]);

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      // Mock Login
      setToken('demo-token');
      setUser({ id: 'demo-user', email, plan: 'free', credits: 10 });
      localStorage.setItem('viralclips_demo_token', 'demo-token');
      return;
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string) => {
    if (!auth) {
      // Mock Register
      setToken('demo-token');
      setUser({ id: 'demo-user', email, plan: 'free', credits: 10 });
      localStorage.setItem('viralclips_demo_token', 'demo-token');
      return;
    }
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      alert("Firebase is not fully configured. Please ensure you have added all VITE_FIREBASE_* secrets in the Secrets panel and restarted the dev server.");
      return;
    }
    await signInWithPopup(auth, googleProvider);
  };

  const forgotPassword = async (email: string) => {
    if (!auth) {
      alert("Firebase is not fully configured. Please ensure you have added all VITE_FIREBASE_* secrets in the Secrets panel and restarted the dev server.");
      return;
    }
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loginWithEmail, 
      registerWithEmail, 
      loginWithGoogle, 
      forgotPassword, 
      logout, 
      isLoading, 
      refreshUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
