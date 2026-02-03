import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS() {
  console.log('[Admin Delete] OPTIONS request received');
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  console.log('========== DELETE REQUEST START ==========');
  
  try {
    // STEP 1: Extract ID
    console.log('[DEBUG 1] Extracting ID from params...');
    const { id } = params;
    console.log('[DEBUG 1] ✓ ID extracted:', id);

    // STEP 2: Validate ID
    console.log('[DEBUG 2] Validating ID format...');
    if (!id || !/^\d+$/.test(id)) {
      console.error('[DEBUG 2] ✗ Invalid ID format:', id);
      return NextResponse.json({
        success: false,
        message: 'Valid post ID is required',
        debug_step: 'STEP 2: ID Validation Failed'
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }
    console.log('[DEBUG 2] ✓ ID validation passed');

    // STEP 3: Extract headers
    console.log('[DEBUG 3] Extracting headers...');
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    console.log('[DEBUG 3] ✓ Headers extracted:', {
      hasCookies: !!cookieHeader,
      cookieLength: cookieHeader.length,
      cookiePreview: cookieHeader.substring(0, 100) + '...',
      hasCsrfToken: !!csrfToken,
      csrfTokenLength: csrfToken.length
    });

    // STEP 4: Check authentication
    console.log('[DEBUG 4] Checking authentication...');
    if (!cookieHeader) {
      console.error('[DEBUG 4] ✗ Missing authentication cookies');
      return NextResponse.json({
        success: false,
        message: 'Authentication required - No cookies found',
        debug_step: 'STEP 4: Authentication Check Failed'
      }, { 
        status: 401,
        headers: corsHeaders 
      });
    }
    console.log('[DEBUG 4] ✓ Authentication cookies present');

    // STEP 5: Parse request body
    console.log('[DEBUG 5] Parsing request body...');
    let requestBody = {};
    try {
      const contentType = request.headers.get('content-type');
      console.log('[DEBUG 5] Content-Type:', contentType);
      
      if (contentType?.includes('application/json')) {
        requestBody = await request.json();
        console.log('[DEBUG 5] ✓ Request body parsed:', JSON.stringify(requestBody));
      } else {
        console.log('[DEBUG 5] ⚠ No JSON content-type, skipping body parse');
      }
    } catch (error) {
      console.error('[DEBUG 5] ✗ Error parsing request body:', error);
      console.log('[DEBUG 5] ⚠ Continuing without body...');
    }

    // STEP 6: Prepare headers for backend
    console.log('[DEBUG 6] Preparing headers for backend request...');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cookie': cookieHeader,
    };
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    console.log('[DEBUG 6] ✓ Headers prepared:', {
      hasContentType: !!headers['Content-Type'],
      hasCookie: !!headers['Cookie'],
      hasCsrfToken: !!headers['X-CSRF-Token']
    });

    // STEP 7: Build backend URL
    console.log('[DEBUG 7] Building backend URL...');
    let backendUrl;
    try {
      const baseUrl = getBackendUrl();
      backendUrl = `${baseUrl}/api/admin/delete/${id}`;
      console.log('[DEBUG 7] ✓ Backend URL built:', backendUrl);
    } catch (error) {
      console.error('[DEBUG 7] ✗ Error building backend URL:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to build backend URL',
        error: error instanceof Error ? error.message : 'Unknown',
        debug_step: 'STEP 7: Backend URL Building Failed'
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // STEP 8: Make backend request
    console.log('[DEBUG 8] Making DELETE request to backend...');
    console.log('[DEBUG 8] Request details:', {
      method: 'DELETE',
      url: backendUrl,
      hasBody: Object.keys(requestBody).length > 0,
      bodyContent: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : 'none'
    });

    let response;
    try {
      response = await fetch(backendUrl, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined
      });
      console.log('[DEBUG 8] ✓ Backend response received');
    } catch (fetchError) {
      console.error('[DEBUG 8] ✗ Fetch error:', {
        error: fetchError instanceof Error ? fetchError.message : 'Unknown',
        stack: fetchError instanceof Error ? fetchError.stack : undefined,
        name: fetchError instanceof Error ? fetchError.name : typeof fetchError
      });
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to backend server',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        debug_step: 'STEP 8: Backend Request Failed',
        backend_url: backendUrl
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // STEP 9: Log response details
    console.log('[DEBUG 9] Analyzing backend response...');
    const responseTime = Date.now() - startTime;
    console.log('[DEBUG 9] Response metadata:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      responseTime: `${responseTime}ms`,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length')
    });

    // STEP 10: Read response text
    console.log('[DEBUG 10] Reading response text...');
    let responseText = '';
    try {
      responseText = await response.text();
      console.log('[DEBUG 10] ✓ Response text read:', {
        length: responseText.length,
        preview: responseText.substring(0, 200)
      });
    } catch (textError) {
      console.error('[DEBUG 10] ✗ Failed to read response text:', textError);
      return NextResponse.json({
        success: false,
        message: 'Failed to read backend response',
        error: textError instanceof Error ? textError.message : 'Unknown',
        debug_step: 'STEP 10: Response Text Reading Failed'
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // STEP 11: Parse JSON response
    console.log('[DEBUG 11] Parsing JSON response...');
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('[DEBUG 11] ✓ JSON parsed successfully:', data);
    } catch (parseError) {
      console.error('[DEBUG 11] ✗ JSON parse error:', {
        error: parseError instanceof Error ? parseError.message : 'Unknown',
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 500),
        responseFull: responseText
      });
      
      return NextResponse.json({
        success: false,
        message: 'Backend returned invalid JSON',
        debug_step: 'STEP 11: JSON Parsing Failed',
        debug: {
          responsePreview: responseText.substring(0, 500),
          parseError: parseError instanceof Error ? parseError.message : 'Unknown',
          backendStatus: response.status
        }
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    // STEP 12: Check if response is OK
    console.log('[DEBUG 12] Checking response status...');
    if (!response.ok) {
      console.error('[DEBUG 12] ✗ Backend returned error status:', {
        status: response.status,
        message: data.message || 'Unknown error',
        fullData: data
      });
      
      return NextResponse.json({
        ...data,
        debug_step: 'STEP 12: Backend Error Response'
      }, { 
        status: response.status,
        headers: corsHeaders 
      });
    }
    console.log('[DEBUG 12] ✓ Response status OK');

    // STEP 13: Success - prepare response
    console.log('[DEBUG 13] Preparing success response...');
    console.log('[DEBUG 13] Successfully deleted:', {
      newsId: id,
      totalTime: `${Date.now() - startTime}ms`,
      deletedImages: data.deleted_images || 0,
      message: data.message
    });
    
    const nextResponse = NextResponse.json({
      ...data,
      debug_step: 'SUCCESS: All steps completed'
    }, { 
      status: 200,
      headers: {
        ...corsHeaders,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    // STEP 14: Forward cookies
    console.log('[DEBUG 14] Forwarding cookies...');
    try {
      forwardCookies(response, nextResponse);
      console.log('[DEBUG 14] ✓ Cookies forwarded');
    } catch (cookieError) {
      console.error('[DEBUG 14] ⚠ Cookie forwarding error (non-fatal):', cookieError);
    }

    console.log('========== DELETE REQUEST SUCCESS ==========');
    return nextResponse;

  } catch (error) {
    // CATCH-ALL ERROR HANDLER
    console.error('========== UNHANDLED ERROR ==========');
    console.error('[FATAL ERROR] Unhandled exception:', {
      error: error instanceof Error ? error.message : 'Unknown',
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      duration: `${Date.now() - startTime}ms`
    });
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error - Exception caught',
      error: error instanceof Error ? error.message : 'Unknown error',
      debug_step: 'FATAL: Unhandled Exception',
      debug: {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorName: error instanceof Error ? error.name : 'Unknown',
        backendUrl: (() => {
          try {
            return getBackendUrl();
          } catch {
            return 'Unable to get backend URL';
          }
        })(),
        timestamp: new Date().toISOString(),
        stackTrace: error instanceof Error ? error.stack : undefined
      }
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}
