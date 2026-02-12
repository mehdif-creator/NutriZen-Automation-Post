import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Queue from './pages/Queue';
import Recipes from './pages/Recipes';
import BoardMapping from './pages/BoardMapping';
import Settings from './pages/Settings';

const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM;

const App: React.FC = () => {
  return (
    <HashRouter>
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
    </HashRouter>
  );
};

export default App;