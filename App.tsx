import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import Recipes from './pages/Recipes';
import BoardMapping from './pages/BoardMapping';
import Settings from './pages/Settings';
import PinterestCallback from './pages/PinterestCallback';
import { ToastProvider } from './components/Toast';
import { useAppStore } from './store/useAppStore';
import { supabase } from './services/supabaseClient';
import { Loader2 } from 'lucide-react';

const { HashRouter, Routes, Route, Navigate, useLocation } = ReactRouterDOM;

// Auth Wrapper
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    // For demo purposes, if no session, we show a simple login prompt or redirect
    // In a real app, redirect to /login
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Accès Admin Requis</h2>
            <p className="text-slate-500 mb-6">Veuillez vous connecter pour accéder au tableau de bord d'automatisation.</p>
            <button 
                onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} // Or email/pass
                className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
                Se connecter (Demo: utilise Supabase Auth)
            </button>
            <div className="mt-4 text-xs text-slate-400">
                Note: Assurez-vous d'avoir configuré Supabase Auth.
            </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const fetchInitialData = useAppStore(state => state.fetchInitialData);
  const location = useLocation();

  useEffect(() => {
    // Only fetch data if we are authenticated (handled by wrapper usually, 
    // but good to ensure we don't fetch on public pages if any)
    fetchInitialData();
  }, [fetchInitialData]);

  // Exclude callback from layout sometimes? No, layout is fine.
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/boards" element={<BoardMapping />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin/automation/pinterest/callback" element={<PinterestCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <RequireAuth>
          <AppContent />
        </RequireAuth>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;