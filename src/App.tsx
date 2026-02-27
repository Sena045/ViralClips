
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnalysisStatus } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MyClips from './pages/MyClips';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import Privacy from './pages/Privacy';
import BusinessModel from './pages/BusinessModel';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { initiateUpgrade } from './services/razorpayService';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const { user, token, logout, isLoading, refreshUser } = useAuth();
  const [showPricing, setShowPricing] = useState<boolean>(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const location = useLocation();

  const handleUpgrade = async (plan: 'pro' | 'agency') => {
    if (!token || !user) {
      showNotification("Please sign in to upgrade your plan.", "error");
      return;
    }
    
    await initiateUpgrade(plan, token, async (newCredits) => {
      await refreshUser();
      setShowPricing(false);
      showNotification(`Successfully upgraded to ${plan.toUpperCase()}! Your new balance is ${newCredits} credits.`, "success");
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Authenticating Neural Link...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPassword />} />
      
      <Route 
        path="*" 
        element={
          <Layout 
            userCredits={user?.credits || 0} 
            userPlan={user?.plan || 'free'}
            userId={user?.email || 'Guest'}
            onShowPricing={() => setShowPricing(true)}
            onLogout={logout}
          >
            {/* Toast Notifications */}
            {toast && (
              <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-3xl border shadow-2xl backdrop-blur-2xl animate-fade-in flex items-center gap-4 ${
                toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-triangle-exclamation'} text-lg`}></i>
                <span className="text-sm font-black uppercase tracking-wider">{toast.message}</span>
              </div>
            )}

            {/* Pricing Modal Overlay (Global) */}
            {showPricing && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/80 backdrop-blur-xl animate-fade-in">
                <div className="glass-card max-w-4xl w-full p-16 rounded-[4rem] relative overflow-hidden border-blue-500/30">
                  <button 
                    onClick={() => setShowPricing(false)}
                    className="absolute top-10 right-10 text-slate-500 hover:text-white text-2xl"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  
                  <div className="text-center mb-16">
                    <h2 className="text-5xl font-black text-white mb-4 tracking-tight uppercase">Scale Your Content</h2>
                    <p className="text-slate-400 text-lg font-medium">Choose a plan to unlock elite neural processing.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="p-10 rounded-[3rem] bg-slate-900/50 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Free Tier</h4>
                        <div className="text-4xl font-black text-white mb-8">$0<span className="text-lg text-slate-500 font-medium">/mo</span></div>
                        <ul className="space-y-4 mb-10">
                          <li className="flex items-center gap-3 text-slate-400 text-sm font-medium"><i className="fas fa-check text-blue-500"></i> 3 Free Credits</li>
                          <li className="flex items-center gap-3 text-slate-400 text-sm font-medium"><i className="fas fa-check text-blue-500"></i> Max 5min Videos</li>
                          <li className="flex items-center gap-3 text-slate-400 text-sm font-medium"><i className="fas fa-check text-blue-500"></i> Standard Queue</li>
                        </ul>
                      </div>
                      <button className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-xs cursor-not-allowed">Current Plan</button>
                    </div>

                    <div className="p-10 rounded-[3rem] bg-blue-600 border border-blue-500 shadow-2xl shadow-blue-600/30 flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-6 right-6 bg-white text-blue-600 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Most Popular</div>
                      <div>
                        <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Pro Creator</h4>
                        <div className="text-4xl font-black text-white mb-8">$29<span className="text-lg text-blue-200 font-medium">/mo</span></div>
                        <ul className="space-y-4 mb-10">
                          <li className="flex items-center gap-3 text-blue-50 text-sm font-medium"><i className="fas fa-check text-white"></i> 50 Credits / mo</li>
                          <li className="flex items-center gap-3 text-blue-50 text-sm font-medium"><i className="fas fa-check text-white"></i> Max 45min Videos</li>
                          <li className="flex items-center gap-3 text-blue-50 text-sm font-medium"><i className="fas fa-check text-white"></i> Priority Neural Queue</li>
                          <li className="flex items-center gap-3 text-blue-50 text-sm font-medium"><i className="fas fa-check text-white"></i> H.264 High-Bitrate Export</li>
                        </ul>
                      </div>
                      <button 
                        onClick={() => handleUpgrade('pro')}
                        className="w-full py-4 rounded-2xl bg-white text-blue-600 font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Routes>
              <Route 
                path="/" 
                element={
                  <Dashboard 
                    userCredits={user?.credits || 0} 
                    userPlan={user?.plan || 'free'}
                    onUpdateCredits={refreshUser}
                    onShowPricing={() => setShowPricing(true)}
                    showNotification={showNotification}
                  />
                } 
              />
              <Route path="/clips" element={<MyClips />} />
              <Route path="/pricing" element={<Pricing onUpgrade={handleUpgrade} />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/refund" element={<Refund />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/business-model" element={<BusinessModel />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
