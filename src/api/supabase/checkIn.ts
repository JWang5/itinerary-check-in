import { CheckInDB } from '@/src/api/types/db';
import {
  DEMO_USER_ID,
  MOCK_CHECKIN_COUNTS,
  MOCK_USER_CHECKIN_LOCATION_IDS,
  MOCK_USER_CHECKINS,
} from '@/src/mock/mockData';

const CHECK_IN_TABLE = 'check_in';

// In-memory state for demo check-ins so toggle actions work during a session
let demoCheckedInLocationIds = [...MOCK_USER_CHECKIN_LOCATION_IDS];

/**
 * Raw database queries for checkins table
 * Demo branch: returns mock data instead of Supabase queries.
 */
export const checkInApi = {
  async getAll(): Promise<CheckInDB[]> {
    return MOCK_USER_CHECKINS as CheckInDB[];
  },

  async create(checkin: Partial<CheckInDB>): Promise<CheckInDB> {
    const newCheckin: CheckInDB = {
      id: `checkin-demo-${Date.now()}`,
      user_id: checkin.user_id ?? DEMO_USER_ID,
      location_id: checkin.location_id ?? '',
      checked_in_at: new Date().toISOString(),
    };
    if (newCheckin.location_id && !demoCheckedInLocationIds.includes(newCheckin.location_id)) {
      demoCheckedInLocationIds.unshift(newCheckin.location_id);
    }
    return newCheckin;
  },

  async delete(id: string): Promise<void> {
    // no-op in demo
  },

  async deleteByUserIdAndLocationId(userId: string, locationId: string): Promise<void> {
    demoCheckedInLocationIds = demoCheckedInLocationIds.filter((id) => id !== locationId);
  },

  async getByUserId(userId: string): Promise<CheckInDB[]> {
    return MOCK_USER_CHECKINS as CheckInDB[];
  },

  async getLocationIdsByUserId(userId: string): Promise<string[]> {
    return [...demoCheckedInLocationIds];
  },

  async getCountByLocationId(locationId: string): Promise<number> {
    return MOCK_CHECKIN_COUNTS[locationId] ?? 0;
  },

  async getCountsByLocationIds(locationIds: string[]): Promise<Record<string, number>> {
    const counts: Record<string, number> = {};
    locationIds.forEach((id) => {
      counts[id] = MOCK_CHECKIN_COUNTS[id] ?? 0;
    });
    return counts;
  },
};
