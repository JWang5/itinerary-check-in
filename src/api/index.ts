/**
 * API Layer - Raw database queries
 *
 * This layer handles direct database communication.
 * No business logic or data transformation should happen here.
 * All functions should work with database types (DB suffix).
 */

export { citiesApi } from './supabase/cities';
export { storageApi } from './supabase/storage';
export type { SignedImagePayload } from './supabase/storage';
