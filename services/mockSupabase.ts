import { Recipe, SocialQueueItem, PinterestBoardMap } from '../types';
import { MOCK_RECIPES, MOCK_QUEUE, MOCK_BOARDS } from '../constants';

// Simulating database latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockSupabaseService {
  private recipes: Recipe[] = [...MOCK_RECIPES];
  private queue: SocialQueueItem[] = [...MOCK_QUEUE];
  private boards: PinterestBoardMap[] = [...MOCK_BOARDS];

  async getRecipes(): Promise<Recipe[]> {
    await delay(300);
    return this.recipes;
  }

  async getQueue(): Promise<SocialQueueItem[]> {
    await delay(300);
    return this.queue;
  }

  async getBoards(): Promise<PinterestBoardMap[]> {
    await delay(300);
    return this.boards;
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

  async updateQueueStatus(id: string, status: SocialQueueItem['status'], extra?: Partial<SocialQueueItem>): Promise<void> {
    await delay(300);
    this.queue = this.queue.map(item => 
      item.id === id ? { ...item, status, ...extra } : item
    );
  }

  async updateBoard(id: string, updates: Partial<PinterestBoardMap>): Promise<void> {
    await delay(300);
    this.boards = this.boards.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
  }

  async createBoard(board: Omit<PinterestBoardMap, 'id'>): Promise<PinterestBoardMap> {
    await delay(300);
    const newBoard = { ...board, id: `b-${Date.now()}` };
    this.boards.push(newBoard);
    return newBoard;
  }
}

export const dbService = new MockSupabaseService();