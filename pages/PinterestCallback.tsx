import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useToast } from '../components/Toast';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../services/supabaseClient';

const PinterestCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'stub'>('loading');
  const [message, setMessage] = useState('Authentification auprès de Pinterest en cours...');
  const { addToast } = useToast();
  const navigate = ReactRouterDOM.useNavigate();
  const { fetchInitialData } = useAppStore();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code || !state) {
        setStatus('error');
        setMessage('Paramètres manquants dans la réponse Pinterest.');
        return;
      }

      try {
        const { error } = await supabase.functions.invoke('pinterest-oauth-callback', {
          body: { code, state },
        });

        if (error) {
             const body = await error.context?.json().catch(() => ({}));
             if (body?.code === 'PINTEREST_NOT_CONFIGURED') {
                 setStatus('stub');
                 setMessage("Mode Stub: Les secrets Pinterest ne sont pas encore configurés sur le serveur.");
                 return;
             }
             throw error;
        }

        setStatus('success');
        setMessage('Pinterest connecté avec succès !');
        addToast('Connexion Pinterest réussie', 'success');
        
        // Refresh app state to show connected status
        await fetchInitialData();

        // Redirect after delay
        setTimeout(() => {
          navigate('/settings');
        }, 2000);

      } catch (err: any) {
        console.error('OAuth Error:', err);
        setStatus('error');
        setMessage(err.message || 'Erreur lors de l\'échange du token.');
        addToast('Échec de la connexion Pinterest', 'error');
      }
    };

    handleCallback();
  }, [addToast, navigate, fetchInitialData]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">Connexion en cours...</h2>
        </>
      )}
      {status === 'success' && (
        <>
          <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">Succès !</h2>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">Erreur</h2>
        </>
      )}
      {status === 'stub' && (
        <>
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-slate-800">Configuration Manquante</h2>
        </>
      )}
      <p className="text-slate-500 mt-2 max-w-md">{message}</p>
      
      {status !== 'loading' && (
        <button 
          onClick={() => navigate('/settings')}
          className="mt-6 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
        >
          Retour aux paramètres
        </button>
      )}
    </div>
  );
};

export default PinterestCallback;