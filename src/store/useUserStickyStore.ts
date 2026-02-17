import { create } from 'zustand';
import { StickyService } from '../services/stickyService';
import { Sticky } from '../types/model';

interface UserStickyState {
  userStickies: Sticky[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserStickies: (userId: string) => Promise<void>;
  addUserSticky: (sticky: Omit<Sticky, 'id' | 'createdAt' | 'type'>) => Promise<Sticky>;
  updateUserSticky: (
    id: string,
    sticky: Omit<Sticky, 'id' | 'createdAt' | 'type'>,
  ) => Promise<void>;
  deleteUserSticky: (id: string) => Promise<void>;
}

export const useUserStickyStore = create<UserStickyState>((set, get) => ({
  userStickies: [],
  isLoading: false,
  error: null,

  fetchUserStickies: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const stickies = await StickyService.getStickiesByUserId(userId);
      set({ userStickies: stickies, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user stickies', error);
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addUserSticky: async (stickyData: Omit<Sticky, 'id' | 'createdAt' | 'type'>) => {
    set({ isLoading: true, error: null });
    try {
      const newSticky = await StickyService.createSticky(stickyData);
      set((state) => ({
        userStickies: [newSticky, ...state.userStickies],
        isLoading: false,
      }));
      return newSticky;
    } catch (error) {
      console.error('Failed to add user sticky', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateUserSticky: async (id: string, stickyData: Omit<Sticky, 'id' | 'createdAt' | 'type'>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedSticky = await StickyService.updateSticky(id, stickyData);
      set((state) => ({
        userStickies: state.userStickies.map((s) => (s.id === id ? updatedSticky : s)),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to update user sticky', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteUserSticky: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await StickyService.deleteSticky(id);
      set((state) => ({
        userStickies: state.userStickies.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to delete user sticky', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
}));
