/**
 * Mock data for the demo branch.
 * All images use open-source photos from Unsplash (unsplash.com).
 * No database or network auth required.
 */

// ─── Demo User ───────────────────────────────────────────────────────────────

export const DEMO_USER_ID = 'demo-user-001';

export const MOCK_PROFILE = {
  id: DEMO_USER_ID,
  display_name: 'Alex Chen',
  avatar_url:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&auto=format&fit=crop',
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES = [
  { id: 'cat-asia', name: 'East Asia', index: 0 },
  { id: 'cat-europe', name: 'Europe', index: 1 },
  { id: 'cat-americas', name: 'Americas', index: 2 },
];

// ─── Cities ──────────────────────────────────────────────────────────────────

export const MOCK_CITIES = [
  {
    id: 'city-tokyo',
    name: 'Tokyo',
    country: 'Japan',
    image_url:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop',
  },
  {
    id: 'city-kyoto',
    name: 'Kyoto',
    country: 'Japan',
    image_url:
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop',
  },
  {
    id: 'city-shanghai',
    name: 'Shanghai',
    country: 'China',
    image_url:
      'https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?w=800&auto=format&fit=crop',
  },
  {
    id: 'city-paris',
    name: 'Paris',
    country: 'France',
    image_url:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
  },
  {
    id: 'city-rome',
    name: 'Rome',
    country: 'Italy',
    image_url:
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&auto=format&fit=crop',
  },
  {
    id: 'city-newyork',
    name: 'New York',
    country: 'USA',
    image_url:
      'https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?w=800&auto=format&fit=crop',
  },
];

// ─── Categories with Cities (RPC response shape) ─────────────────────────────

export const MOCK_CATEGORIES_WITH_CITIES = [
  {
    category_id: 'cat-asia',
    category_name: 'East Asia',
    cities: MOCK_CITIES.filter((c) => ['city-tokyo', 'city-kyoto', 'city-shanghai'].includes(c.id)),
  },
  {
    category_id: 'cat-europe',
    category_name: 'Europe',
    cities: MOCK_CITIES.filter((c) => ['city-paris', 'city-rome'].includes(c.id)),
  },
  {
    category_id: 'cat-americas',
    category_name: 'Americas',
    cities: MOCK_CITIES.filter((c) => ['city-newyork'].includes(c.id)),
  },
];

// ─── Locations ───────────────────────────────────────────────────────────────

export const MOCK_LOCATIONS = [
  // Tokyo
  {
    id: 'loc-tokyo-1',
    city_id: 'city-tokyo',
    name: 'Senso-ji Temple',
    description: 'Oldest Buddhist temple in Tokyo.',
    image_url: 'https://picsum.photos/seed/senso-ji/800/600',
    map_url: 'https://maps.google.com/?q=Senso-ji+Temple+Tokyo',
    address: '2-3-1 Asakusa, Taito City, Tokyo',
    city_name: 'Tokyo',
  },
  {
    id: 'loc-tokyo-2',
    city_id: 'city-tokyo',
    name: 'Shibuya Crossing',
    description: 'Famous scramble crossing in Shibuya.',
    image_url: 'https://picsum.photos/seed/shibuya/800/600',
    map_url: 'https://maps.google.com/?q=Shibuya+Crossing+Tokyo',
    address: 'Shibuya, Tokyo',
    city_name: 'Tokyo',
  },
  {
    id: 'loc-tokyo-3',
    city_id: 'city-tokyo',
    name: 'Shinjuku Gyoen',
    description: 'Serene park for cherry blossoms.',
    image_url: 'https://picsum.photos/seed/shinjuku/800/600',
    map_url: 'https://maps.google.com/?q=Shinjuku+Gyoen+Tokyo',
    address: '11 Naitomachi, Shinjuku City, Tokyo',
    city_name: 'Tokyo',
  },
  {
    id: 'loc-tokyo-4',
    city_id: 'city-tokyo',
    name: 'teamLab Planets',
    description: 'Immersive digital art museum.',
    image_url: 'https://picsum.photos/seed/teamlab/800/600',
    map_url: 'https://maps.google.com/?q=teamLab+Planets+Tokyo',
    address: '6-1-16 Toyosu, Koto City, Tokyo',
    city_name: 'Tokyo',
  },
  {
    id: 'loc-tokyo-5',
    city_id: 'city-tokyo',
    name: 'Meiji Shrine',
    description: 'Peaceful Shinto shrine in forest.',
    image_url: 'https://picsum.photos/seed/meijishrine/800/600',
    map_url: 'https://maps.google.com/?q=Meiji+Shrine+Tokyo',
    address: '1-1 Yoyogikamizonocho, Shibuya City, Tokyo',
    city_name: 'Tokyo',
  },
  {
    id: 'loc-tokyo-6',
    city_id: 'city-tokyo',
    name: 'Akihabara',
    description: 'Electronics and anime hub.',
    image_url: 'https://picsum.photos/seed/akihabara/800/600',
    map_url: 'https://maps.google.com/?q=Akihabara+Tokyo',
    address: 'Akihabara, Taito City, Tokyo',
    city_name: 'Tokyo',
  },
  // Kyoto
  {
    id: 'loc-kyoto-1',
    city_id: 'city-kyoto',
    name: 'Fushimi Inari Taisha',
    description: 'Thousands of vermilion torii gates.',
    image_url: 'https://picsum.photos/seed/fushimiinari/800/600',
    map_url: 'https://maps.google.com/?q=Fushimi+Inari+Taisha+Kyoto',
    address: '68 Fukakusa Yabunouchicho, Fushimi Ward, Kyoto',
    city_name: 'Kyoto',
  },
  {
    id: 'loc-kyoto-2',
    city_id: 'city-kyoto',
    name: 'Arashiyama Bamboo Grove',
    description: 'Magical path through towering bamboo.',
    image_url: 'https://picsum.photos/seed/arashiyama/800/600',
    map_url: 'https://maps.google.com/?q=Arashiyama+Bamboo+Grove+Kyoto',
    address: 'Sagaogurayama Tabuchiyamacho, Ukyo Ward, Kyoto',
    city_name: 'Kyoto',
  },
  {
    id: 'loc-kyoto-3',
    city_id: 'city-kyoto',
    name: 'Kinkaku-ji',
    description: 'Zen temple covered in gold.',
    image_url: 'https://picsum.photos/seed/kinkakuji/800/600',
    map_url: 'https://maps.google.com/?q=Kinkakuji+Kyoto',
    address: '1 Kinkakujicho, Kita Ward, Kyoto',
    city_name: 'Kyoto',
  },
  {
    id: 'loc-kyoto-4',
    city_id: 'city-kyoto',
    name: 'Gion District',
    description: 'Historic geisha and teahouse district.',
    image_url: 'https://picsum.photos/seed/giondist/800/600',
    map_url: 'https://maps.google.com/?q=Gion+District+Kyoto',
    address: 'Gion, Higashiyama Ward, Kyoto',
    city_name: 'Kyoto',
  },
  // Shanghai
  {
    id: 'loc-shanghai-1',
    city_id: 'city-shanghai',
    name: 'The Bund',
    description: 'Historic waterfront facing Pudong skyline.',
    image_url: 'https://picsum.photos/seed/thebund/800/600',
    map_url: 'https://maps.google.com/?q=The+Bund+Shanghai',
    address: 'Zhongshan East 1st Road, Huangpu District, Shanghai',
    city_name: 'Shanghai',
  },
  {
    id: 'loc-shanghai-2',
    city_id: 'city-shanghai',
    name: 'Yu Garden',
    description: 'Classical Ming Dynasty garden.',
    image_url: 'https://picsum.photos/seed/yugarden/800/600',
    map_url: 'https://maps.google.com/?q=Yu+Garden+Shanghai',
    address: '218 Anren Street, Huangpu District, Shanghai',
    city_name: 'Shanghai',
  },
  {
    id: 'loc-shanghai-3',
    city_id: 'city-shanghai',
    name: 'Shanghai Tower',
    description: 'Second tallest building in the world.',
    image_url: 'https://picsum.photos/seed/shanghaitower/800/600',
    map_url: 'https://maps.google.com/?q=Shanghai+Tower',
    address: '501 Yincheng Middle Road, Pudong, Shanghai',
    city_name: 'Shanghai',
  },
  // Paris
  {
    id: 'loc-paris-1',
    city_id: 'city-paris',
    name: 'Eiffel Tower',
    description: 'Iconic iron lattice tower.',
    image_url: 'https://picsum.photos/seed/eiffeltower/800/600',
    map_url: 'https://maps.google.com/?q=Eiffel+Tower+Paris',
    address: 'Champ de Mars, 5 Av. Anatole France, Paris',
    city_name: 'Paris',
  },
  {
    id: 'loc-paris-2',
    city_id: 'city-paris',
    name: 'Louvre Museum',
    description: 'Home to the Mona Lisa.',
    image_url: 'https://picsum.photos/seed/louvremuseum/800/600',
    map_url: 'https://maps.google.com/?q=Louvre+Museum+Paris',
    address: 'Rue de Rivoli, 75001 Paris',
    city_name: 'Paris',
  },
  {
    id: 'loc-paris-3',
    city_id: 'city-paris',
    name: 'Montmartre',
    description: 'Hilltop village loved by artists.',
    image_url: 'https://picsum.photos/seed/montmartre/800/600',
    map_url: 'https://maps.google.com/?q=Montmartre+Paris',
    address: 'Montmartre, 75018 Paris',
    city_name: 'Paris',
  },
  // Rome
  {
    id: 'loc-rome-1',
    city_id: 'city-rome',
    name: 'Colosseum',
    description: 'Ancient amphitheatre of the Romans.',
    image_url: 'https://picsum.photos/seed/colosseum/800/600',
    map_url: 'https://maps.google.com/?q=Colosseum+Rome',
    address: 'Piazza del Colosseo, 1, 00184 Roma RM',
    city_name: 'Rome',
  },
  {
    id: 'loc-rome-2',
    city_id: 'city-rome',
    name: 'Vatican City',
    description: 'Home to the Sistine Chapel.',
    image_url: 'https://picsum.photos/seed/vaticancity/800/600',
    map_url: 'https://maps.google.com/?q=Vatican+City',
    address: 'Vatican City, Rome',
    city_name: 'Rome',
  },
  {
    id: 'loc-rome-3',
    city_id: 'city-rome',
    name: 'Trevi Fountain',
    description: "Rome's famous Baroque fountain.",
    image_url: 'https://picsum.photos/seed/trevifountain/800/600',
    map_url: 'https://maps.google.com/?q=Trevi+Fountain+Rome',
    address: 'Piazza di Trevi, 00187 Roma RM',
    city_name: 'Rome',
  },
  // New York
  {
    id: 'loc-newyork-1',
    city_id: 'city-newyork',
    name: 'Central Park',
    description: 'Green oasis in central Manhattan.',
    image_url: 'https://picsum.photos/seed/centralpark/800/600',
    map_url: 'https://maps.google.com/?q=Central+Park+New+York',
    address: 'Central Park, New York, NY',
    city_name: 'New York',
  },
  {
    id: 'loc-newyork-2',
    city_id: 'city-newyork',
    name: 'Times Square',
    description: 'The city that never sleeps.',
    image_url: 'https://picsum.photos/seed/timessquare/800/600',
    map_url: 'https://maps.google.com/?q=Times+Square+New+York',
    address: 'Times Square, Manhattan, New York, NY',
    city_name: 'New York',
  },
  {
    id: 'loc-newyork-3',
    city_id: 'city-newyork',
    name: 'Brooklyn Bridge',
    description: 'Iconic suspension bridge over the East River.',
    image_url: 'https://picsum.photos/seed/brooklynbridge/800/600',
    map_url: 'https://maps.google.com/?q=Brooklyn+Bridge+New+York',
    address: 'Brooklyn Bridge, New York, NY 10038',
    city_name: 'New York',
  },
];

// ─── Check-in counts per location ────────────────────────────────────────────

export const MOCK_CHECKIN_COUNTS: Record<string, number> = {
  'loc-tokyo-1': 342,
  'loc-tokyo-2': 289,
  'loc-tokyo-3': 178,
  'loc-tokyo-4': 156,
  'loc-tokyo-5': 98,
  'loc-tokyo-6': 74,
  'loc-kyoto-1': 256,
  'loc-kyoto-2': 189,
  'loc-kyoto-3': 134,
  'loc-kyoto-4': 87,
  'loc-shanghai-1': 145,
  'loc-shanghai-2': 89,
  'loc-shanghai-3': 67,
  'loc-paris-1': 423,
  'loc-paris-2': 312,
  'loc-paris-3': 198,
  'loc-rome-1': 378,
  'loc-rome-2': 267,
  'loc-rome-3': 189,
  'loc-newyork-1': 234,
  'loc-newyork-2': 312,
  'loc-newyork-3': 167,
};

// ─── Demo user's check-ins ───────────────────────────────────────────────────

export const MOCK_USER_CHECKIN_LOCATION_IDS: string[] = [
  'loc-tokyo-1',
  'loc-tokyo-2',
  'loc-kyoto-1',
  'loc-paris-1',
  'loc-rome-1',
];

export const MOCK_USER_CHECKINS = MOCK_USER_CHECKIN_LOCATION_IDS.map((locationId, i) => ({
  id: `checkin-${i + 1}`,
  user_id: DEMO_USER_ID,
  location_id: locationId,
  checked_in_at: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
}));

// ─── Itineraries ─────────────────────────────────────────────────────────────

export const MOCK_ITINERARIES = [
  {
    id: 'itin-1',
    user_id: DEMO_USER_ID,
    title: 'Tokyo Weekend Escape',
    description: 'A short but packed weekend in the heart of Tokyo.',
    start_date: '2026-04-18',
    end_date: '2026-04-20',
    cover_image_url:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-01T10:00:00Z',
    itinerary_items: [{ count: 4 }],
  },
  {
    id: 'itin-2',
    user_id: DEMO_USER_ID,
    title: 'Paris in Spring',
    description: 'Exploring the romance of Paris during cherry blossom season.',
    start_date: '2026-02-14',
    end_date: '2026-02-19',
    cover_image_url:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop',
    created_at: '2026-01-10T09:00:00Z',
    updated_at: '2026-01-10T09:00:00Z',
    itinerary_items: [{ count: 3 }],
  },
  {
    id: 'itin-3',
    user_id: DEMO_USER_ID,
    title: 'Ancient Rome Adventure',
    description: 'Walking through two thousand years of history.',
    start_date: '2026-06-05',
    end_date: '2026-06-10',
    cover_image_url:
      'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&auto=format&fit=crop',
    created_at: '2026-03-15T12:00:00Z',
    updated_at: '2026-03-15T12:00:00Z',
    itinerary_items: [{ count: 3 }],
  },
];

// ─── Full itinerary details (with items) ─────────────────────────────────────

const tokyoLocations: Record<string, (typeof MOCK_LOCATIONS)[number]> = Object.fromEntries(
  MOCK_LOCATIONS.filter((l) => l.city_id === 'city-tokyo').map((l) => [l.id, l]),
);
const parisLocations: Record<string, (typeof MOCK_LOCATIONS)[number]> = Object.fromEntries(
  MOCK_LOCATIONS.filter((l) => l.city_id === 'city-paris').map((l) => [l.id, l]),
);
const romeLocations: Record<string, (typeof MOCK_LOCATIONS)[number]> = Object.fromEntries(
  MOCK_LOCATIONS.filter((l) => l.city_id === 'city-rome').map((l) => [l.id, l]),
);

export const MOCK_FULL_ITINERARIES: Record<string, any> = {
  'itin-1': {
    ...MOCK_ITINERARIES[0],
    itinerary_items: [
      {
        id: 'item-1-1',
        itinerary_id: 'itin-1',
        location_id: 'loc-tokyo-1',
        day: 1,
        timestamp: '2026-04-18T09:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        locations: tokyoLocations['loc-tokyo-1'],
      },
      {
        id: 'item-1-2',
        itinerary_id: 'itin-1',
        location_id: 'loc-tokyo-2',
        day: 1,
        timestamp: '2026-04-18T15:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        locations: tokyoLocations['loc-tokyo-2'],
      },
      {
        id: 'item-1-3',
        itinerary_id: 'itin-1',
        location_id: null,
        day: 2,
        timestamp: '2026-04-19T11:00:00Z',
        item_type: 'custom',
        custom_name: 'Ramen at Ichiran',
        custom_address: '1-22-7 Jinnan, Shibuya City, Tokyo',
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        locations: null,
      },
      {
        id: 'item-1-4',
        itinerary_id: 'itin-1',
        location_id: 'loc-tokyo-4',
        day: 2,
        timestamp: '2026-04-19T14:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-01T10:00:00Z',
        locations: tokyoLocations['loc-tokyo-4'],
      },
    ],
  },
  'itin-2': {
    ...MOCK_ITINERARIES[1],
    itinerary_items: [
      {
        id: 'item-2-1',
        itinerary_id: 'itin-2',
        location_id: 'loc-paris-1',
        day: 1,
        timestamp: '2026-02-14T18:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-01-10T09:00:00Z',
        updated_at: '2026-01-10T09:00:00Z',
        locations: parisLocations['loc-paris-1'],
      },
      {
        id: 'item-2-2',
        itinerary_id: 'itin-2',
        location_id: 'loc-paris-2',
        day: 2,
        timestamp: '2026-02-15T10:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-01-10T09:00:00Z',
        updated_at: '2026-01-10T09:00:00Z',
        locations: parisLocations['loc-paris-2'],
      },
      {
        id: 'item-2-3',
        itinerary_id: 'itin-2',
        location_id: 'loc-paris-3',
        day: 3,
        timestamp: '2026-02-16T14:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-01-10T09:00:00Z',
        updated_at: '2026-01-10T09:00:00Z',
        locations: parisLocations['loc-paris-3'],
      },
    ],
  },
  'itin-3': {
    ...MOCK_ITINERARIES[2],
    itinerary_items: [
      {
        id: 'item-3-1',
        itinerary_id: 'itin-3',
        location_id: 'loc-rome-1',
        day: 1,
        timestamp: '2026-06-05T10:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-03-15T12:00:00Z',
        updated_at: '2026-03-15T12:00:00Z',
        locations: romeLocations['loc-rome-1'],
      },
      {
        id: 'item-3-2',
        itinerary_id: 'itin-3',
        location_id: 'loc-rome-2',
        day: 2,
        timestamp: '2026-06-06T09:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-03-15T12:00:00Z',
        updated_at: '2026-03-15T12:00:00Z',
        locations: romeLocations['loc-rome-2'],
      },
      {
        id: 'item-3-3',
        itinerary_id: 'itin-3',
        location_id: 'loc-rome-3',
        day: 3,
        timestamp: '2026-06-07T16:00:00Z',
        item_type: 'location',
        custom_name: null,
        custom_address: null,
        created_at: '2026-03-15T12:00:00Z',
        updated_at: '2026-03-15T12:00:00Z',
        locations: romeLocations['loc-rome-3'],
      },
    ],
  },
};

// ─── Sticky Notes ─────────────────────────────────────────────────────────────

// helper to get a location by id
const loc = (id: string) => MOCK_LOCATIONS.find((l) => l.id === id)!;

export const MOCK_STICKIES = [
  {
    id: 'sticky-1',
    user_id: DEMO_USER_ID,
    location_id: 'loc-tokyo-1',
    text: 'A peaceful morning at the temple. The incense fills the air and time seems to slow down. Absolutely magical.',
    image_url: null,
    color: '#FFF9C4',
    type: 'text',
    created_at: '2026-03-10T08:30:00Z',
    updated_at: '2026-03-10T08:30:00Z',
    locations: {
      name: loc('loc-tokyo-1').name,
      city_id: loc('loc-tokyo-1').city_id,
      cities: { name: 'Tokyo' },
    },
    profiles: { display_name: 'Alex Chen' },
  },
  {
    id: 'sticky-2',
    user_id: DEMO_USER_ID,
    location_id: 'loc-tokyo-2',
    text: 'The crossing is even more incredible in person! Thousands of people flooding from every direction at once.',
    image_url: null,
    color: '#C8E6C9',
    type: 'text',
    created_at: '2026-03-10T17:00:00Z',
    updated_at: '2026-03-10T17:00:00Z',
    locations: {
      name: loc('loc-tokyo-2').name,
      city_id: loc('loc-tokyo-2').city_id,
      cities: { name: 'Tokyo' },
    },
    profiles: { display_name: 'Alex Chen' },
  },
  {
    id: 'sticky-3',
    user_id: 'user-002',
    location_id: 'loc-tokyo-2',
    text: 'Rush hour hits different here. Nothing prepares you for the sheer scale of it.',
    image_url: null,
    color: '#BBDEFB',
    type: 'text',
    created_at: '2026-03-08T18:00:00Z',
    updated_at: '2026-03-08T18:00:00Z',
    locations: {
      name: loc('loc-tokyo-2').name,
      city_id: loc('loc-tokyo-2').city_id,
      cities: { name: 'Tokyo' },
    },
    profiles: { display_name: 'Sara Kim' },
  },
  {
    id: 'sticky-4',
    user_id: 'user-003',
    location_id: 'loc-tokyo-6',
    text: 'Found a vintage Famicom cartridge from 1986 for ¥500! The retro gaming shops here are unreal.',
    image_url: null,
    color: '#F8BBD0',
    type: 'text',
    created_at: '2026-03-05T14:00:00Z',
    updated_at: '2026-03-05T14:00:00Z',
    locations: {
      name: loc('loc-tokyo-6').name,
      city_id: loc('loc-tokyo-6').city_id,
      cities: { name: 'Tokyo' },
    },
    profiles: { display_name: 'Kenji Watanabe' },
  },
  {
    id: 'sticky-5',
    user_id: DEMO_USER_ID,
    location_id: 'loc-kyoto-1',
    text: 'Hiked all the way to the summit! The upper trails are deserted at 6 am — totally worth the early start.',
    image_url: null,
    color: '#FFE0B2',
    type: 'text',
    created_at: '2026-02-20T06:45:00Z',
    updated_at: '2026-02-20T06:45:00Z',
    locations: {
      name: loc('loc-kyoto-1').name,
      city_id: loc('loc-kyoto-1').city_id,
      cities: { name: 'Kyoto' },
    },
    profiles: { display_name: 'Alex Chen' },
  },
  {
    id: 'sticky-6',
    user_id: 'user-002',
    location_id: 'loc-kyoto-2',
    text: 'The bamboo grove at dawn is absolutely magical. Bring earplugs — the rustling is otherworldly.',
    image_url: null,
    color: '#E1BEE7',
    type: 'text',
    created_at: '2026-02-18T05:50:00Z',
    updated_at: '2026-02-18T05:50:00Z',
    locations: {
      name: loc('loc-kyoto-2').name,
      city_id: loc('loc-kyoto-2').city_id,
      cities: { name: 'Kyoto' },
    },
    profiles: { display_name: 'Sara Kim' },
  },
  {
    id: 'sticky-7',
    user_id: 'user-004',
    location_id: 'loc-kyoto-3',
    text: 'The golden reflection on the pond is perfect at 8 am before the crowds arrive. Go early!',
    image_url: null,
    color: '#FFF9C4',
    type: 'text',
    created_at: '2026-02-17T08:10:00Z',
    updated_at: '2026-02-17T08:10:00Z',
    locations: {
      name: loc('loc-kyoto-3').name,
      city_id: loc('loc-kyoto-3').city_id,
      cities: { name: 'Kyoto' },
    },
    profiles: { display_name: 'Liu Yang' },
  },
  {
    id: 'sticky-8',
    user_id: DEMO_USER_ID,
    location_id: 'loc-paris-1',
    text: 'Came here at sunset — the whole city turns golden. Best decision of the entire trip.',
    image_url: null,
    color: '#FFCCBC',
    type: 'text',
    created_at: '2026-02-14T20:00:00Z',
    updated_at: '2026-02-14T20:00:00Z',
    locations: {
      name: loc('loc-paris-1').name,
      city_id: loc('loc-paris-1').city_id,
      cities: { name: 'Paris' },
    },
    profiles: { display_name: 'Alex Chen' },
  },
  {
    id: 'sticky-9',
    user_id: 'user-003',
    location_id: 'loc-paris-2',
    text: 'Spent 6 hours here and barely scratched the surface. Get the timed tickets well in advance!',
    image_url: null,
    color: '#B2EBF2',
    type: 'text',
    created_at: '2026-02-15T16:30:00Z',
    updated_at: '2026-02-15T16:30:00Z',
    locations: {
      name: loc('loc-paris-2').name,
      city_id: loc('loc-paris-2').city_id,
      cities: { name: 'Paris' },
    },
    profiles: { display_name: 'Kenji Watanabe' },
  },
  {
    id: 'sticky-10',
    user_id: 'user-005',
    location_id: 'loc-paris-3',
    text: 'The portrait artists here are incredibly talented. Sat for one for €20 — a perfect souvenir.',
    image_url: null,
    color: '#DCEDC8',
    type: 'text',
    created_at: '2026-02-16T13:00:00Z',
    updated_at: '2026-02-16T13:00:00Z',
    locations: {
      name: loc('loc-paris-3').name,
      city_id: loc('loc-paris-3').city_id,
      cities: { name: 'Paris' },
    },
    profiles: { display_name: 'Marie Dubois' },
  },
  {
    id: 'sticky-11',
    user_id: DEMO_USER_ID,
    location_id: 'loc-rome-1',
    text: 'History comes alive here. Standing in the arena floor you can almost hear the roar of the crowd.',
    image_url: null,
    color: '#F0F4C3',
    type: 'text',
    created_at: '2026-01-20T11:00:00Z',
    updated_at: '2026-01-20T11:00:00Z',
    locations: {
      name: loc('loc-rome-1').name,
      city_id: loc('loc-rome-1').city_id,
      cities: { name: 'Rome' },
    },
    profiles: { display_name: 'Alex Chen' },
  },
  {
    id: 'sticky-12',
    user_id: 'user-004',
    location_id: 'loc-rome-3',
    text: 'Threw a coin in at midnight with almost nobody around. The fountain is lit up beautifully after dark.',
    image_url: null,
    color: '#E8F5E9',
    type: 'text',
    created_at: '2026-01-19T23:15:00Z',
    updated_at: '2026-01-19T23:15:00Z',
    locations: {
      name: loc('loc-rome-3').name,
      city_id: loc('loc-rome-3').city_id,
      cities: { name: 'Rome' },
    },
    profiles: { display_name: 'Liu Yang' },
  },
  {
    id: 'sticky-13',
    user_id: 'user-005',
    location_id: 'loc-newyork-1',
    text: 'Perfect autumn day for a long walk through the park. The leaves were every shade of red and gold.',
    image_url: null,
    color: '#FFF3E0',
    type: 'text',
    created_at: '2026-01-05T14:30:00Z',
    updated_at: '2026-01-05T14:30:00Z',
    locations: {
      name: loc('loc-newyork-1').name,
      city_id: loc('loc-newyork-1').city_id,
      cities: { name: 'New York' },
    },
    profiles: { display_name: 'Marie Dubois' },
  },
  {
    id: 'sticky-14',
    user_id: 'user-002',
    location_id: 'loc-newyork-2',
    text: "Overwhelming in the best possible way. Midnight on New Year's Eve here was a once-in-a-lifetime experience.",
    image_url: null,
    color: '#FCE4EC',
    type: 'text',
    created_at: '2026-01-01T00:30:00Z',
    updated_at: '2026-01-01T00:30:00Z',
    locations: {
      name: loc('loc-newyork-2').name,
      city_id: loc('loc-newyork-2').city_id,
      cities: { name: 'New York' },
    },
    profiles: { display_name: 'Sara Kim' },
  },
  {
    id: 'sticky-15',
    user_id: 'user-003',
    location_id: 'loc-tokyo-3',
    text: 'Cherry blossom season here is breathtaking. Book your picnic spot early — it fills up fast!',
    image_url: null,
    color: '#FCE4EC',
    type: 'text',
    created_at: '2026-03-28T12:00:00Z',
    updated_at: '2026-03-28T12:00:00Z',
    locations: {
      name: loc('loc-tokyo-3').name,
      city_id: loc('loc-tokyo-3').city_id,
      cities: { name: 'Tokyo' },
    },
    profiles: { display_name: 'Kenji Watanabe' },
  },
  {
    id: 'sticky-16',
    user_id: 'user-005',
    location_id: 'loc-shanghai-1',
    text: 'The Pudong skyline from here at night is one of the most spectacular urban views on the planet.',
    image_url: null,
    color: '#E3F2FD',
    type: 'text',
    created_at: '2025-12-20T20:30:00Z',
    updated_at: '2025-12-20T20:30:00Z',
    locations: {
      name: loc('loc-shanghai-1').name,
      city_id: loc('loc-shanghai-1').city_id,
      cities: { name: 'Shanghai' },
    },
    profiles: { display_name: 'Marie Dubois' },
  },
];

// ─── Top destinations (for Explore tab) ──────────────────────────────────────

export const MOCK_TOP_DESTINATIONS = [
  {
    ...MOCK_LOCATIONS.find((l) => l.id === 'loc-paris-1')!,
    check_in_count: 423,
    city_name: 'Paris',
  },
  { ...MOCK_LOCATIONS.find((l) => l.id === 'loc-rome-1')!, check_in_count: 378, city_name: 'Rome' },
  {
    ...MOCK_LOCATIONS.find((l) => l.id === 'loc-tokyo-1')!,
    check_in_count: 342,
    city_name: 'Tokyo',
  },
  {
    ...MOCK_LOCATIONS.find((l) => l.id === 'loc-kyoto-1')!,
    check_in_count: 256,
    city_name: 'Kyoto',
  },
  {
    ...MOCK_LOCATIONS.find((l) => l.id === 'loc-newyork-2')!,
    check_in_count: 312,
    city_name: 'New York',
  },
  {
    ...MOCK_LOCATIONS.find((l) => l.id === 'loc-paris-2')!,
    check_in_count: 312,
    city_name: 'Paris',
  },
];
