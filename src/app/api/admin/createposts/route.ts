// C:\Projects\DAILY VAIBE\frontend\src\app\api\admin\createposts\route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl, forwardCookies } from '@/lib/backend-config';

export const dynamic = 'force-dynamic';

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(request: NextRequest) {
  console.log('[CREATEPOSTS ROUTE] ========== OPTIONS REQUEST ==========');
  return NextResponse.json({}, { status: 200, headers: getCorsHeaders(request) });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  console.log('\n\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 [CREATEPOSTS ROUTE] POST REQUEST STARTED');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  
  try {
    // ============================================================
    // STEP 1: Extract Headers
    // ============================================================
    console.log('\n📋 STEP 1: EXTRACTING HEADERS');
    console.log('─────────────────────────────────────');
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    const contentType = request.headers.get('Content-Type') || '';
    
    console.log(`✓ Cookie Header Length: ${cookieHeader.length} chars`);
    console.log(`✓ CSRF Token: ${csrfToken ? '✓ Present' : '✗ MISSING'}`);
    console.log(`✓ Content-Type: ${contentType}`);
    
    if (!cookieHeader) {
      console.error('❌ FATAL: No Cookie Header - Authentication Required');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401, headers: corsHeaders }
      );
    }
    
    // ============================================================
    // STEP 2: Parse FormData
    // ============================================================
    console.log('\n📦 STEP 2: PARSING FORMDATA');
    console.log('─────────────────────────────────────');
    
    let formData: FormData;
    try {
      formData = await request.formData();
      console.log('✓ FormData parsed successfully');
    } catch (parseError) {
      console.error('❌ FATAL: FormData parsing failed');
      console.error('Parse Error:', parseError);
      return NextResponse.json({
        success: false,
        message: 'Failed to parse form data',
        error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 400, headers: corsHeaders });
    }
    
    // ============================================================
    // STEP 3: Inspect FormData Contents
    // ============================================================
    console.log('\n🔍 STEP 3: INSPECTING FORMDATA CONTENTS');
    console.log('─────────────────────────────────────');
    
    const formDataEntries: { [key: string]: any } = {};
    let imageCount = 0;
    let textFieldCount = 0;
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        imageCount++;
        formDataEntries[key] = `[FILE: ${value.name}, ${value.size} bytes, ${value.type}]`;
        console.log(`  📎 ${key}: ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        textFieldCount++;
        const valueStr = String(value);
        formDataEntries[key] = valueStr;
        
        if (valueStr.length > 200) {
          console.log(`  📝 ${key}: ${valueStr.substring(0, 200)}... [${valueStr.length} chars total]`);
        } else {
          console.log(`  📝 ${key}: ${valueStr}`);
        }
      }
    }
    
    console.log(`\n📊 FormData Summary:`);
    console.log(`  • Text Fields: ${textFieldCount}`);
    console.log(`  • Images: ${imageCount}`);
    console.log(`  • Total Entries: ${textFieldCount + imageCount}`);
    
    // ============================================================
    // STEP 4: Validate Critical Fields
    // ============================================================
    console.log('\n✅ STEP 4: VALIDATING CRITICAL FIELDS');
    console.log('─────────────────────────────────────');
    
    const title = formData.get('title');
    const content = formData.get('content');
    const categoryIds = formData.get('category_ids');
    const authorId = formData.get('author_id');
    
    console.log(`  • title: ${title ? `✓ Present (${String(title).length} chars)` : '✗ MISSING'}`);
    console.log(`  • content: ${content ? `✓ Present (${String(content).length} chars)` : '✗ MISSING'}`);
    console.log(`  • category_ids: ${categoryIds ? `✓ Present (${String(categoryIds)})` : '✗ MISSING'}`);
    console.log(`  • author_id: ${authorId ? `✓ Present (${authorId})` : '✗ MISSING'}`);
    
    // Validate category_ids can be parsed
    if (categoryIds) {
      try {
        const parsed = JSON.parse(String(categoryIds));
        console.log(`  • category_ids parsed: ✓ Valid JSON [${parsed.join(', ')}]`);
      } catch (e) {
        console.error(`  • category_ids parsed: ✗ INVALID JSON`);
        console.error(`    Raw value: ${categoryIds}`);
      }
    }
    
    // ============================================================
    // STEP 5: Prepare Backend Request
    // ============================================================
    console.log('\n🎯 STEP 5: PREPARING BACKEND REQUEST');
    console.log('─────────────────────────────────────');
    
    const backendUrl = getBackendUrl();
    const fullUrl = `${backendUrl}/api/admin/createposts`;
    
    console.log(`  • Backend URL: ${backendUrl}`);
    console.log(`  • Full Endpoint: ${fullUrl}`);
    console.log(`  • Method: POST`);
    console.log(`  • Credentials: include`);
    
    // ============================================================
    // STEP 6: Send to Backend
    // ============================================================
    console.log('\n🚀 STEP 6: SENDING REQUEST TO BACKEND');
    console.log('─────────────────────────────────────');
    console.log(`⏱️  Request sent at: ${new Date().toISOString()}`);
    
    let response: Response;
    let requestStartTime = Date.now();
    
    try {
      response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Cookie': cookieHeader,
          'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: formData
      });
      
      const requestDuration = Date.now() - requestStartTime;
      console.log(`✓ Backend responded in ${requestDuration}ms`);
      console.log(`  • Status: ${response.status} ${response.statusText}`);
      console.log(`  • Status OK: ${response.ok ? '✓ YES' : '✗ NO'}`);
      
    } catch (fetchError) {
      const requestDuration = Date.now() - requestStartTime;
      console.error(`❌ FATAL: Backend fetch failed after ${requestDuration}ms`);
      console.error('Fetch Error:', fetchError);
      console.error('Error Details:', {
        name: fetchError instanceof Error ? fetchError.name : 'Unknown',
        message: fetchError instanceof Error ? fetchError.message : String(fetchError),
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      });
      
      return NextResponse.json({
        success: false,
        message: 'Failed to connect to backend',
        error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        backend_url: fullUrl
      }, { status: 500, headers: corsHeaders });
    }
    
    // ============================================================
    // STEP 7: Parse Backend Response
    // ============================================================
    console.log('\n📥 STEP 7: PARSING BACKEND RESPONSE');
    console.log('─────────────────────────────────────');
    
    let responseText: string;
    try {
      responseText = await response.text();
      console.log(`✓ Response text extracted: ${responseText.length} chars`);
      console.log(`\nFirst 500 chars of response:\n${responseText.substring(0, 500)}`);
      
      if (responseText.length > 500) {
        console.log(`\nLast 200 chars of response:\n...${responseText.substring(responseText.length - 200)}`);
      }
      
    } catch (textError) {
      console.error('❌ FATAL: Failed to extract response text');
      console.error('Text Error:', textError);
      
      return NextResponse.json({
        success: false,
        message: 'Failed to read backend response',
        error: textError instanceof Error ? textError.message : 'Unknown error'
      }, { status: 500, headers: corsHeaders });
    }
    
    // ============================================================
    // STEP 8: Parse JSON from Response
    // ============================================================
    console.log('\n🔧 STEP 8: PARSING JSON FROM RESPONSE');
    console.log('─────────────────────────────────────');
    
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('✓ JSON parsed successfully');
      console.log('Parsed data structure:', {
        success: data.success,
        message: data.message,
        news_id: data.news_id,
        requires_approval: data.requires_approval,
        hasError: !!data.error,
        keys: Object.keys(data)
      });
      
    } catch (parseError) {
      console.error('❌ FATAL: Backend returned non-JSON response');
      console.error('Parse Error:', parseError);
      console.error('Response was:', responseText.substring(0, 1000));
      
      // Check if it's HTML error page
      if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
        console.error('⚠️  Response appears to be HTML error page');
        
        // Try to extract error message from HTML
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
        const h1Match = responseText.match(/<h1>(.*?)<\/h1>/i);
        
        return NextResponse.json({
          success: false,
          message: 'Backend returned HTML error page instead of JSON',
          html_title: titleMatch ? titleMatch[1] : undefined,
          html_h1: h1Match ? h1Match[1] : undefined,
          error: responseText.substring(0, 200)
        }, { status: 500, headers: corsHeaders });
      }
      
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON response from backend',
        error: responseText.substring(0, 200),
        parse_error: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      }, { status: 500, headers: corsHeaders });
    }
    
    // ============================================================
    // STEP 9: Handle Backend Error Response
    // ============================================================
    if (!response.ok) {
      console.log('\n⚠️  STEP 9: BACKEND RETURNED ERROR STATUS');
      console.log('─────────────────────────────────────');
      console.log(`Status: ${response.status}`);
      console.log(`Error Data:`, JSON.stringify(data, null, 2));
      
      return NextResponse.json(data, { 
        status: response.status,
        headers: corsHeaders 
      });
    }
    
    // ============================================================
    // STEP 10: Success - Prepare Response
    // ============================================================
    console.log('\n✅ STEP 10: SUCCESS - PREPARING RESPONSE');
    console.log('─────────────────────────────────────');
    console.log('Backend returned successful response');
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    const nextResponse = NextResponse.json(data, { 
      status: 201,
      headers: corsHeaders 
    });
    
    forwardCookies(response, nextResponse);
    
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ [CREATEPOSTS ROUTE] REQUEST COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════════════\n\n');
    
    return nextResponse;
    
  } catch (error) {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.error('❌❌❌ [CREATEPOSTS ROUTE] FATAL EXCEPTION ❌❌❌');
    console.log('═══════════════════════════════════════════════════════════════');
    console.error('Exception Type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Exception Message:', error instanceof Error ? error.message : String(error));
    console.error('Exception Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('═══════════════════════════════════════════════════════════════\n\n');
    
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error',
      error_type: error instanceof Error ? error.constructor.name : typeof error
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}

export async function PUT(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  console.log('\n[CREATEPOSTS ROUTE] ========== PUT REQUEST ==========');
  
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    const formData = await request.formData();
    const newsId = formData.get('news_id');
    
    console.log('[PUT] News ID:', newsId);
    
    if (!newsId) {
      return NextResponse.json({
        success: false,
        message: 'News ID is required'
      }, { status: 400, headers: corsHeaders });
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/createposts/${newsId}`;
    
    console.log('[PUT] Backend URL:', url);

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: formData
    });

    const responseText = await response.text();
    console.log('[PUT] Response status:', response.status);
    console.log('[PUT] Response:', responseText.substring(0, 300));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid response from backend'
      }, { status: 500, headers: corsHeaders });
    }

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
    console.error('[PUT] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}

export async function DELETE(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);
  
  console.log('\n[CREATEPOSTS ROUTE] ========== DELETE REQUEST ==========');
  
  try {
    const cookieHeader = request.headers.get('Cookie') || '';
    const csrfToken = request.headers.get('X-CSRF-Token') || '';
    
    const body = await request.json();
    const newsId = body.news_id;
    
    console.log('[DELETE] News ID:', newsId);
    
    if (!newsId) {
      return NextResponse.json({
        success: false,
        message: 'News ID is required'
      }, { status: 400, headers: corsHeaders });
    }
    
    const backendUrl = getBackendUrl();
    const url = `${backendUrl}/api/admin/createposts/${newsId}`;
    
    console.log('[DELETE] Backend URL:', url);

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Cookie': cookieHeader,
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(body)
    });

    const responseText = await response.text();
    console.log('[DELETE] Response status:', response.status);
    console.log('[DELETE] Response:', responseText.substring(0, 300));
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json({
        success: false,
        message: 'Invalid response from backend'
      }, { status: 500, headers: corsHeaders });
    }

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
    console.error('[DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to backend',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: getCorsHeaders(request) });
  }
}
