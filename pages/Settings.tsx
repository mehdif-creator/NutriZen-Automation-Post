import React, { useState } from 'react';
import { Save, Eye, EyeOff, Database, Globe, BarChart2, Server, Lock } from 'lucide-react';

const Settings: React.FC = () => {
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const toggleSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p className="text-slate-500">Gérez vos clés API, intégrations et configurations globales.</p>
      </div>

      {/* General Settings */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-slate-500" />
            Général
          </h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fuseau Horaire</label>
              <select className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 px-3 border bg-white">
                <option value="Europe/Paris">Europe/Paris (UTC+01:00)</option>
                <option value="America/New_York">New York (UTC-05:00)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Langue de l'app</label>
              <select className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 px-3 border bg-white">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Supabase Settings */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            Supabase
          </h2>
          <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">Connecté</span>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL du Projet</label>
            <input 
              type="text" 
              defaultValue="https://xyzproject.supabase.co" 
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 px-3 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Clé API (Service Role)</label>
            <div className="relative">
              <input 
                type={showSecrets['supabase'] ? "text" : "password"} 
                defaultValue="eyJhGcioJiu..." 
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm py-2 px-3 border pr-10"
              />
              <button 
                onClick={() => toggleSecret('supabase')}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showSecrets['supabase'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">Utilisée pour les tâches de fond. Ne partagez jamais cette clé.</p>
          </div>
        </div>
      </section>

      {/* Pinterest Settings */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.399.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.173 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.62 0 12.017 0z"/>
            </svg>
            Pinterest API
          </h2>
          <button className="text-sm font-medium bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            Reconnecter OAuth
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">App ID</label>
              <input 
                type="text" 
                defaultValue="14567890" 
                className="w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm py-2 px-3 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">App Secret</label>
              <div className="relative">
                <input 
                  type={showSecrets['pinterest'] ? "text" : "password"} 
                  defaultValue="pinterest_secret_key" 
                  className="w-full rounded-lg border-slate-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm py-2 px-3 border pr-10"
                />
                <button 
                  onClick={() => toggleSecret('pinterest')}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showSecrets['pinterest'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Token d'accès (Lecture Seule)</label>
            <div className="flex gap-2">
                <input 
                type="text" 
                readOnly
                value="pina_..." 
                className="flex-1 rounded-lg border-slate-200 bg-slate-50 text-slate-500 shadow-sm sm:text-sm py-2 px-3 border"
                />
                 <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                    Valide
                 </span>
            </div>
          </div>
        </div>
      </section>

      {/* Cloudinary Settings */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            Stockage (Cloudinary)
          </h2>
        </div>
        <div className="p-6 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cloud Name</label>
                    <input type="text" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">API Key</label>
                    <input type="text" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">API Secret</label>
                    <input type="password" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 px-3 border" />
                </div>
             </div>
        </div>
      </section>

      {/* Analytics Settings */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-purple-600" />
            Tracking & Analytics
          </h2>
        </div>
        <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Google Analytics ID</label>
                    <input type="text" placeholder="G-XXXXXXXXXX" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm py-2 px-3 border" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">UTM Source (Défaut)</label>
                    <input type="text" defaultValue="pinterest" className="w-full rounded-lg border-slate-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm py-2 px-3 border" />
                </div>
            </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
            Annuler
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            <Save className="w-4 h-4" />
            Sauvegarder les modifications
        </button>
      </div>
    </div>
  );
};

export default Settings;