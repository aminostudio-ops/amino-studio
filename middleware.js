import { NextResponse } from 'next/server';

// Routes that don't require the password
const PUBLIC_PATHS = ['/login', '/api/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon');

  if (isPublic) {
    return NextResponse.next();
  }

  const authed = request.cookies.get('amino_auth')?.value === 'ok';

  if (!authed) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
