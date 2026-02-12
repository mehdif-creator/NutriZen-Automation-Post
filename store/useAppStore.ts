import { create } from 'zustand';
import { Recipe, SocialQueueItem, PinterestBoardMap, AppSettings, DashboardStats } from '../types';
import { dbService } from '../services/mockSupabase';
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

  addRecipe: async (recipe) => {
    try {
        const newRecipe = await dbService.addRecipe(recipe);
        set(state => ({ recipes: [newRecipe, ...state.recipes] }));
    } catch (e) {
        console.error("Error adding recipe", e);
        throw e;
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

  updateQueueItem: async (id, updates) => {
    try {
       // Optimistic update
       set(state => ({
         queue: state.queue.map(i => i.id === id ? { ...i, ...updates } : i)
       }));
       // Persistence
       await dbService.updateQueueItem(id, updates);
    } catch (e) {
        // Revert on error? For now, log and throw
        console.error("Erreur mise à jour item:", e);
        // Force refresh from server to ensure consistency on error
        const serverQueue = await dbService.getQueue();
        set({ queue: serverQueue });
        throw e;
    }
  },

  retryPublishItem: async (id) => {
      const item = get().queue.find(i => i.id === id);
      if (!item) return;

      // Set to pending immediately in UI
      set(state => ({
         queue: state.queue.map(i => i.id === id ? { ...i, status: 'pending', error_message: undefined } : i)
      }));

      try {
          // 1. Call Service (Handles API, returns new state props)
          const resultUpdates = await pinService.publishPin(item);
          
          // 2. Persist Result to DB
          const updatedItem = await dbService.updateQueueItem(id, resultUpdates);

          // 3. Update Store with Final DB State
          set(state => ({
              queue: state.queue.map(i => i.id === id ? updatedItem : i)
          }));

      } catch (e: any) {
          // If service threw an unexpected error (not caught in its own retry loop)
          const errorUpdate = { status: 'error' as const, error_message: e.message || 'Unknown error' };
          await dbService.updateQueueItem(id, errorUpdate);
          
          set(state => ({
              queue: state.queue.map(i => i.id === id ? { ...i, ...errorUpdate } : i)
          }));
          throw e;
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
}));