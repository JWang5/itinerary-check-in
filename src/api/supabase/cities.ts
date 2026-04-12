import { MOCK_CATEGORIES_WITH_CITIES, MOCK_CITIES } from '@/src/mock/mockData';

const TABLE_NAME = 'cities';

/**
 * Raw database queries for city table
 * Demo branch: returns mock data instead of Supabase queries.
 */
export const citiesApi = {
  async getAll(): Promise<{ id: string; name: string }[]> {
    return MOCK_CITIES.map((c) => ({ id: c.id, name: c.name }));
  },

  async getNameById(id: string): Promise<string | null> {
    return MOCK_CITIES.find((c) => c.id === id)?.name ?? null;
  },

  async getCategoriesWithCities(): Promise<any> {
    return MOCK_CATEGORIES_WITH_CITIES;
  },
};
