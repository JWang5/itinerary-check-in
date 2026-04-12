import { MOCK_LOCATIONS, MOCK_TOP_DESTINATIONS } from '@/src/mock/mockData';
import { LocationDB } from '@/src/api/types/db';

const LOCATIONS_TABLE = 'locations';

/**
 * Raw database queries for locations table
 * Demo branch: returns mock data instead of Supabase queries.
 */
export const locationsApi = {
  async getAll(): Promise<LocationDB[]> {
    return MOCK_LOCATIONS as unknown as LocationDB[];
  },

  async getAllLocationsSubData(): Promise<{ id: string; name: string; city_id: string }[]> {
    return MOCK_LOCATIONS.map((l) => ({ id: l.id, name: l.name, city_id: l.city_id }));
  },

  async getWithCityById(id: string): Promise<LocationDB | null> {
    const loc = MOCK_LOCATIONS.find((l) => l.id === id);
    if (!loc) return null;
    return {
      ...loc,
      cities: { name: loc.city_name },
    } as unknown as LocationDB;
  },

  async getMultipleByIds(ids: string[]): Promise<LocationDB[]> {
    if (ids.length === 0) return [];
    return MOCK_LOCATIONS.filter((l) => ids.includes(l.id)).map((l) => ({
      ...l,
      cities: { name: l.city_name },
    })) as unknown as LocationDB[];
  },

  async getLocationsWithMostVisits(
    limit: number = 10,
  ): Promise<(LocationDB & { city_name: string })[]> {
    return MOCK_TOP_DESTINATIONS.slice(0, limit) as unknown as (LocationDB & {
      city_name: string;
    })[];
  },

  async getByCity(cityId: string): Promise<LocationDB[]> {
    return MOCK_LOCATIONS.filter((l) => l.city_id === cityId) as unknown as LocationDB[];
  },

  async getLocationsByUserId(userId: string): Promise<LocationDB[]> {
    return [];
  },
};
