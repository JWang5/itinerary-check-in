import { profileApi } from '../api/supabase/profile';
import { UserDB } from '../api/types/db';
import { User } from '../types/model';

const transformProfile = async (profile: UserDB): Promise<User> => {
  let avatarUrl = profile.avatar_url;

  return {
    id: profile.id,
    displayName: profile.display_name,
    avatarUrl: avatarUrl,
  };
};

export const ProfileService = {
  async getProfileById(userId: string): Promise<User> {
    const profile: UserDB = await profileApi.getProfileById(userId);
    return transformProfile(profile);
  },
  async updateProfile(userId: string, profile: Partial<UserDB>): Promise<User> {
    const profileDB: UserDB = await profileApi.updateProfile(userId, profile);
    return transformProfile(profileDB);
  },
};
