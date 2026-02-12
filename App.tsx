import React, { useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import Recipes from './pages/Recipes';
import BoardMapping from './pages/BoardMapping';
import Settings from './pages/Settings';
import { ToastProvider } from './components/Toast';
import { useAppStore } from './store/useAppStore';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;

const AppContent: React.FC = () => {
  const fetchInitialData = useAppStore(state => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/queue" element={<Queue />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/boards" element={<BoardMapping />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </ToastProvider>
  );
};

export default App;