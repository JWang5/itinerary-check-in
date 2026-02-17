import { itineraryApi } from '../api/supabase/itineraries';
import { ItineraryDB, ItineraryItemDB } from '../api/types/db';
import { Itinerary, ItineraryItem } from '../types/model';

/**
 * Itinerary Service - Business logic layer
 */

export const ItineraryService = {
  /**
   * Get all itineraries by user
   * Efficiently includes items count in the same query
   * used in itinerary overview list screen
   * @param userId user id
   * @returns itineraries
   */
  async getItinerariesByUser(
    userId: string,
  ): Promise<Omit<Itinerary, 'itineraryItems' | 'userId'>[]> {
    const itineraries = await itineraryApi.getItinerariesByUserId(userId);
    if (!itineraries) return [];
    return itineraries.map((itinerary) => {
      return {
        id: itinerary.id,
        title: itinerary.title,
        description: itinerary.description,
        startDate: itinerary.start_date,
        endDate: itinerary.end_date,
        coverImagePath: itinerary.cover_image_url || '',
        createdAt: itinerary.created_at,
        updatedAt: itinerary.updated_at,
        totalLocations: (itinerary as any).itinerary_items?.[0]?.count ?? 0,
      };
    });
  },

  /**
   * Get itinerary with all items and locations in a single efficient query
   * used in itinerary screen
   * @param id itinerary id
   * @returns itinerary
   */
  async getItineraryWithItems(id: string): Promise<Itinerary | null> {
    const itinerary = await itineraryApi.getFullItineraryById(id);
    if (!itinerary) return null;
    return {
      // itinerary
      id: itinerary.id,
      userId: itinerary.user_id,
      title: itinerary.title,
      description: itinerary.description,
      startDate: itinerary.start_date,
      endDate: itinerary.end_date,
      coverImagePath: itinerary.cover_image_url || '',
      // itinerary items
      itineraryItems: itinerary.itinerary_items.map((item) => {
        const location = (item as any).locations;
        return {
          id: item.id,
          itineraryId: item.itinerary_id,
          day: item.day,
          locationId: item.location_id,
          timestamp: item.timestamp,
          // itinerary location detail
          location: {
            id: location.id,
            cityId: location.city_id,
            name: location.name,
            description: location.description,
            imagePath: location.image_url,
            address: location.address,
          },
        };
      }),
    };
  },

  /**
   * Create new itinerary item
   * used in itinerary create screen
   * @param itineraryItem itinerary item
   */
  async createItineraryItem(itineraryItem: Omit<ItineraryItem, 'id'>): Promise<void> {
    const newItineraryItem: Omit<ItineraryItemDB, 'id'> = {
      itinerary_id: itineraryItem.itineraryId,
      location_id: itineraryItem.locationId,
      day: itineraryItem.day,
      timestamp: itineraryItem.timestamp || new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await itineraryApi.createItineraryItem(newItineraryItem);
  },

  /**
   * Update itinerary item
   * used in itinerary create screen
   * @param itineraryItem itinerary item
   */
  async updateItineraryItem(itineraryItem: ItineraryItem): Promise<void> {
    const dataToUpdate: Partial<ItineraryItemDB> = {
      itinerary_id: itineraryItem.itineraryId,
      location_id: itineraryItem.locationId,
      day: itineraryItem.day,
      timestamp: itineraryItem.timestamp,
      updated_at: new Date().toISOString(),
    };
    await itineraryApi.updateItineraryItem(itineraryItem.id, dataToUpdate);
  },

  /**
   * Delete itinerary item
   * used in itinerary create screen
   * @param id itinerary item id
   */
  async deleteItineraryItem(id: string): Promise<void> {
    return itineraryApi.deleteItineraryItem(id);
  },

  /**
   * Create new itinerary
   * used in itinerary create screen
   * @param itinerary itinerary
   * @returns itinerary id
   */
  async createItinerary(itinerary: Omit<Itinerary, 'id'>): Promise<string> {
    const newItinerary: Omit<ItineraryDB, 'id'> = {
      user_id: itinerary.userId,
      title: itinerary.title,
      description: itinerary.description,
      start_date: itinerary.startDate,
      end_date: itinerary.endDate,
      cover_image_url: itinerary.coverImagePath,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const data = await itineraryApi.createItinerary(newItinerary);
    return data.id;
  },

  /**
   * Update itinerary
   * used in itinerary create screen
   * @param itinerary itinerary
   */
  async updateItinerary(itinerary: Itinerary): Promise<void> {
    const dataToUpdate: Partial<ItineraryDB> = {
      title: itinerary.title,
      description: itinerary.description,
      start_date: itinerary.startDate,
      end_date: itinerary.endDate,
      cover_image_url: itinerary.coverImagePath,
      updated_at: new Date().toISOString(),
    };
    await itineraryApi.updateItinerary(itinerary.id, dataToUpdate);
  },

  /**
   * Delete itinerary
   * used in itinerary screen
   * @param id itinerary id
   */
  async deleteItinerary(id: string): Promise<void> {
    return itineraryApi.deleteItinerary(id);
  },
};
