import { db, doc, getDocFromServer } from './firebase';

export interface CreationCategory {
  title: string;
  description: string;
  shortLabel: string;
  shortDescription: string;
  search: string;
  image: string;
}

export interface SiteContent {
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  coreHeadline: string;
  coreSubtext: string;
  featuredTitle: string;
  featuredSubtitle: string;
  howItWorksTitle: string;
  exploreTitle: string;
  exploreSubtitle: string;
  customizeTitle: string;
  customizeSubtitle: string;
  businessTitle: string;
  businessSubtitle: string;
  categories: CreationCategory[];
}

export const defaultCreationCategories: CreationCategory[] = [
  {
    title: 'Personal',
    description: 'Jewellery, portraits, and custom-made items for you or as gifts.',
    shortLabel: 'Personal Style',
    shortDescription: 'Jewellery, portraits, custom gifts',
    search: 'jewelry portraits gifts wristbands',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200'
  },
  {
    title: 'Decor & Space',
    description: 'Photo mounts, wall art, large prints, and decor for your space.',
    shortLabel: 'Decor & Space',
    shortDescription: 'Photo mounts, wall art, large prints',
    search: 'photo mounts wall art decor stickers large format prints',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200'
  },
  {
    title: 'Devices',
    description: 'Customize your phone, laptop, and everyday tech.',
    shortLabel: 'Devices',
    shortDescription: 'Phone and laptop customization',
    search: 'laptop phone stickers skins device customization',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200'
  },
  {
    title: 'Business & Branding',
    description: 'Make your business stand out with professional branding.',
    shortLabel: 'Business Branding',
    shortDescription: 'Banners, signage, vehicle branding',
    search: 'banners signage vehicle branding business branding',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200'
  }
];

export const defaultSiteContent: SiteContent = {
  homeHeroTitle: 'What do you want to create today?',
  homeHeroSubtitle: 'Personal items, custom designs, or full business branding — we have got you covered.',
  coreHeadline: 'Design. Print. Brand. — All in One Place.',
  coreSubtext: 'From personal style to business identity, we help you create, customize, and bring your ideas to life.',
  featuredTitle: 'Popular creations',
  featuredSubtitle: 'See what others are designing and ordering',
  howItWorksTitle: 'Simple steps to bring your idea to life',
  exploreTitle: 'Explore what you can create',
  exploreSubtitle: 'Browse ideas, styles, and custom options across personal and business needs.',
  customizeTitle: 'Customize your design',
  customizeSubtitle: 'Tell us what you want, and we will help you create it.',
  businessTitle: 'Branding for your business',
  businessSubtitle: 'From banners to vehicle branding, we help your business stand out.',
  categories: defaultCreationCategories
};

export function mergeSiteContent(data?: Partial<SiteContent> | null): SiteContent {
  return {
    ...defaultSiteContent,
    ...(data || {}),
    categories: Array.isArray(data?.categories) && data.categories.length > 0
      ? data.categories.map((category, index) => ({
          ...defaultCreationCategories[index % defaultCreationCategories.length],
          ...category
        }))
      : defaultSiteContent.categories
  };
}

export async function fetchSiteContent() {
  try {
    const snapshot = await getDocFromServer(doc(db, 'siteContent', 'main'));
    return mergeSiteContent(snapshot.exists() ? snapshot.data() as Partial<SiteContent> : null);
  } catch {
    return defaultSiteContent;
  }
}
