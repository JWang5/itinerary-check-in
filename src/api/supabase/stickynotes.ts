import { supabase } from '@/src/utils/supabase';
import { StickyDB } from '../types/db';

const TABLE_NAME = 'stickies';

/**
 * Raw database queries for sticky notes table
 */
export const stickyNotesApi = {
  /**
   * Fetch paginated sticky notes from database
   */
  async getPaginated(from: number, to: number): Promise<any[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*, locations(name, city_id, cities(name)), profiles(display_name)')
      .order('created_at', {
        ascending: false,
      })
      .range(from, to);

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch sticky note by ID
   */
  async getById(id: string): Promise<StickyDB | null> {
    const { data, error } = await supabase.from(TABLE_NAME).select('*').eq('id', id).single();

    if (error) throw error;
    return data;
  },

  async getPaginatedByLocationId(
    locationId: string,
    from: number,
    to: number,
  ): Promise<StickyDB[] & { profiles?: { display_name: string } }> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*, locations(name, city_id, cities(name)), profiles(display_name)')
      .eq('location_id', locationId)
      .order('created_at', {
        ascending: false,
      })
      .range(from, to);

    if (error) throw error;
    return data || [];
  },

  async getStickyCountByLocationId(locationId: string): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('location_id', locationId);

    if (error) throw error;
    return count || 0;
  },

  async getByUserId(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*, locations(name, city_id, cities(name)), profiles(display_name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(sticky: Omit<StickyDB, 'id' | 'created_at' | 'updated_at'>): Promise<StickyDB> {
    const { data, error } = await supabase.from(TABLE_NAME).insert([sticky]).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, sticky: Partial<StickyDB>): Promise<StickyDB> {
    const { data, error } = await supabase.from(TABLE_NAME).update(sticky).eq('id', id).single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) throw error;
  },

  async getCountByUserAndLocation(userId: string, locationId: string): Promise<number> {
    const { count, error } = await supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('location_id', locationId);
    if (error) throw error;
    return count || 0;
  },
};
