import { ItineraryDB, ItineraryItemDB, LocationDB } from '@/src/api/types/db';
import { MOCK_FULL_ITINERARIES, MOCK_ITINERARIES } from '@/src/mock/mockData';

// In-memory state so create/delete actions work during a demo session
let demoItineraries = [...MOCK_ITINERARIES] as any[];
let demoFullItineraries = { ...MOCK_FULL_ITINERARIES } as Record<string, any>;

/**
 * Raw database queries for itineraries table
 * Demo branch: returns mock data instead of Supabase queries.
 */
export const itineraryApi = {
  async getItinerariesByUserId(userId: string): Promise<ItineraryDB[]> {
    return demoItineraries.filter((i) => i.user_id === userId) as ItineraryDB[];
  },

  async getFullItineraryById(
    id: string,
  ): Promise<
    | (ItineraryDB & { itinerary_items: (ItineraryItemDB & { locations: LocationDB | null })[] })
    | null
  > {
    return (demoFullItineraries[id] as any) ?? null;
  },

  async getItineraryById(id: string): Promise<ItineraryDB | null> {
    const found = demoItineraries.find((i) => i.id === id);
    return (found as ItineraryDB) ?? null;
  },

  async createItinerary(itinerary: Partial<ItineraryDB>): Promise<ItineraryDB> {
    const now = new Date().toISOString();
    const newItinerary: any = {
      id: `itin-demo-${Date.now()}`,
      ...itinerary,
      created_at: now,
      updated_at: now,
      itinerary_items: [{ count: 0 }],
    };
    demoItineraries.push(newItinerary);
    demoFullItineraries[newItinerary.id] = { ...newItinerary, itinerary_items: [] };
    return newItinerary as ItineraryDB;
  },

  async updateItinerary(id: string, itinerary: Partial<ItineraryDB>): Promise<ItineraryDB> {
    const index = demoItineraries.findIndex((i) => i.id === id);
    if (index !== -1) {
      demoItineraries[index] = {
        ...demoItineraries[index],
        ...itinerary,
        updated_at: new Date().toISOString(),
      };
      if (demoFullItineraries[id]) {
        demoFullItineraries[id] = { ...demoFullItineraries[id], ...itinerary };
      }
      return demoItineraries[index] as ItineraryDB;
    }
    throw new Error(`Itinerary ${id} not found`);
  },

  async deleteItinerary(id: string): Promise<void> {
    demoItineraries = demoItineraries.filter((i) => i.id !== id);
    delete demoFullItineraries[id];
  },

  async getItineraryItemsByItineraryId(itineraryId: string): Promise<ItineraryItemDB[]> {
    return (demoFullItineraries[itineraryId]?.itinerary_items ?? []) as ItineraryItemDB[];
  },

  async createItineraryItem(itineraryItem: Partial<ItineraryItemDB>): Promise<ItineraryItemDB> {
    const now = new Date().toISOString();
    const newItem: any = {
      id: `item-demo-${Date.now()}`,
      ...itineraryItem,
      created_at: now,
      updated_at: now,
      locations: null,
    };
    const itinId = itineraryItem.itinerary_id;
    if (itinId && demoFullItineraries[itinId]) {
      demoFullItineraries[itinId].itinerary_items.push(newItem);
      // update count on the summary entry
      const summary = demoItineraries.find((i) => i.id === itinId);
      if (summary) {
        summary.itinerary_items[0].count = demoFullItineraries[itinId].itinerary_items.length;
      }
    }
    return newItem as ItineraryItemDB;
  },

  async updateItineraryItem(
    id: string,
    itineraryItem: Partial<ItineraryItemDB>,
  ): Promise<ItineraryItemDB> {
    for (const itin of Object.values(demoFullItineraries)) {
      const items: any[] = itin.itinerary_items;
      const index = items.findIndex((item) => item.id === id);
      if (index !== -1) {
        items[index] = { ...items[index], ...itineraryItem, updated_at: new Date().toISOString() };
        return items[index] as ItineraryItemDB;
      }
    }
    throw new Error(`Itinerary item ${id} not found`);
  },

  async deleteItineraryItem(id: string): Promise<void> {
    for (const itin of Object.values(demoFullItineraries)) {
      const before = itin.itinerary_items.length;
      itin.itinerary_items = itin.itinerary_items.filter((item: any) => item.id !== id);
      if (itin.itinerary_items.length < before) {
        const summary = demoItineraries.find((i) => i.id === itin.id);
        if (summary) {
          summary.itinerary_items[0].count = itin.itinerary_items.length;
        }
        break;
      }
    }
  },
};
