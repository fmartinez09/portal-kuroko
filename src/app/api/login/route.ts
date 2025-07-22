import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message ?? 'Login failed' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  const secure = process.env.NODE_ENV === 'production';

  res.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    path: '/',
    secure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  res.cookies.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    path: '/',
    secure,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
