import { Recipe, SocialQueueItem, PinterestBoardMap, AppSettings } from '../types';
import { MOCK_RECIPES, MOCK_QUEUE, MOCK_BOARDS } from '../constants';

// Simulating database latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const DEFAULT_SETTINGS: AppSettings = {
  timezone: 'Europe/Paris',
  language: 'fr',
  supabaseUrl: '',
  supabaseKey: '',
  pinterestAppId: '',
  pinterestAppSecret: '',
  pinterestToken: '',
  cloudinaryName: '',
  cloudinaryKey: '',
  cloudinarySecret: '',
  googleAnalyticsId: '',
  defaultUtmSource: 'pinterest'
};

class MockSupabaseService {
  private recipes: Recipe[] = [...MOCK_RECIPES];
  private queue: SocialQueueItem[] = [...MOCK_QUEUE];
  private boards: PinterestBoardMap[] = [...MOCK_BOARDS];
  private settings: AppSettings = { ...DEFAULT_SETTINGS };

  async getRecipes(): Promise<Recipe[]> {
    await delay(300);
    return this.recipes;
  }

  async addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe> {
    await delay(300);
    const newRecipe: Recipe = {
        ...recipe,
        id: `r-${Date.now()}`,
        created_at: new Date().toISOString()
    };
    this.recipes = [newRecipe, ...this.recipes];
    return newRecipe;
  }

  async getQueue(): Promise<SocialQueueItem[]> {
    await delay(300);
    return this.queue;
  }

  async getBoards(): Promise<PinterestBoardMap[]> {
    await delay(300);
    return this.boards;
  }

  async getSettings(): Promise<AppSettings> {
    await delay(200);
    return this.settings;
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    await delay(500);
    this.settings = { ...settings };
    return this.settings;
  }

  async addToQueue(item: Omit<SocialQueueItem, 'id' | 'status' | 'utm_stats'>): Promise<SocialQueueItem> {
    await delay(500);
    const newItem: SocialQueueItem = {
      ...item,
      id: `q-${Date.now()}`,
      status: 'pending',
      utm_stats: { clicks: 0, impressions: 0, saves: 0 }
    };
    this.queue = [newItem, ...this.queue];
    return newItem;
  }

  async removeFromQueue(id: string): Promise<void> {
    await delay(300);
    this.queue = this.queue.filter(item => item.id !== id);
  }

  async updateQueueItem(id: string, updates: Partial<SocialQueueItem>): Promise<SocialQueueItem> {
      await delay(300);
      let updatedItem: SocialQueueItem | undefined;
      this.queue = this.queue.map(item => {
          if (item.id === id) {
              updatedItem = { ...item, ...updates };
              return updatedItem;
          }
          return item;
      });
      if (!updatedItem) throw new Error("Item not found");
      return updatedItem;
  }

  // Legacy wrapper for status updates, now routed through updateQueueItem logic internally
  async updateQueueStatus(id: string, status: SocialQueueItem['status'], extra?: Partial<SocialQueueItem>): Promise<SocialQueueItem> {
    return this.updateQueueItem(id, { status, ...extra });
  }

  async updateBoard(id: string, updates: Partial<PinterestBoardMap>): Promise<void> {
    await delay(300);
    this.boards = this.boards.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
  }

  // Renamed from createBoard to match api.ts interface
  async addBoard(board: Partial<PinterestBoardMap>): Promise<PinterestBoardMap> {
    await delay(300);
    const newBoard: PinterestBoardMap = { 
        id: `b-${Date.now()}`,
        cuisine_key: board.cuisine_key || '',
        board_slug: board.board_slug || '',
        board_name: board.board_name || '',
        pinterest_board_id: board.pinterest_board_id || '',
        is_active: board.is_active ?? true
    };
    this.boards.push(newBoard);
    return newBoard;
  }
}

export const dbService = new MockSupabaseService();