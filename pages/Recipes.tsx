import React, { useEffect, useState } from 'react';
import { dbService } from '../services/mockSupabase';
import { Recipe } from '../types';
import { Plus, MoreHorizontal } from 'lucide-react';

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const data = await dbService.getRecipes();
      setRecipes(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleAddToQueue = async (recipe: Recipe) => {
    await dbService.addToQueue({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        image_path: recipe.image_url,
        platform: 'Pinterest',
        pin_title: recipe.title,
        pin_description: `Découvrez ce délicieux ${recipe.title}. Recette complète à l'intérieur !`,
        board_slug: 'general', // Simplified default logic
        destination_url: `https://nutrizen.app/r/${recipe.id}`
    });
    alert(`Ajouté ${recipe.title} à la file d'attente !`);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recettes</h1>
          <p className="text-slate-500">Importées depuis votre base de données NutriZen principale.</p>
        </div>
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Importer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recipes.map(recipe => (
            <div key={recipe.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                    <img src={recipe.image_url} alt={recipe.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-2 right-2">
                        <span className="bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-semibold px-2 py-1 rounded shadow-sm">
                            {recipe.cuisine_type}
                        </span>
                    </div>
                </div>
                <div className="p-4">
                    <h3 className="font-semibold text-slate-900 line-clamp-1" title={recipe.title}>{recipe.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-2 mb-4">
                        {recipe.badges.slice(0, 3).map(badge => (
                            <span key={badge} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                {badge}
                            </span>
                        ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className="text-xs text-slate-400">{recipe.ingredients_count} ingrédients</span>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => handleAddToQueue(recipe)}
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded transition-colors"
                             >
                                Créer Pin
                             </button>
                             <button className="text-slate-400 hover:text-slate-600">
                                <MoreHorizontal className="w-5 h-5" />
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;