import { supabase, isSupabaseConfigured } from './supabaseClient';
import { Recipe, SocialQueueItem, PinterestBoardMap, AppSettings } from '../types';
import { dbService } from './mockSupabase';

// Real Supabase Implementation
const supabaseApi = {
  // --- RECIPES ---
  async getRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Recipe[];
  },

  async addRecipe(recipe: Omit<Recipe, 'id' | 'created_at'>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert(recipe)
      .select()
      .single();
      
    if (error) throw error;
    return data as Recipe;
  },

  // --- QUEUE ---
  async getQueue(): Promise<SocialQueueItem[]> {
    const { data, error } = await supabase
      .from('social_queue')
      .select('*')
      .eq('platform', 'pinterest') // Filter only Pinterest jobs for this dashboard
      .order('scheduled_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      ...item,
      // Ensure UI has a valid image path to display
      image_path: item.image_path || item.asset_9x16_path || item.asset_4x5_path || '',
      utm_stats: item.utm_stats || { clicks: 0, impressions: 0, saves: 0 }
    })) as SocialQueueItem[];
  },

  async addToQueue(item: Partial<SocialQueueItem>): Promise<SocialQueueItem> {
    const { data, error } = await supabase
      .from('social_queue')
      .insert({
        ...item,
        status: 'rendered', // Default status for new automation items
        platform: 'pinterest',
        attempts: 0
      })
      .select()
      .single();

    if (error) throw error;
    return data as SocialQueueItem;
  },

  async updateQueueItem(id: string, updates: Partial<SocialQueueItem>): Promise<SocialQueueItem> {
    const { data, error } = await supabase
      .from('social_queue')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SocialQueueItem;
  },

  async removeFromQueue(id: string): Promise<void> {
    const { error } = await supabase
      .from('social_queue')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // --- BOARDS ---
  async getBoards(): Promise<PinterestBoardMap[]> {
    const { data, error } = await supabase
      .from('pinterest_board_map')
      .select('*')
      .order('board_name');

    if (error) throw error;
    return data as PinterestBoardMap[];
  },

  async addBoard(board: Partial<PinterestBoardMap>): Promise<PinterestBoardMap> {
    const { data, error } = await supabase
      .from('pinterest_board_map')
      .insert(board)
      .select()
      .single();

    if (error) throw error;
    return data as PinterestBoardMap;
  },

  async updateBoard(id: string, updates: Partial<PinterestBoardMap>): Promise<void> {
    const { error } = await supabase
      .from('pinterest_board_map')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<AppSettings> {
    // 1. Get General Settings from app_settings table
    const { data: settingsData } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'general_config')
      .maybeSingle();
    
    // 2. Get Pinterest Auth Status (Admin Only Check)
    // We select only non-sensitive fields to verify existence
    const { data: authData } = await supabase
      .from('pinterest_oauth')
      .select('expires_at, account_label')
      .eq('account_label', 'default')
      .maybeSingle();

    const baseSettings = settingsData?.value || {};
    
    return {
      ...baseSettings,
      pinterestConnected: !!authData,
      pinterestTokenExpiresAt: authData?.expires_at
    } as AppSettings;
  },

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    // Store non-sensitive config in app_settings
    // We strip out derived fields like 'pinterestConnected' before saving
    const { pinterestConnected, pinterestTokenExpiresAt, ...configToSave } = settings;
    
    const { error } = await supabase
      .from('app_settings')
      .upsert({ 
        key: 'general_config', 
        value: configToSave 
      });

    if (error) throw error;
    return settings;
  }
};

// Export either real implementation or mock based on configuration
export const api = isSupabaseConfigured ? supabaseApi : dbService;