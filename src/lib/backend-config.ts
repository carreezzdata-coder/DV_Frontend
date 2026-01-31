import { NextRequest, NextResponse } from 'next/server';

export const getBackendUrl = (): string => {
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.VERCEL_ENV === 'production' ||
    process.env.RENDER === 'true';
  
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, '');
  }
  
  if (isProduction) {
    return 'https://api.dailyvaibe.com';
  }
  
  return 'http://localhost:5000';
};

export const buildHeadersFromRequest = (
  request: NextRequest, 
  additionalHeaders: HeadersInit = {}
): HeadersInit => {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    const cookie = request.headers.get('cookie');
    if (cookie) {
      headers['Cookie'] = cookie;
    }
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }
    const mergedHeaders = new Headers(headers);
    if (additionalHeaders) {
      const additionalHeadersObj = new Headers(additionalHeaders);
      additionalHeadersObj.forEach((value, key) => {
        mergedHeaders.set(key, value);
      });
    }
    return mergedHeaders;
  } catch (error) {
    console.error('Error building headers:', error);
    return { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
};

export const forwardCookies = (
  backendResponse: Response, 
  nextResponse: NextResponse
): void => {
  if (!backendResponse || !nextResponse) {
    return;
  }
  try {
    if (!backendResponse.headers) {
      return;
    }
    if (typeof backendResponse.headers.getSetCookie === 'function') {
      try {
        const cookieArray = backendResponse.headers.getSetCookie();
        if (Array.isArray(cookieArray) && cookieArray.length > 0) {
          cookieArray.forEach(cookie => {
            if (cookie && typeof cookie === 'string' && cookie.trim()) {
              nextResponse.headers.append('Set-Cookie', cookie);
            }
          });
          return;
        }
      } catch (err) {
      }
    }
    try {
      const setCookieHeader = backendResponse.headers.get('set-cookie');
      if (setCookieHeader && typeof setCookieHeader === 'string') {
        const cookies = setCookieHeader.split(/,(?=\s*\w+=)/);
        cookies.forEach(cookie => {
          const trimmedCookie = cookie.trim();
          if (trimmedCookie) {
            nextResponse.headers.append('Set-Cookie', trimmedCookie);
          }
        });
      }
    } catch (err) {
    }
  } catch (error) {
  }
};

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

const DEFAULT_TIMEOUT = 25000;
const DEFAULT_RETRIES = 2;

export async function safeFetch(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const { 
    timeout = DEFAULT_TIMEOUT, 
    retries = DEFAULT_RETRIES,
    headers, 
    ...rest 
  } = options;
  const finalHeaders: HeadersInit = headers || {};
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        ...rest,
        signal: controller.signal,
        headers: finalHeaders,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        return response;
      }
      if (response.status >= 500 && attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Failed to fetch ${url} after ${retries + 1} attempts`);
}

export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  additionalData: Record<string, any> = {}
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
      error: message,
      timestamp: new Date().toISOString(),
      ...additionalData,
    },
    { status: statusCode }
  );
}

export function createSuccessResponse(
  data: any,
  statusCode: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      ...data,
      timestamp: new Date().toISOString(),
    }, 
    { status: statusCode }
  );
}

export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return createErrorResponse(
        errorMessage,
        500,
        {
          path: request.nextUrl.pathname,
          method: request.method,
        }
      );
    }
  };
}

export function normalizeCategorySlug(input: string): string {
  const nameToSlug: Record<string, string> = {
    'Home': 'home',
    'Live & World': 'live-world',
    'Counties': 'counties',
    'Politics': 'politics',
    'Business': 'business',
    'Opinion': 'opinion',
    'Sports': 'sports',
    'Life & Style': 'lifestyle',
    'Lifestyle': 'lifestyle',
    'Entertainment': 'entertainment',
    'Technology': 'tech',
    'Tech': 'tech'
  };
  if (nameToSlug[input]) {
    return nameToSlug[input];
  }
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isMainCategoryGroup(slug: string): boolean {
  const mainGroups = [
    'live-world',
    'counties',
    'politics',
    'business',
    'opinion',
    'sports',
    'lifestyle',
    'entertainment',
    'tech'
  ];
  return mainGroups.includes(slug);
}
