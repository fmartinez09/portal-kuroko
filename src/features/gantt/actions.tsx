import { supabase } from "@/features/auth/client";

export async function fetchFeaturesForUser(userId: string) {
  const { data, error } = await supabase
    .from('features')
    .select(`
      id,
      name,
      start_at,
      end_at,
      status,
      group_info,
      product,
      owner,
      initiative,
      release
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}
