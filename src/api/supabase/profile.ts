import { supabase } from '@/src/utils/supabase';
import { UserDB } from '../types/db';

export const profileApi = {
  async getProfileById(userId: string): Promise<UserDB> {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return data;
  },
  async updateProfile(userId: string, profile: Partial<UserDB>): Promise<UserDB> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profile, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
