export type Platform = 'Pinterest' | 'Instagram' | 'TikTok';
export type QueueStatus = 'pending' | 'rendered' | 'scheduled' | 'posted' | 'error';

export interface Recipe {
  id: string;
  title: string;
  cuisine_type: string;
  badges: string[];
  image_url: string;
  ingredients_count: number;
  created_at: string;
}

export interface SocialQueueItem {
  id: string;
  recipe_id: string;
  recipe_title: string; // Denormalized for display
  image_path: string;
  platform: Platform;
  status: QueueStatus;
  pin_title: string;
  pin_description: string;
  board_slug: string;
  destination_url: string;
  utm_stats: {
    clicks: number;
    impressions: number;
    saves: number;
  };
  scheduled_at?: string;
  published_at?: string;
  error_message?: string;
}

export interface PinterestBoardMap {
  id: string;
  cuisine_key: string;
  board_slug: string;
  board_name: string;
  pinterest_board_id: string;
  is_active: boolean;
}

export interface DashboardStats {
  totalPins: number;
  published: number;
  scheduled: number;
  errors: number;
  totalClicks: number;
  totalImpressions: number;
}

export interface AppSettings {
  timezone: string;
  language: string;
  supabaseUrl: string;
  supabaseKey: string; // Encrypted in real app
  pinterestAppId: string;
  pinterestAppSecret: string;
  pinterestToken: string;
  cloudinaryName: string;
  cloudinaryKey: string;
  cloudinarySecret: string;
  googleAnalyticsId: string;
  defaultUtmSource: string;
}