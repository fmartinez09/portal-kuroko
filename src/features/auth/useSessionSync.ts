"use client";

import { useEffect } from "react";
import { supabase } from "@/features/auth/client";
import { useAuthStore } from "@/features/auth/store";

export function useSessionSync() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUser({ id: session.user.id, email: session.user.email });
      }
    };
    getSession();

    // subscripción a cambios de sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [setUser]);
}
