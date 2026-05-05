import { db, doc, getDocFromServer } from './firebase';

export interface CreationCategory {
  title: string;
  description: string;
  shortLabel: string;
  shortDescription: string;
  search: string;
  image: string;
}

export interface ServiceOffering {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  priceRange: string;
  search: string;
  image: string;
  order: number;
}

export interface SiteContent {
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroImage: string;
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
  services: ServiceOffering[];
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

export const defaultServiceOfferings: ServiceOffering[] = [
  {
    id: 'photo-mount',
    title: 'Photo Mount',
    description: 'Custom photo mounts designed and printed for homes, gifts, offices, and events.',
    category: 'Decor & Space',
    icon: 'Camera',
    priceRange: 'Quote after size',
    search: 'photo mount photo mounts mounted photos gifts wall display',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200',
    order: 1
  },
  {
    id: 'home-decor-stickers',
    title: 'Home Decor Stickers',
    description: 'Decor stickers for walls, rooms, furniture, and personal spaces.',
    category: 'Decor & Space',
    icon: 'Home',
    priceRange: 'Quote after size',
    search: 'home decor stickers wall stickers room decor',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=1200',
    order: 2
  },
  {
    id: 'laptop-phone-customization',
    title: 'Laptop & Phone Customization',
    description: 'Custom stickers, skins, and branding for laptops, phones, and everyday devices.',
    category: 'Devices',
    icon: 'Zap',
    priceRange: 'Quote after device',
    search: 'laptop phone stickers skins device customization',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200',
    order: 3
  },
  {
    id: 'portraits',
    title: 'Portraits',
    description: 'Graduation, personal, and custom portraits designed for print or display.',
    category: 'Personal',
    icon: 'Camera',
    priceRange: 'Quote after style',
    search: 'portraits graduation personal portrait print',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1200',
    order: 4
  },
  {
    id: 'jewellery-collection',
    title: 'Jewellery Collection',
    description: 'Necklaces, bracelets, waist beads, earrings, and custom-made wristbands.',
    category: 'Personal',
    icon: 'Heart',
    priceRange: 'Quote after item',
    search: 'jewellery jewelry necklaces bracelets waist beads wristbands earrings',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200',
    order: 5
  },
  {
    id: 'large-format-stickers',
    title: 'Large Format Stickers',
    description: 'Large stickers and prints for walls, windows, events, spaces, and promotions.',
    category: 'Decor & Space',
    icon: 'Package',
    priceRange: 'Quote after size',
    search: 'large format stickers large prints wall window event promotion',
    image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?auto=format&fit=crop&q=80&w=1200',
    order: 6
  },
  {
    id: 'banners',
    title: 'Banners',
    description: 'Banners for shops, events, promotions, launches, and business visibility.',
    category: 'Business & Branding',
    icon: 'ShoppingBag',
    priceRange: 'Quote after size',
    search: 'banners signage shop events promotions business',
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200',
    order: 7
  },
  {
    id: 'custom-design-print-brand',
    title: 'Custom Design, Print & Brand',
    description: 'Share any idea you want created. We design, print, and brand it for you.',
    category: 'Custom',
    icon: 'Sparkles',
    priceRange: 'Custom quote',
    search: 'custom desire design print brand any idea',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=1200',
    order: 8
  },
  {
    id: 'graffiti-vehicle-branding',
    title: 'Graffiti & Vehicle Branding',
    description: 'Custom graffiti, boda boda branding, car branding, and vehicle artwork.',
    category: 'Business & Branding',
    icon: 'Truck',
    priceRange: 'Quote after vehicle',
    search: 'graffiti boda boda vehicle car branding artwork',
    image: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&q=80&w=1200',
    order: 9
  }
];

export const defaultSiteContent: SiteContent = {
  homeHeroTitle: 'What do you want to create today?',
  homeHeroSubtitle: 'Personal items, custom designs, or full business branding — we have got you covered.',
  homeHeroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=2200',
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
  categories: defaultCreationCategories,
  services: defaultServiceOfferings
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
      : defaultSiteContent.categories,
    services: data && 'services' in data && Array.isArray(data.services)
      ? data.services.map((service, index) => ({
          ...defaultServiceOfferings[index % defaultServiceOfferings.length],
          ...service
        })).sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : defaultSiteContent.services
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
