export interface CityDB {
  id: string;
  name: string;
  country: string;
  image_url: string;
}

export interface CategoryDB {
  id: string;
  name: string;
  created_at?: string;
  index: number;
}

export interface LocationDB {
  id: string;
  city_id: string;
  name: string;
  description: string;
  image_url: string;
  map_url: string;
  address: string;
}

export interface StickyDB {
  id: string;
  location_id: string;
  user_id: string;
  text?: string;
  image_url?: string;
  color: string;
  created_at: string;
  updated_at?: string;
  type?: 'text' | 'image' | 'sketch';
}

export interface ProfileDB {
  id: string;
  display_name: string;
  avatar_url?: string;
}

export interface ItineraryDB {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  cover_image_url?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

export interface ItineraryItemDB {
  id: string;
  created_at?: string;
  itinerary_id: string;
  location_id?: string | null;
  day: number;
  timestamp: string;
  item_type?: 'location' | 'custom';
  custom_name?: string | null;
  custom_address?: string | null;
  updated_at?: string;
}

export interface CheckInDB {
  id: string;
  user_id: string;
  location_id: string;
  checked_in_at: string;
}

export interface UserDB {
  id: string;
  display_name: string;
  avatar_url?: string;
}
