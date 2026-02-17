import { checkInApi } from '../api/supabase/checkIn';
import { CheckIn } from '../types/model';

/**
 * CheckIn Service - Business logic layer
 * Handles data transformation and business rules
 */
export const CheckInService = {
  /**
   * Get all checkins
   * used in store to get checked location ids
   * @param userId - User ID
   * @returns Array of location IDs
   */
  async getCheckedInLocationIdsByUserId(userId: string): Promise<string[]> {
    return checkInApi.getLocationIdsByUserId(userId);
  },

  /**
   * Create checkin
   */
  async createCheckIn(checkin: Partial<CheckIn>): Promise<CheckIn> {
    const checkinDB = {
      location_id: checkin.locationId,
      user_id: checkin.userId,
    };
    const newCheckin = await checkInApi.create(checkinDB);
    return {
      id: newCheckin.id,
      locationId: newCheckin.location_id,
      checkedInAt: newCheckin.checked_in_at,
      userId: newCheckin.user_id,
    };
  },

  async deleteCheckInByUserAndLocation(userId: string, locationId: string): Promise<void> {
    await checkInApi.deleteByUserIdAndLocationId(userId, locationId);
  },

  /**
   * Get check-in count for a specific location
   * @param locationId - Location ID
   * @returns Number of check-ins for the location
   */
  async getCheckInCountByLocationId(locationId: string): Promise<number> {
    return checkInApi.getCountByLocationId(locationId);
  },

  /**
   * Get check-in counts for multiple locations (efficient - only fetches location_id)
   * Returns a map of locationId -> count
   * Used for city view to display check-in counts for locations
   * @param locationIds - Array of location IDs
   * @returns Map of locationId -> count
   */
  async getCheckInCountsByLocationIds(locationIds: string[]): Promise<Record<string, number>> {
    return checkInApi.getCountsByLocationIds(locationIds);
  },
};
