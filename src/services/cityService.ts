import { citiesApi } from '@/src/api';
import { CityDB } from '../api/types/db';
import { City } from '../types/model';

/**
 * Transform database city rows to application models
 */
const transformCities = async (cities: CityDB[]): Promise<City[]> => {
  return Promise.all(
    cities.map(async (city) => {
      return {
        id: city.id,
        name: city.name,
        country: city.country,
        imagePath: city.image_url,
      };
    }),
  );
};

/**
 * City Service - Business logic layer
 * Handles data transformation and business rules
 */
export const CityService = {
  /**
   * Get all cities with id and name
   * used for city filtering in itinerary creation and notes
   * @returns array of cities with id and name
   */
  async getAllCities(): Promise<{ id: string; name: string }[]> {
    const cities = await citiesApi.getAll();
    return cities.map((city) => ({
      id: city.id,
      name: city.name,
    }));
  },

  /**
   * Get single city name by ID
   * used for city screen
   * @param id city id
   * @returns city name or null
   */
  async getCityNameById(id: string): Promise<string | null> {
    const name = await citiesApi.getNameById(id);
    if (!name) return null;
    return name;
  },

  /**
   * Get categories with their cities (grouped data)
   * Returns data optimized for SectionList display
   */
  async getCategoriesWithCities(): Promise<
    { categoryId: string; categoryName: string; cities: City[] }[]
  > {
    const data = await citiesApi.getCategoriesWithCities();

    // Transform the RPC response into sections
    const sections = await Promise.all(
      data.map(async (section: any) => {
        const cities = await transformCities(section.cities || []);
        return {
          categoryId: section.category_id,
          categoryName: section.category_name,
          cities,
        };
      }),
    );

    return sections;
  },
};
