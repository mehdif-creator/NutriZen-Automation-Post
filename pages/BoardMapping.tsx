import React, { useEffect, useState } from 'react';
import { dbService } from '../services/mockSupabase';
import { PinterestBoardMap } from '../types';
import { Save, Plus, Map, Check } from 'lucide-react';

const BoardMapping: React.FC = () => {
  const [boards, setBoards] = useState<PinterestBoardMap[]>([]);
  
  useEffect(() => {
    const fetch = async () => {
      setBoards(await dbService.getBoards());
    };
    fetch();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setBoards(boards.map(b => b.id === id ? { ...b, is_active: !current } : b));
    await dbService.updateBoard(id, { is_active: !current });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Correspondance des Tableaux</h1>
        <p className="text-slate-500">Associez vos types de cuisine NutriZen à des tableaux Pinterest spécifiques pour la publication automatique.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2">
            <Map className="w-5 h-5 text-emerald-600" />
            Mappings Actifs
          </h2>
          <button className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 transition-colors">
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {boards.map((board) => (
            <div key={board.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Cuisine / Catégorie</label>
                  <div className="flex items-center gap-2">
                     <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-sm font-medium">
                        {board.cuisine_key}
                     </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-200 w-8 hidden sm:block"></div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tableau Pinterest Cible</label>
                    <div className="relative">
                      <select 
                        className="block w-full pl-3 pr-10 py-1.5 text-sm border-slate-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 rounded-md shadow-sm bg-slate-50"
                        defaultValue={board.board_slug}
                      >
                        <option value={board.board_slug}>{board.board_name} ({board.board_slug})</option>
                        {/* Mock other options */}
                        <option value="other">Sélectionner un autre tableau...</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 sm:pt-0 sm:pl-4 sm:border-l border-slate-100">
                <div className="flex items-center">
                    <button
                        onClick={() => toggleActive(board.id, board.is_active)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                            board.is_active ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                    >
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                board.is_active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                    <span className="ml-3 text-sm font-medium text-slate-700 w-16">
                        {board.is_active ? 'Actif' : 'Pause'}
                    </span>
                </div>
                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <Save className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <div className="flex gap-4">
            <div className="bg-blue-100 p-2 rounded-lg h-fit">
                <Check className="w-5 h-5 text-blue-600" />
            </div>
            <div>
                <h3 className="font-semibold text-blue-900">Comment ça marche</h3>
                <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                    Lorsqu'une nouvelle recette est publiée dans NutriZen, le système vérifie son <span className="font-mono text-xs bg-blue-100 px-1 py-0.5 rounded">type_cuisine</span>. 
                    Si cela correspond à une "Clé Cuisine" ci-dessus, il génère automatiquement un aperçu du pin et l'assigne au tableau Pinterest mappé. 
                    Le statut sera défini sur <span className="font-semibold">En attente</span> pour votre révision, ou <span className="font-semibold">Planifié</span> si le pilotage automatique est activé.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BoardMapping;