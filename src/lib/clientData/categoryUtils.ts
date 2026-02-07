export const CATEGORY_ICONS: { [key: string]: string } = {
  'world': '🌍',
  'counties': '🏢',
  'politics': '🏛️',
  'business': '💼',
  'opinion': '💭',
  'sports': '⚽',
  'lifestyle': '🎭',
  'entertainment': '🎉',
  'tech': '💻',
  'health': '🏥',
  'education': '📚',
  'crime-security': '🚔',
  'other': '📌'
};

export const CATEGORY_COLORS: { [key: string]: string } = {
  'world': '#2563eb',
  'counties': '#3498db',
  'politics': '#e74c3c',
  'business': '#2ecc71',
  'opinion': '#9b59b6',
  'sports': '#f39c12',
  'lifestyle': '#e91e63',
  'entertainment': '#ff6b6b',
  'tech': '#1abc9c',
  'health': '#16a085',
  'education': '#3498db',
  'crime-security': '#c0392b',
  'other': '#34495e'
};

export const CATEGORY_GROUPS: { [key: string]: string[] } = {
  'world': ['national', 'east-africa', 'africa', 'international', 'live', 'world-reports'],
  'counties': ['nairobi', 'coast', 'mountain', 'lake-region', 'rift-valley', 'northern', 'eastern', 'western', 'county-reports'],
  'politics': ['politics', 'governance', 'legal', 'elections', 'parliament', 'political-reports', 'politics-others'],
  'business': ['business', 'companies', 'finance-markets', 'investment', 'enterprise', 'economy', 'banking', 'jobs-careers', 'real-estate', 'agriculture', 'business-reports'],
  'opinion': ['opinion', 'editorials', 'columnists', 'bloggers', 'letters', 'trail-blazing', 'ai-graphics', 'analysis'],
  'sports': ['sports', 'sport', 'football', 'athletics', 'rugby', 'motorsport', 'sports-vybe', 'cricket', 'team-news', 'football-transfers', 'other-sports', 'sports-others'],
  'lifestyle': ['lifestyle', 'motoring', 'culture', 'family', 'relationships', 'travel', 'wellness', 'fashion', 'food', 'religion-faith', 'lifestyle-others'],
  'entertainment': ['entertainment', 'buzz', 'trending', 'trending-pics', 'gossip', 'life-stories', 'music', 'movies', 'celebrity', 'entertainment-others'],
  'tech': ['tech', 'technology', 'innovations', 'gadgets', 'startups', 'digital-life', 'ai', 'mobile', 'gaming', 'tech-reports', 'tech-others'],
  'health': ['health', 'medical-news', 'wellness-fitness', 'mental-health', 'chronic-illnesses', 'traditional-medicine'],
  'education': ['education', 'primary-secondary', 'universities', 'exams-results', 'scholarships', 'teachers-tsc'],
  'crime-security': ['crime-security', 'crime-news', 'court-cases', 'police-news', 'road-accidents'],
  'other': ['other', 'others', 'human-rights', 'climate-crisis', 'investigations', 'interactives', 'features', 'in-pictures', 'special-reports']
};

export const MAIN_CATEGORIES = [
  { slug: 'world', name: 'World', icon: '🌍', isGroup: true },
  { slug: 'counties', name: 'Counties', icon: '🏢', isGroup: true },
  { slug: 'politics', name: 'Politics', icon: '🏛️', isGroup: true },
  { slug: 'business', name: 'Business', icon: '💼', isGroup: true },
  { slug: 'opinion', name: 'Opinion', icon: '💭', isGroup: true },
  { slug: 'sports', name: 'Sports', icon: '⚽', isGroup: true },
  { slug: 'lifestyle', name: 'Life & Style', icon: '🎭', isGroup: true },
  { slug: 'entertainment', name: 'Entertainment', icon: '🎉', isGroup: true },
  { slug: 'tech', name: 'Technology', icon: '💻', isGroup: true },
  { slug: 'health', name: 'Health', icon: '🏥', isGroup: true },
  { slug: 'education', name: 'Education', icon: '📚', isGroup: true },
  { slug: 'crime-security', name: 'Crime & Security', icon: '🚔', isGroup: true },
  { slug: 'other', name: 'Other', icon: '📌', isGroup: true }
];

export function getCategoryIcon(slug: string): string {
  return CATEGORY_ICONS[slug] || '📰';
}

export function getCategoryColor(slug: string): string {
  return CATEGORY_COLORS[slug] || '#34495e';
}

export function getCategoryBySlug(slug: string) {
  return MAIN_CATEGORIES.find(cat => cat.slug === slug);
}

export function isCategoryGroup(slug: string): boolean {
  const category = getCategoryBySlug(slug);
  return category?.isGroup ?? false;
}

export function isGroupCategory(slug: string): boolean {
  return Object.keys(CATEGORY_GROUPS).includes(slug);
}

export function getSubCategories(groupSlug: string): string[] {
  return CATEGORY_GROUPS[groupSlug] || [];
}

export function getParentGroup(subCategorySlug: string): string | null {
  for (const [groupSlug, subCategories] of Object.entries(CATEGORY_GROUPS)) {
    if (subCategories.includes(subCategorySlug)) return groupSlug;
  }
  return null;
}
