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
   * Attempts to publish a pin. 
   * Returns the updated item state.
   * Does NOT update the store directly; the caller must handle the returned state.
   */
  async publishPin(item: SocialQueueItem, maxRetries = 3): Promise<Partial<SocialQueueItem>> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        console.log(`Tentative de publication ${attempt + 1}/${maxRetries} pour ${item.id}...`);
        
        const result = await this.mockPinterestApiCall(item);
        
        if (result.success) {
          // Success: We return the fields that need to be updated in DB and Store
          return {
              status: 'posted',
              published_at: new Date().toISOString(),
              error_message: undefined,
              // external_id: result.externalId // If we had this field in type
          };
        }

      } catch (error: any) {
        attempt++;
        console.error(`Échec tentative ${attempt}:`, error);

        if (attempt >= maxRetries) {
          // Final failure
          return {
              status: 'error',
              error_message: error.message || "Erreur inconnue"
          };
        }

        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error("Unexpected error in publishPin");
  }
}

export const pinService = new PinPublishingService();