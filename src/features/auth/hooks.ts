import { useEffect, useState } from "react";
import { supabase } from "./client";
import { useAuthStore } from "./store";

export function useSessionSync() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user && user.email) {
        setUser({ id: user.id, email: user.email });
      } else {
        setUser(null);
      }
    };

    getSession();
  }, [setUser]);
}
