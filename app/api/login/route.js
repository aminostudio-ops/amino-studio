import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();
  const correct = process.env.SITE_PASSWORD || 'amino123';

  if (password !== correct) {
    return NextResponse.json({ ok: false, error: 'Wrong password.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('amino_auth', 'ok', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 14, // 14 days
  });
  return res;
}
