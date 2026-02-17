import { locationsApi } from '../api/supabase/locations';
import { LocationDB } from '../api/types/db';
import { Location } from '../types/model';

const transformLocation = async (location: LocationDB): Promise<Location> => {
  return {
    id: location.id,
    name: location.name,
    imagePath: location.image_url,
    cityId: location.city_id,
    description: location.description || '',
    address: location.address || '',
    cityName: (location as any).cities?.name || (location as any).city_name,
  };
};

const transformLocations = async (locations: LocationDB[]): Promise<Location[]> => {
  return Promise.all(locations.map((loc) => transformLocation(loc)));
};

/**
 * Location Service - Business logic layer
 */
export const LocationService = {
  /**
   * Get all locations with id, name and cityId
   * used for itinerary creation
   * @returns Array of transformed locations
   */
  async getAllLocations(): Promise<Location[]> {
    const locations = await locationsApi.getAll();
    if (!locations) return [];
    return transformLocations(locations);
  },

  /**
   * Get all locations with id, name and cityId
   * used for notes screen
   * @returns Array of locations with id, name and cityId
   */
  async getAllLocationNames(): Promise<{ id: string; name: string; cityId: string }[]> {
    const locations = await locationsApi.getAllLocationsSubData();
    if (!locations) return [];
    return locations.map((loc) => ({ id: loc.id, name: loc.name, cityId: loc.city_id }));
  },

  /**
   * Get location by ID with city name
   * used in location screen to get location details as fallback
   * @param id - Location ID
   * @returns Transformed location including city name
   */
  async getLocationWithCityNameById(id: string): Promise<Location | null> {
    const location = await locationsApi.getWithCityById(id);
    if (!location) return null;
    return await transformLocation(location);
  },

  /**
   * Get multiple locations by IDs
   * used in profile screen to get user's visited locations
   * @param ids - Array of location IDs
   * @returns Array of transformed locations including city name
   */
  async getLocationsByIds(ids: string[]): Promise<Location[]> {
    if (ids.length === 0) return [];
    const locations = await locationsApi.getMultipleByIds(ids);
    if (!locations) return [];
    return transformLocations(locations);
  },

  /**
   * Get top destinations
   * used in home screen to get top destinations
   * @returns Array of transformed locations including city name
   */
  async getTopDestinations(): Promise<Location[]> {
    const locations = await locationsApi.getLocationsWithMostVisits();
    if (!locations) return [];
    return transformLocations(locations);
  },

  /**
   * Get locations by city
   * used in city screen to get locations in a city
   * @param cityId - City ID
   * @returns Array of transformed locations including city name
   */
  async getLocationsByCity(cityId: string): Promise<Location[]> {
    const locations = await locationsApi.getByCity(cityId);
    if (!locations) return [];
    return transformLocations(locations);
  },
};
