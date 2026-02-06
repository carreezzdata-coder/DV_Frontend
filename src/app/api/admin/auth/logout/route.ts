import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export async function POST(request: NextRequest) {
  try {
    const requestCookies = request.headers.get('cookie') || '';

    const response = await fetch(`${getBackendUrl()}/api/admin/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': requestCookies,
      },
      credentials: 'include'
    });

    const data = await response.json();

    const nextResponse = NextResponse.json(data, { status: response.status });

    forwardCookies(response, nextResponse);

    nextResponse.cookies.set({
      name: 'dailyvaibe_admin_session',
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    nextResponse.cookies.set({
      name: 'connect.sid',
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return nextResponse;
  } catch (error) {
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Logged out'
    });

    nextResponse.cookies.set({
      name: 'dailyvaibe_admin_session',
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    nextResponse.cookies.set({
      name: 'connect.sid',
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    return nextResponse;
  }
}
