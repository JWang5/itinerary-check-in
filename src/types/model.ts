export interface User {
  id: string;
  avatarUrl?: string;
  displayName?: string;
}

export interface Sticky {
  id: string;
  userId: string;
  locationId: string;
  text?: string;
  imageUrl?: string;
  createdAt: string;
  color: string;
  type?: 'text' | 'image' | 'sketch';
  locationName?: string;
  cityName?: string;
  cityId?: string;
  displayName?: string;
}

export interface Location {
  id: string;
  cityId: string;
  name: string;
  description: string;
  imagePath: string;
  checkInCount?: number;
  cityName?: string;
  country?: string;
  address?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  imagePath: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Itinerary {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverImagePath: string;
  createdAt?: string;
  updatedAt?: string;
  itineraryItems?: ItineraryItem[];
  totalLocations?: number;
  status?: 'ongoing' | 'upcoming' | 'past';
}

export interface ItineraryItem {
  id: string;
  itineraryId: string;
  locationId: string;
  day: number;
  timestamp: string; // ISO date string
  createdAt?: string;
  updatedAt?: string;
  location?: Location;
}

export interface CheckIn {
  id: string;
  userId: string;
  locationId: string;
  checkedInAt: string;
}

export interface PlannedItem {
  id: string;
  location: Location;
  time: string;
}
