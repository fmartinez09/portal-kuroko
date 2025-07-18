import { supabase } from './client';
import { useAuthStore } from './store';

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  const user = data.user;
  if (!user || !user.email) {
    throw new Error("User or email is missing after login");
  }

  await supabase.auth.setSession({
    access_token: data.session?.access_token!,
    refresh_token: data.session?.refresh_token!,
  });

  useAuthStore.getState().setUser({
    id: user.id,
    email: user.email,
  });
}


export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;

  const user = data.user;
  if (!user || !user.email) {
    throw new Error("User or email is missing after registration");
  }

  useAuthStore.getState().setUser({
    id: user.id,
    email: user.email,
  });
}

export async function logout() {
  await supabase.auth.signOut();
  useAuthStore.getState().setUser(null);
}
