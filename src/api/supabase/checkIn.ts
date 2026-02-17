import { CheckInDB } from '@/src/api/types/db';
import { supabase } from '@/src/utils/supabase';

const CHECK_IN_TABLE = 'check_in';
/**
 * Raw database queries for checkins table
 */
export const checkInApi = {
  /**
   * Fetch all checkins from database
   */
  async getAll(): Promise<CheckInDB[]> {
    const { data, error } = await supabase
      .from(CHECK_IN_TABLE)
      .select('*')
      .order('checked_in_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create checkin
   */
  async create(checkin: Partial<CheckInDB>): Promise<CheckInDB> {
    const { data, error } = await supabase.from(CHECK_IN_TABLE).insert([checkin]).select().single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from(CHECK_IN_TABLE).delete().eq('id', id);
    if (error) throw error;
  },

  async deleteByUserIdAndLocationId(userId: string, locationId: string): Promise<void> {
    const { error } = await supabase
      .from(CHECK_IN_TABLE)
      .delete()
      .eq('user_id', userId)
      .eq('location_id', locationId);
    if (error) throw error;
  },

  /**
   * Get all check-ins by user ID
   */
  async getByUserId(userId: string): Promise<CheckInDB[]> {
    const { data, error } = await supabase
      .from(CHECK_IN_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get location IDs for a user's check-ins (efficient - only fetches location_id)
   */
  async getLocationIdsByUserId(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from(CHECK_IN_TABLE)
      .select('location_id')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => row.location_id);
  },

  /**
   * Get check-in count for a single location (efficient - only fetches count)
   */
  async getCountByLocationId(locationId: string): Promise<number> {
    const { count, error } = await supabase
      .from(CHECK_IN_TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('location_id', locationId);

    if (error) throw error;
    return count || 0;
  },

  /**
   * Get check-in counts for multiple locations in a single query
   */
  async getCountsByLocationIds(locationIds: string[]): Promise<Record<string, number>> {
    if (locationIds.length === 0) return {};

    // Fetch all check-ins for the given location IDs and count in JS
    // This is more efficient than N separate queries
    const { data, error } = await supabase
      .from(CHECK_IN_TABLE)
      .select('location_id')
      .in('location_id', locationIds);

    if (error) throw error;

    // Count occurrences per location
    const counts: Record<string, number> = {};
    locationIds.forEach((id) => (counts[id] = 0));
    (data || []).forEach((row) => {
      counts[row.location_id] = (counts[row.location_id] || 0) + 1;
    });

    return counts;
  },
};
