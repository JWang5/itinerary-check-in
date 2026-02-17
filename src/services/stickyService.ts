import { stickyNotesApi } from '../api/supabase/stickynotes';
import { StickyDB } from '../api/types/db';
import { Sticky } from '../types/model';

/**
 * Sticky Service - Business logic layer
 */

export const StickyService = {
  /**
   * Get stickies with pagination
   */
  async getPaginatedStickies(page: number, pageSize: number): Promise<Sticky[]> {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const stickies = await stickyNotesApi.getPaginated(from, to);

    if (stickies.length === 0) return [];
    return Promise.all(
      stickies.map(async (sticky) => {
        return {
          id: sticky.id,
          userId: sticky.user_id,
          text: sticky.text,
          type: sticky.type,
          createdAt: sticky.created_at,
          color: sticky.color,
          locationId: sticky.location_id,
          locationName: sticky.locations?.name,
          cityName: sticky.locations?.cities?.name,
          cityId: sticky.locations?.city_id,
          displayName: sticky.profiles?.display_name,
        };
      }),
    );
  },

  async getStickyCountByLocationId(locationId: string): Promise<number> {
    return stickyNotesApi.getStickyCountByLocationId(locationId);
  },

  async getPaginatedStickiesByLocationId(
    locationId: string,
    page: number,
    pageSize: number,
  ): Promise<Sticky[]> {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const stickies = await stickyNotesApi.getPaginatedByLocationId(locationId, from, to);

    if (stickies.length === 0) return [];
    return Promise.all(
      stickies.map(async (sticky: any) => {
        return {
          id: sticky.id,
          userId: sticky.user_id,
          text: sticky.text,
          type: sticky.type,
          createdAt: sticky.created_at,
          color: sticky.color,
          locationId: sticky.location_id,
          displayName: sticky.profiles?.display_name,
        };
      }),
    );
  },

  /**
   * Get all stickies by user ID
   */
  async getStickiesByUserId(userId: string): Promise<Sticky[]> {
    const stickies = await stickyNotesApi.getByUserId(userId);

    if (stickies.length === 0) return [];
    return Promise.all(
      stickies.map(async (sticky) => {
        return {
          id: sticky.id,
          userId: sticky.user_id,
          text: sticky.text,
          type: sticky.type,
          createdAt: sticky.created_at,
          color: sticky.color,
          locationId: sticky.location_id,
          locationName: sticky.locations?.name,
          cityName: sticky.locations?.cities?.name,
          cityId: sticky.locations?.city_id,
          displayName: sticky.profiles?.display_name,
        };
      }),
    );
  },

  async createSticky(sticky: Omit<Sticky, 'id' | 'createdAt' | 'type'>): Promise<Sticky> {
    const newSticky = {
      user_id: sticky.userId,
      text: sticky.text,
      image_url: sticky.imageUrl,
      color: sticky.color,
      location_id: sticky.locationId,
    };
    return stickyNotesApi.create(newSticky).then((data) => ({
      id: data.id,
      userId: data.user_id,
      text: data.text,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      color: data.color,
      locationId: data.location_id,
    }));
  },

  async updateSticky(
    id: string,
    sticky: Omit<Sticky, 'id' | 'createdAt' | 'type'>,
  ): Promise<Sticky> {
    const dataToUpdate: Partial<StickyDB> = {
      text: sticky.text,
      image_url: sticky.imageUrl,
      color: sticky.color,
      location_id: sticky.locationId,
    };
    return stickyNotesApi.update(id, dataToUpdate).then((data) => ({
      id: data.id,
      userId: data.user_id,
      text: data.text,
      imageUrl: data.image_url,
      color: data.color,
      locationId: data.location_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }));
  },

  async deleteSticky(id: string): Promise<void> {
    return stickyNotesApi.delete(id);
  },

  async canUserAddSticky(userId: string, locationId: string): Promise<boolean> {
    const count = await stickyNotesApi.getCountByUserAndLocation(userId, locationId);
    return count < 2;
  },
};
