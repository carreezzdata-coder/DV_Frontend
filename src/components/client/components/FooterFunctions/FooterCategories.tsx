import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCategoryIcon, isGroupCategory } from '@/lib/clientData';

interface Category {
  category_id: number;
  name: string;
  slug: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  mainSlug: string;
  slug: string;
  color: string;
  order: number;
  categories: Category[];
}

interface CategoryGroups {
  [key: string]: CategoryGroup;
}

interface FooterCategoriesProps {
  groups: CategoryGroups;
  trackBehavior?: (action: string) => void;
  trackCategoryVisit: (slug: string) => void;
}

const CATEGORY_ICONS: { [key: string]: string } = {
  'World': '🌍',
  'Counties': '🏛️',
  'Politics': '⚖️',
  'Business': '💼',
  'Opinion': '💭',
  'Sports': '⚽',
  'Life & Style': '✨',
  'Entertainment': '🎬',
  'Technology': '💻',
  'Health': '🏥',
  'Education': '📚',
  'Crime & Security': '🚔',
  'Other': '📌',
};

const DISPLAY_ORDER = [
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

export default function FooterCategories({ groups, trackBehavior, trackCategoryVisit }: FooterCategoriesProps) {
  const router = useRouter();

  const handleSubCategoryClick = useCallback((slug: string) => {
    const isMainCategory = isGroupCategory(slug);
    if (trackBehavior) trackBehavior(slug);
    trackCategoryVisit(slug);
    if (isMainCategory) {
      router.push(`/client/categories/${slug}`);
    } else {
      router.push(`/client/sub-categories/${slug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit]);

  const handleCategoryGroupClick = useCallback((mainSlug: string) => {
    if (mainSlug) {
      if (trackBehavior) trackBehavior(mainSlug);
      trackCategoryVisit(mainSlug);
      router.push(`/client/categories/${mainSlug}`);
    }
  }, [router, trackBehavior, trackCategoryVisit]);

  const sortedGroups = useMemo(() => {
    const groupArray = Object.entries(groups).map(([key, group]) => ({
      key,
      ...group
    }));

    return groupArray.sort((a, b) => {
      const indexA = DISPLAY_ORDER.indexOf(a.key);
      const indexB = DISPLAY_ORDER.indexOf(b.key);
      
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [groups]);

  if (!sortedGroups.length) return null;

  return (
    <div className="footer-categories-section">
      <div className="footer-mega-grid">
        {sortedGroups.map((group, idx) => (
          <div key={`${group.key}-${idx}`} className="footer-section">
            <button
              className="footer-section-header clickable"
              onClick={() => handleCategoryGroupClick(group.mainSlug || group.slug)}
              type="button"
              aria-label={`Navigate to ${group.title} category`}
            >
              <span className="footer-icon" aria-hidden="true">
                {CATEGORY_ICONS[group.title] || group.icon || getCategoryIcon(group.mainSlug || '')}
              </span>
              <h3 className="footer-section-title">{group.title}</h3>
              <span className="main-category-indicator" aria-hidden="true">→</span>
            </button>
            <ul className="footer-links-list">
              {group.categories.map((category) => (
                <li key={category.category_id}>
                  <button
                    onClick={() => handleSubCategoryClick(category.slug)}
                    className="footer-link-item"
                    type="button"
                    aria-label={`Navigate to ${category.name} sub-category`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        <div className="footer-ad-space">
          <div className="footer-ad-placeholder">
            Ad Space<br/>Available
          </div>
        </div>
      </div>

      <div className="footer-mobile-static-links">
        <nav className="footer-mobile-nav" aria-label="Footer navigation">
          <Link href="/static_pages/about" className="footer-mobile-link">
            About Us
          </Link>
          <Link href="/static_pages/contact" className="footer-mobile-link">
            Contact
          </Link>
          <Link href="/static_pages/privacy" className="footer-mobile-link">
            Privacy
          </Link>
          <Link href="/static_pages/terms" className="footer-mobile-link">
            Terms
          </Link>
          <Link href="/static_pages/careers" className="footer-mobile-link">
            Careers
          </Link>
        </nav>
      </div>
    </div>
  );
}
