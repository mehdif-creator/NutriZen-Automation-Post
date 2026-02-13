import { create } from 'zustand';
import { Recipe, SocialQueueItem, PinterestBoardMap, AppSettings } from '../types';
import { api } from '../services/api'; // Switched to real API
import { pinService } from '../services/pinPublishingService';

interface AppState {
  // State
  recipes: Recipe[];
  queue: SocialQueueItem[];
  boards: PinterestBoardMap[];
  settings: AppSettings | null;
  loading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  
  // Recipe Actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'created_at'>) => Promise<void>;

  // Queue Actions
  addToQueue: (recipe: Recipe, platform?: string) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  updateQueueItem: (id: string, updates: Partial<SocialQueueItem>) => Promise<void>;
  retryPublishItem: (id: string) => Promise<void>;
  
  // Board Actions
  addBoard: (board: Omit<PinterestBoardMap, 'id'>) => Promise<void>;
  toggleBoardActive: (id: string, isActive: boolean) => Promise<void>;
  
  // Settings Actions
  saveSettings: (settings: AppSettings) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  recipes: [],
  queue: [],
  boards: [],
  settings: null,
  loading: false,

  fetchInitialData: async () => {
    set({ loading: true });
    try {
      const [recipes, queue, boards, settings] = await Promise.all([
        api.getRecipes(),
        api.getQueue(),
        api.getBoards(),
        api.getSettings()
      ]);
      set({ recipes, queue, boards, settings, loading: false });
    } catch (e) {
      console.error("Erreur chargement données:", e);
      // Fallback or empty state
      set({ loading: false });
    }
  },

  addRecipe: async (recipe) => {
    try {
        const newRecipe = await api.addRecipe(recipe);
        set(state => ({ recipes: [newRecipe, ...state.recipes] }));
    } catch (e) {
        console.error("Error adding recipe", e);
        throw e;
    }
  },

  addToQueue: async (recipe: Recipe, platform = 'Pinterest') => {
    try {
      // Find a default board or use 'general'
      const defaultBoard = get().boards.find(b => b.cuisine_key === recipe.cuisine_type)?.board_slug || 'general';
      
      const newItem = await api.addToQueue({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        image_path: recipe.image_url,
        asset_9x16_path: recipe.image_url, // Use image_url as default asset
        platform: platform as any,
        pin_title: recipe.title,
        pin_description: `Découvrez ce délicieux ${recipe.title}. Recette complète sur NutriZen !`,
        board_slug: defaultBoard,
        destination_url: `https://nutrizen.app/r/${recipe.id}`, // Mock destination
        status: 'rendered', // Ready for worker
        attempts: 0
      });
      
      set(state => ({ queue: [newItem, ...state.queue] }));
    } catch (e) {
      console.error("Erreur ajout file:", e);
      throw e;
    }
  },

  removeFromQueue: async (id: string) => {
    try {
      await api.removeFromQueue(id);
      set(state => ({ queue: state.queue.filter(i => i.id !== id) }));
    } catch (e) {
      console.error("Erreur suppression:", e);
      throw e;
    }
  },

  updateQueueItem: async (id, updates) => {
    try {
       // Optimistic update
       set(state => ({
         queue: state.queue.map(i => i.id === id ? { ...i, ...updates } : i)
       }));
       // Persistence
       await api.updateQueueItem(id, updates);
    } catch (e) {
        console.error("Erreur mise à jour item:", e);
        // Force refresh from server to ensure consistency on error
        const serverQueue = await api.getQueue();
        set({ queue: serverQueue });
        throw e;
    }
  },

  retryPublishItem: async (id) => {
      const item = get().queue.find(i => i.id === id);
      if (!item) return;

      // Optimistic update
      set(state => ({
         queue: state.queue.map(i => i.id === id ? { ...i, status: 'rendered', publish_error: undefined } : i)
      }));

      try {
          await api.updateQueueItem(id, { 
             status: 'rendered', 
             publish_error: null,
             attempts: 0,
             locked_at: null,
             scheduled_at: new Date().toISOString() // Now
          });
          // Note: We don't call pinService.publishPin here directly anymore because 
          // we want the Worker/Edge Function to pick it up, 
          // OR we use the "Force Publish" button in UI which calls the Edge Function directly.
      } catch (e: any) {
          console.error(e);
          throw e;
      }
  },

  addBoard: async (boardData) => {
    try {
      const newBoard = await api.addBoard(boardData);
      set(state => ({ boards: [...state.boards, newBoard] }));
    } catch (e) {
      console.error("Erreur ajout tableau:", e);
      throw e;
    }
  },

  toggleBoardActive: async (id, isActive) => {
    try {
      set(state => ({
        boards: state.boards.map(b => b.id === id ? { ...b, is_active: isActive } : b)
      }));
      await api.updateBoard(id, { is_active: isActive });
    } catch (e) {
      console.error("Erreur toggle board:", e);
    }
  },

  saveSettings: async (settings) => {
    try {
      const saved = await api.saveSettings(settings);
      set({ settings: saved });
    } catch (e) {
      console.error("Erreur sauvegarde settings:", e);
      throw e;
    }
  },
}));