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
      // 1. HashRouter URL Parsing Fix
      // URL is likely: https://domain/#/callback?code=...&state=...
      // window.location.search is usually empty in HashRouter
      
      let code = new URLSearchParams(window.location.search).get('code');
      let state = new URLSearchParams(window.location.search).get('state');

      // Fallback: Check hash params
      if (!code || !state) {
          const hash = window.location.hash;
          // Split hash by '?' to get query part
          if (hash.includes('?')) {
              const queryPart = hash.split('?')[1];
              const hashParams = new URLSearchParams(queryPart);
              code = code || hashParams.get('code');
              state = state || hashParams.get('state');
          }
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Paramètres manquants (code/state) dans la réponse.');
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