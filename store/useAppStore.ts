import { create } from 'zustand';
import { Recipe, SocialQueueItem, PinterestBoardMap, AppSettings, DashboardStats } from '../types';
import { dbService } from '../services/mockSupabase';

interface AppState {
  // State
  recipes: Recipe[];
  queue: SocialQueueItem[];
  boards: PinterestBoardMap[];
  settings: AppSettings | null;
  loading: boolean;
  
  // Actions
  fetchInitialData: () => Promise<void>;
  
  addToQueue: (recipe: Recipe, platform?: string) => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  updateQueueStatus: (id: string, status: SocialQueueItem['status']) => Promise<void>;
  
  addBoard: (board: Omit<PinterestBoardMap, 'id'>) => Promise<void>;
  toggleBoardActive: (id: string, isActive: boolean) => Promise<void>;
  
  saveSettings: (settings: AppSettings) => Promise<void>;
  
  // Computed (Selectors logic helper)
  getStats: () => DashboardStats;
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
        dbService.getRecipes(),
        dbService.getQueue(),
        dbService.getBoards(),
        dbService.getSettings()
      ]);
      set({ recipes, queue, boards, settings, loading: false });
    } catch (e) {
      console.error("Erreur chargement données:", e);
      set({ loading: false });
    }
  },

  addToQueue: async (recipe: Recipe, platform = 'Pinterest') => {
    try {
      // Find a default board or use 'General'
      const defaultBoard = get().boards.find(b => b.cuisine_key === recipe.cuisine_type)?.board_slug || 'general';
      
      const newItem = await dbService.addToQueue({
        recipe_id: recipe.id,
        recipe_title: recipe.title,
        image_path: recipe.image_url,
        platform: platform as any,
        pin_title: recipe.title,
        pin_description: `Découvrez ce délicieux ${recipe.title}. Recette complète à l'intérieur !`,
        board_slug: defaultBoard,
        destination_url: `https://nutrizen.app/r/${recipe.id}`
      });
      
      set(state => ({ queue: [newItem, ...state.queue] }));
    } catch (e) {
      console.error("Erreur ajout file:", e);
      throw e;
    }
  },

  removeFromQueue: async (id: string) => {
    try {
      await dbService.removeFromQueue(id);
      set(state => ({ queue: state.queue.filter(i => i.id !== id) }));
    } catch (e) {
      console.error("Erreur suppression:", e);
      throw e;
    }
  },

  updateQueueStatus: async (id: string, status) => {
    try {
       // Optimistic update
       set(state => ({
         queue: state.queue.map(i => i.id === id ? { ...i, status } : i)
       }));
       await dbService.updateQueueStatus(id, status);
    } catch (e) {
        // Revert on error? For now, just log
        console.error("Erreur mise à jour statut:", e);
    }
  },

  addBoard: async (boardData) => {
    try {
      const newBoard = await dbService.createBoard(boardData);
      set(state => ({ boards: [...state.boards, newBoard] }));
    } catch (e) {
      console.error("Erreur ajout tableau:", e);
      throw e;
    }
  },

  toggleBoardActive: async (id, isActive) => {
    try {
      // Optimistic
      set(state => ({
        boards: state.boards.map(b => b.id === id ? { ...b, is_active: isActive } : b)
      }));
      await dbService.updateBoard(id, { is_active: isActive });
    } catch (e) {
      console.error("Erreur toggle board:", e);
    }
  },

  saveSettings: async (settings) => {
    try {
      const saved = await dbService.saveSettings(settings);
      set({ settings: saved });
    } catch (e) {
      console.error("Erreur sauvegarde settings:", e);
      throw e;
    }
  },

  getStats: () => {
    const { queue } = get();
    return {
      totalPins: queue.length,
      published: queue.filter(i => i.status === 'posted').length,
      scheduled: queue.filter(i => i.status === 'scheduled').length,
      errors: queue.filter(i => i.status === 'error').length,
      totalClicks: queue.reduce((acc, curr) => acc + curr.utm_stats.clicks, 0),
      totalImpressions: queue.reduce((acc, curr) => acc + curr.utm_stats.impressions, 0),
    };
  }
}));