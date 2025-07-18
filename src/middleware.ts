import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (accessToken) {
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    console.log('[MIDDLEWARE] sb-access-token:', accessToken);
  } else {
    console.log('[MIDDLEWARE] sb-access-token: undefined');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'], // aplica a todas menos assets
};
