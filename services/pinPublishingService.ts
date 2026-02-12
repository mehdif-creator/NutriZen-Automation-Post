import { SocialQueueItem } from '../types';
import { dbService } from './mockSupabase';

interface PublishResult {
  success: boolean;
  externalId?: string;
  error?: string;
}

/**
 * Service responsible for publishing logic, API interactions, and retries.
 */
class PinPublishingService {
  
  /**
   * Simulates publishing to Pinterest API with failure chance
   */
  private async mockPinterestApiCall(item: SocialQueueItem): Promise<PublishResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 20% chance of random failure
    if (Math.random() < 0.2) {
      throw new Error("Erreur Pinterest API: Rate Limit ou Timeout");
    }

    return {
      success: true,
      externalId: `pin-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
  }

  /**
   * Attempts to publish a pin with exponential backoff retry logic
   */
  async publishPin(item: SocialQueueItem, maxRetries = 3): Promise<SocialQueueItem> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`Tentative de publication ${attempt + 1}/${maxRetries} pour ${item.id}...`);
        
        const result = await this.mockPinterestApiCall(item);
        
        if (result.success) {
          const updated = await dbService.updateQueueStatus(item.id, 'posted', {
            published_at: new Date().toISOString(),
            error_message: undefined
          });
          if (!updated) throw new Error("Item non trouvé après publication");
          return updated;
        }

      } catch (error: any) {
        attempt++;
        console.error(`Échec tentative ${attempt}:`, error);

        if (attempt >= maxRetries) {
          // Final failure
          await dbService.updateQueueStatus(item.id, 'error', {
            error_message: error.message || "Erreur inconnue"
          });
          throw error;
        }

        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return item;
  }
}

export const pinService = new PinPublishingService();