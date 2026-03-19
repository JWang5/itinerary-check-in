import { ItineraryDB, ItineraryItemDB, LocationDB } from '@/src/api/types/db';
import { supabase } from '@/src/utils/supabase';

/**
 * Raw database queries for itineraries table
 */
export const itineraryApi = {
  /**
   * Fetch all itineraries from database
   * used in itinerary overview list screen
   * @param userId user id
   * @returns itineraries with count of items
   */
  async getItinerariesByUserId(userId: string): Promise<ItineraryDB[]> {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*, itinerary_items(count)')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch itinerary by ID with its items and their locations
   * used in itinerary screen
   * @param id itinerary id
   * @returns itinerary
   */
  async getFullItineraryById(
    id: string,
  ): Promise<
    | (ItineraryDB & { itinerary_items: (ItineraryItemDB & { locations: LocationDB | null })[] })
    | null
  > {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*, itinerary_items(*, locations(*))')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Fetch itinerary by ID
   * used in itinerary screen
   * @param id itinerary id
   * @returns itinerary
   */
  async getItineraryById(id: string): Promise<ItineraryDB | null> {
    const { data, error } = await supabase.from('itineraries').select('*').eq('id', id).single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  /**
   * Create new itinerary
   * used in itinerary create screen
   * @param itinerary itinerary
   * @returns itinerary id
   */
  async createItinerary(itinerary: Partial<ItineraryDB>): Promise<ItineraryDB> {
    const { data, error } = await supabase
      .from('itineraries')
      .insert([itinerary])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update itinerary
   * used in itinerary create screen
   * @param id itinerary id
   * @param itinerary itinerary
   * @returns itinerary
   */
  async updateItinerary(id: string, itinerary: Partial<ItineraryDB>): Promise<ItineraryDB> {
    const { data, error } = await supabase
      .from('itineraries')
      .update(itinerary)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete itinerary
   * used in itinerary screen
   * @param id itinerary id
   */
  async deleteItinerary(id: string): Promise<void> {
    const { error } = await supabase.from('itineraries').delete().eq('id', id);

    if (error) throw error;
  },

  /**
   * Fetch itinerary items by itinerary ID
   * used in itinerary screen
   * @param itineraryId itinerary id
   * @returns itinerary items
   */
  async getItineraryItemsByItineraryId(itineraryId: string): Promise<ItineraryItemDB[]> {
    const { data, error } = await supabase
      .from('itinerary_items')
      .select('*')
      .eq('itinerary_id', itineraryId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new itinerary item
   * used in itinerary create screen
   * @param itineraryItem itinerary item
   * @returns itinerary item
   */
  async createItineraryItem(itineraryItem: Partial<ItineraryItemDB>): Promise<ItineraryItemDB> {
    const { data, error } = await supabase
      .from('itinerary_items')
      .insert([itineraryItem])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update itinerary item
   * used in itinerary create screen
   * @param id itinerary item id
   * @param itineraryItem itinerary item
   * @returns itinerary item
   */
  async updateItineraryItem(
    id: string,
    itineraryItem: Partial<ItineraryItemDB>,
  ): Promise<ItineraryItemDB> {
    const { data, error } = await supabase
      .from('itinerary_items')
      .update(itineraryItem)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete itinerary item
   * used in itinerary create screen
   * @param id itinerary item id
   */
  async deleteItineraryItem(id: string): Promise<void> {
    const { error } = await supabase.from('itinerary_items').delete().eq('id', id);

    if (error) throw error;
  },
};
