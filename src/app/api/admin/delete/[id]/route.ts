import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({
        success: false,
        message: 'Valid post ID is required'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';

    if (!cookieHeader) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required'
      }, { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const headers: HeadersInit = {
      'Cookie': cookieHeader,
    };
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }

    const backendUrl = `${getBackendUrl()}/api/admin/delete/${id}`;

    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { 
        status: response.status,
        headers: corsHeaders 
      });
    }

    const nextResponse = NextResponse.json(data, { 
      status: 200,
      headers: corsHeaders
    });

    forwardCookies(response, nextResponse);
    return nextResponse;

  } catch (error) {
    console.error('[Admin Delete] Error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to delete post',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
