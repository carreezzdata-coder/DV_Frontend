import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'
  : 'https://api.vybeztribe.com';

const GROUP_ORDER = [
  'world',
  'counties',
  'politics',
  'business',
  'sports',
  'entertainment',
  'tech',
  'health',
  'education',
  'crime-security',
  'opinion',
  'lifestyle',
  'other'
];

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Footer Categories API: Fetching from backend...');

    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    
    if (request.headers.has('cookie')) {
      headers.set('Cookie', request.headers.get('cookie')!);
    }

    const slugsResponse = await fetch(`${BACKEND_URL}/api/category-groups/slugs`, {
      headers,
      cache: 'no-store'
    });

    if (!slugsResponse.ok) {
      console.error('❌ Failed to fetch group slugs:', slugsResponse.status);
      return NextResponse.json(
        { success: false, message: 'Failed to fetch category groups', groups: {} },
        { status: 500 }
      );
    }

    const slugsData = await slugsResponse.json();
    
    if (!slugsData.success || !slugsData.slugs) {
      console.error('❌ Invalid slugs data');
      return NextResponse.json(
        { success: false, message: 'Invalid slugs data', groups: {} },
        { status: 500 }
      );
    }

    console.log('✅ Available slugs:', slugsData.slugs);

    const groupPromises = slugsData.slugs.map(async (slug: string) => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/category-groups/${slug}`, {
          headers,
          cache: 'no-store'
        });

        if (!response.ok) {
          console.warn(`⚠️ Failed to fetch group ${slug}:`, response.status);
          return null;
        }

        const data = await response.json();

        if (!data.success || !data.group) {
          console.warn(`⚠️ Invalid data for group ${slug}`);
          return null;
        }

        return {
          slug: data.group.slug,
          data: {
            title: data.group.name,
            icon: data.group.icon,
            description: data.group.description,
            mainSlug: data.group.slug,
            slug: data.group.slug,
            color: data.group.color,
            order: GROUP_ORDER.indexOf(data.group.slug),
            categories: data.group.categories.map((cat: any) => ({
              category_id: cat.category_id,
              name: cat.name,
              slug: cat.slug,
              parent_id: cat.parent_id,
              description: cat.description,
              color: cat.color,
              icon: cat.icon
            }))
          }
        };
      } catch (error) {
        console.error(`❌ Error fetching group ${slug}:`, error);
        return null;
      }
    });

    const groupResults = await Promise.all(groupPromises);
    const validGroups = groupResults.filter((g): g is { slug: string; data: any } => g !== null);

    const groupsObject: Record<string, any> = {};
    validGroups.forEach(({ slug, data }) => {
      groupsObject[slug] = data;
    });

    console.log(`✅ Footer categories: ${Object.keys(groupsObject).length} groups returned`);
    console.log('Groups:', Object.keys(groupsObject).join(', '));

    return NextResponse.json({
      success: true,
      groups: groupsObject,
      total_groups: Object.keys(groupsObject).length
    });

  } catch (error) {
    console.error('❌ Fatal error in footer-categories API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error',
        groups: {} 
      },
      { status: 500 }
    );
  }
}
