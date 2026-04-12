import { UserDB } from '../types/db';
import { MOCK_PROFILE } from '@/src/mock/mockData';

// In-memory profile so updates persist during a session
let demoProfile = { ...MOCK_PROFILE };

/**
 * Profile API
 * Demo branch: returns mock profile data instead of Supabase queries.
 */
export const profileApi = {
  async getProfileById(userId: string): Promise<UserDB> {
    return {
      id: demoProfile.id,
      display_name: demoProfile.display_name,
      avatar_url: demoProfile.avatar_url,
    };
  },

  async updateProfile(userId: string, profile: Partial<UserDB>): Promise<UserDB> {
    demoProfile = { ...demoProfile, ...profile } as typeof demoProfile;
    return {
      id: demoProfile.id,
      display_name: demoProfile.display_name,
      avatar_url: demoProfile.avatar_url,
    };
  },
};
