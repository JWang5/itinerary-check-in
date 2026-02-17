import { LocationDB } from '@/src/api/types/db';
import { supabase } from '@/src/utils/supabase';

const LOCATIONS_TABLE = 'locations';
/**
 * Raw database queries for locations table
 */
export const locationsApi = {
  /**
   * Fetch all locations from database
   */
  async getAll(): Promise<LocationDB[]> {
    const { data, error } = await supabase.from(LOCATIONS_TABLE).select('*');

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch all location names with id and city id from database
   */
  async getAllLocationsSubData(): Promise<{ id: string; name: string; city_id: string }[]> {
    const { data, error } = await supabase.from(LOCATIONS_TABLE).select('id, name, city_id');
    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch location by ID with city name
   */
  async getWithCityById(id: string): Promise<LocationDB | null> {
    const { data, error } = await supabase
      .from(LOCATIONS_TABLE)
      .select('*, cities(name)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Fetch multiple locations by their IDs
   */
  async getMultipleByIds(ids: string[]): Promise<LocationDB[]> {
    if (ids.length === 0) return [];
    const { data, error } = await supabase
      .from(LOCATIONS_TABLE)
      .select('*, cities(name)')
      .in('id', ids);

    if (error) throw error;
    return data || [];
  },

  async getLocationsWithMostVisits(
    limit: number = 10,
  ): Promise<(LocationDB & { city_name: string })[]> {
    const { data, error } = await supabase.rpc('top_locations', {
      limit_count: limit,
    });
    if (error) throw error;
    return data || [];
  },

  async getByCity(cityId: string): Promise<LocationDB[]> {
    const { data, error } = await supabase
      .from(LOCATIONS_TABLE)
      .select('*')
      .eq('city_id', cityId)
      .order('index', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getLocationsByUserId(userId: string): Promise<LocationDB[]> {
    const { data, error } = await supabase.from(LOCATIONS_TABLE).select('*').eq('user_id', userId);
    if (error) throw error;
    return data || [];
  },
};
