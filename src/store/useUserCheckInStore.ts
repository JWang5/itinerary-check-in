import { create } from 'zustand';
import { CheckInService } from '../services/checkInService';

interface UserCheckInState {
  userCheckedInLocationIds: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserCheckedInLocationIds: (userId: string) => Promise<void>;
  addUserCheckInInLocation: (userId: string, locationId: string) => Promise<void>;
  removeUserCheckInByLocation: (userId: string, locationId: string) => Promise<void>;
  isUserCheckedIn: (locationId: string) => boolean;
}

export const useUserCheckInStore = create<UserCheckInState>((set, get) => ({
  userCheckedInLocationIds: [],
  isLoading: false,
  error: null,

  /**
   * Fetch user's checked-in location IDs
   */
  fetchUserCheckedInLocationIds: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const locationIds = await CheckInService.getCheckedInLocationIdsByUserId(userId);
      set({ userCheckedInLocationIds: locationIds, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch check-ins', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  /**
   * Add user's check-in in location
   * update checked in location ids
   */
  addUserCheckInInLocation: async (userId: string, locationId: string) => {
    try {
      await CheckInService.createCheckIn({ userId, locationId });
      set((state) => ({
        userCheckedInLocationIds: [locationId, ...state.userCheckedInLocationIds],
      }));
    } catch (error) {
      console.error('Failed to add check-in', error);
      throw error;
    }
  },

  /**
   * Remove user's check-in in location
   * update checked in location ids
   */
  removeUserCheckInByLocation: async (userId: string, locationId: string) => {
    try {
      await CheckInService.deleteCheckInByUserAndLocation(userId, locationId);
      set((state) => ({
        userCheckedInLocationIds: state.userCheckedInLocationIds.filter((id) => id !== locationId),
      }));
    } catch (error) {
      console.error('Failed to remove check-in by location', error);
      throw error;
    }
  },

  /**
   * Check if user is checked in in location
   */
  isUserCheckedIn: (locationId: string) => {
    return get().userCheckedInLocationIds.includes(locationId);
  },
}));
