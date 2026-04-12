import { StickyDB } from '../types/db';
import { DEMO_USER_ID, MOCK_STICKIES } from '@/src/mock/mockData';

const TABLE_NAME = 'stickies';

// In-memory state so create/update/delete actions work during a demo session
let demoStickies: any[] = [...MOCK_STICKIES];

/**
 * Raw database queries for sticky notes table
 * Demo branch: returns mock data instead of Supabase queries.
 */
export const stickyNotesApi = {
  async getPaginated(from: number, to: number): Promise<any[]> {
    const sorted = [...demoStickies].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    return sorted.slice(from, to + 1);
  },

  async getById(id: string): Promise<StickyDB | null> {
    return (demoStickies.find((s) => s.id === id) as unknown as StickyDB) ?? null;
  },

  async getPaginatedByLocationId(
    locationId: string,
    from: number,
    to: number,
  ): Promise<StickyDB[] & { profiles?: { display_name: string } }> {
    const filtered = demoStickies
      .filter((s) => s.location_id === locationId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return filtered.slice(from, to + 1) as unknown as StickyDB[];
  },

  async getStickyCountByLocationId(locationId: string): Promise<number> {
    return demoStickies.filter((s) => s.location_id === locationId).length;
  },

  async getByUserId(userId: string): Promise<any[]> {
    return demoStickies
      .filter((s) => s.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async create(sticky: Omit<StickyDB, 'id' | 'created_at' | 'updated_at'>): Promise<StickyDB> {
    const now = new Date().toISOString();
    const newSticky: any = {
      id: `sticky-demo-${Date.now()}`,
      ...sticky,
      created_at: now,
      updated_at: now,
      locations: null,
      profiles: { display_name: 'Alex Chen' },
    };
    demoStickies.unshift(newSticky);
    return newSticky as StickyDB;
  },

  async update(id: string, sticky: Partial<StickyDB>): Promise<StickyDB> {
    const index = demoStickies.findIndex((s) => s.id === id);
    if (index !== -1) {
      demoStickies[index] = {
        ...demoStickies[index],
        ...sticky,
        updated_at: new Date().toISOString(),
      };
      return demoStickies[index] as any;
    }
    throw new Error(`Sticky ${id} not found`);
  },

  async delete(id: string): Promise<void> {
    demoStickies = demoStickies.filter((s) => s.id !== id);
  },

  async getCountByUserAndLocation(userId: string, locationId: string): Promise<number> {
    return demoStickies.filter((s) => s.user_id === userId && s.location_id === locationId).length;
  },
};
