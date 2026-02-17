import { supabase } from '@/src/utils/supabase';

const TABLE_NAME = 'cities';

/**
 * Raw database queries for city table
 */
export const citiesApi = {
  /**
   * Fetch all cities from database
   */
  async getAll(): Promise<{ id: string; name: string }[]> {
    const { data, error } = await supabase.from(TABLE_NAME).select('id, name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch city name by ID
   */
  async getNameById(id: string): Promise<string | null> {
    const { data, error } = await supabase.from(TABLE_NAME).select('name').eq('id', id).single();

    if (error) throw error;
    return data?.name || null;
  },

  /**
   * Get categories with their cities using RPC function
   */
  async getCategoriesWithCities(): Promise<any> {
    const { data, error } = await supabase.rpc('get_categories_with_cities');
    if (error) {
      console.error('RPC error', error);
      throw error;
    }
    return data;
  },
};
